import { createServiceClient } from '@/lib/supabase/server';
import type {
  NotificationChannel,
  NotificationPayload,
  NotificationPreferences,
  ChannelAdapter,
} from './types';
import { TEMPLATES, type TemplateName } from './templates';
import { whatsappAdapter } from './channels/whatsapp';
import { emailAdapter } from './channels/email';
import { telegramAdapter } from './channels/telegram';
import type { Business, Negotiation, Intent } from '@/types/database';
import type { IntentData } from '@/types/nomos';

// Channel adapters registry
const adapters: Record<NotificationChannel, ChannelAdapter | null> = {
  whatsapp: whatsappAdapter,
  email: emailAdapter,
  telegram: telegramAdapter,
  sms: null, // TODO: Add Twilio adapter
  push: null, // TODO: Add push notification adapter
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  channels: ['whatsapp', 'email'],
  instant_alerts: true,
};

interface DispatchOptions {
  template?: TemplateName;
  channels?: NotificationChannel[];
  skipQuietHours?: boolean;
}

export async function dispatchNotifications(
  negotiations: Array<{
    negotiation: Negotiation;
    business: Business;
    intent: Intent;
  }>,
  options: DispatchOptions = {}
): Promise<{ sent: number; failed: number }> {
  const supabase = createServiceClient();
  const template = options.template || TEMPLATES.NEW_LEAD;
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  let sent = 0;
  let failed = 0;

  for (const { negotiation, business, intent } of negotiations) {
    const intentData = intent.intent_data as IntentData;
    const preferences = (business.notification_preferences as NotificationPreferences) || DEFAULT_PREFERENCES;

    // Check quiet hours
    if (!options.skipQuietHours && isQuietHours(preferences.quiet_hours)) {
      // Queue for later instead of sending now
      await queueNotification(supabase, negotiation.id, business.id, template, 'pending');
      continue;
    }

    // Build payload
    const payload: NotificationPayload = {
      businessId: business.id,
      businessName: business.display_name,
      businessPhone: business.phone,
      businessEmail: business.email || undefined,
      telegramChatId: business.telegram_chat_id || undefined,
      negotiationId: negotiation.id,
      intentId: intent.id,
      category: intentData.category,
      location: intentData.location.zone,
      urgency: intentData.urgency,
      matchScore: negotiation.match_score || 0,
      matchRank: negotiation.match_rank || 1,
      budgetRange: formatBudget(intentData.budget),
      specifics: intentData.specifics as Record<string, string> | undefined,
      claimUrl: `${baseUrl}/dashboard/leads/${negotiation.id}`,
    };

    // Determine channels to use - auto-prioritize Telegram when the business has it
    let channels = options.channels || preferences.channels;
    if (payload.telegramChatId && !channels.includes('telegram')) {
      channels = ['telegram', ...channels];
    }

    // Try each channel in order
    for (const channel of channels) {
      const adapter = adapters[channel];
      if (!adapter) continue;

      // Skip email if no email address
      if (channel === 'email' && !business.email) continue;

      // Skip telegram if no chat ID
      if (channel === 'telegram' && !payload.telegramChatId) continue;

      try {
        const result = await adapter.send(payload, template);

        // Record notification
        await supabase.from('notifications').insert({
          negotiation_id: negotiation.id,
          business_id: business.id,
          channel,
          status: result.success ? 'sent' : 'failed',
          external_id: result.externalId,
          sent_at: result.success ? new Date().toISOString() : null,
          failed_at: result.success ? null : new Date().toISOString(),
          failure_reason: result.error,
          template,
          payload,
          attempts: 1,
        });

        if (result.success) {
          sent++;
          // Update negotiation notified_at if not already set
          if (!negotiation.notified_at) {
            await supabase
              .from('negotiations')
              .update({ notified_at: new Date().toISOString() })
              .eq('id', negotiation.id);
          }
          // For urgent leads (asap/same_day), blast all channels — don't stop at first success
          const isUrgent = intentData.urgency === 'asap' || intentData.urgency === 'same_day';
          if (!isUrgent) break; // Non-urgent: first success is enough
        } else {
          console.error(`Failed to send ${channel} notification:`, result.error);
        }
      } catch (error) {
        console.error(`Error sending ${channel} notification:`, error);
        failed++;
      }
    }
  }

  return { sent, failed };
}

// Dispatch for a single negotiation (convenience wrapper)
export async function dispatchSingleNotification(
  negotiationId: string,
  options: DispatchOptions = {}
): Promise<boolean> {
  const supabase = createServiceClient();

  const { data: negotiation } = await supabase
    .from('negotiations')
    .select(`
      *,
      business:businesses (*),
      intent:intents (*)
    `)
    .eq('id', negotiationId)
    .single();

  if (!negotiation) return false;

  const result = await dispatchNotifications(
    [{
      negotiation,
      business: negotiation.business,
      intent: negotiation.intent,
    }],
    options
  );

  return result.sent > 0;
}

// Queue notification for later (quiet hours, retry, etc.)
async function queueNotification(
  supabase: ReturnType<typeof createServiceClient>,
  negotiationId: string,
  businessId: string,
  template: string,
  status: 'pending' | 'failed'
) {
  const nextRetry = new Date();
  nextRetry.setHours(7, 0, 0, 0); // Next 7 AM
  if (nextRetry < new Date()) {
    nextRetry.setDate(nextRetry.getDate() + 1);
  }

  await supabase.from('notifications').insert({
    negotiation_id: negotiationId,
    business_id: businessId,
    channel: 'whatsapp', // Primary channel
    status,
    template,
    next_retry_at: nextRetry.toISOString(),
    attempts: 0,
  });
}

// Check if current time is within quiet hours
function isQuietHours(quietHours?: { start: string; end: string }): boolean {
  if (!quietHours) return false;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const [startHour, startMin] = quietHours.start.split(':').map(Number);
  const [endHour, endMin] = quietHours.end.split(':').map(Number);
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  // Handle overnight quiet hours (e.g., 22:00 to 07:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime < endTime;
  }

  return currentTime >= startTime && currentTime < endTime;
}

function formatBudget(budget?: { min?: number; max?: number }): string | undefined {
  if (!budget) return undefined;
  if (budget.min && budget.max) return `${budget.min}-${budget.max} QAR`;
  if (budget.max) return `Up to ${budget.max} QAR`;
  if (budget.min) return `From ${budget.min} QAR`;
  return undefined;
}

// Process queued/failed notifications (call from cron job)
export async function processNotificationQueue(): Promise<{ processed: number }> {
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  // Get pending notifications that are due
  const { data: pending } = await supabase
    .from('notifications')
    .select('*')
    .in('status', ['pending', 'failed'])
    .lt('next_retry_at', now)
    .lt('attempts', 3)
    .limit(50);

  if (!pending || pending.length === 0) {
    return { processed: 0 };
  }

  let processed = 0;

  for (const notification of pending) {
    const success = await dispatchSingleNotification(notification.negotiation_id, {
      template: notification.template as TemplateName,
      channels: [notification.channel as NotificationChannel],
    });

    if (success) {
      processed++;
    } else {
      // Schedule retry
      const nextRetry = new Date();
      nextRetry.setMinutes(nextRetry.getMinutes() + 15 * Math.pow(2, notification.attempts));

      await supabase
        .from('notifications')
        .update({
          attempts: notification.attempts + 1,
          next_retry_at: nextRetry.toISOString(),
        })
        .eq('id', notification.id);
    }
  }

  return { processed };
}
