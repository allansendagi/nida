import { createServiceClient } from '@/lib/supabase/server';
import { sendTelegramReply } from './channels/telegram';
import { sendWhatsAppReply } from './channels/whatsapp';
import type { IntentData } from '@/types/nomos';

/**
 * Send an alert to the admin Telegram account when a lead has no providers.
 * Requires ADMIN_TELEGRAM_CHAT_ID env var.
 */
export async function notifyAdminNoProviders(
  intentId: string,
  intentData: IntentData
): Promise<void> {
  const adminChatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
  if (!adminChatId) {
    console.warn('ADMIN_TELEGRAM_CHAT_ID not set — skipping admin alert');
    return;
  }

  const category = intentData.category?.replace(/\./g, ' › ') || 'Unknown';
  const zone = intentData.location?.zone?.replace(/_/g, ' ') || 'Unknown zone';
  const urgency = intentData.urgency || 'unknown';

  const message =
    `⚠️ <b>No Providers Found</b>\n\n` +
    `A consumer request went unmatched:\n` +
    `📋 Category: <b>${category}</b>\n` +
    `📍 Zone: <b>${zone}</b>\n` +
    `⚡ Urgency: ${urgency}\n\n` +
    `Intent ID: <code>${intentId}</code>\n\n` +
    `Approve a provider in this zone/category to trigger an automatic consumer re-alert.`;

  await sendTelegramReply(adminChatId, message);
}

/**
 * Notify a consumer that a service provider has accepted their request.
 * Sends via Telegram if consumer has telegram_chat_id, otherwise WhatsApp.
 */
export async function notifyConsumerAccepted(negotiationId: string): Promise<void> {
  const supabase = createServiceClient();

  try {
    const { data: negotiation, error } = await supabase
      .from('negotiations')
      .select(`
        *,
        intent:intents (
          *,
          consumer:consumers (*)
        ),
        business:businesses (*)
      `)
      .eq('id', negotiationId)
      .single();

    if (error || !negotiation) {
      console.error('notifyConsumerAccepted: negotiation not found', error);
      return;
    }

    const consumer = negotiation.intent?.consumer;
    const business = negotiation.business;
    const intentData = negotiation.intent?.intent_data as IntentData | undefined;

    if (!consumer || !business) {
      console.error('notifyConsumerAccepted: missing consumer or business data');
      return;
    }

    const businessName = business.display_name || 'A service provider';
    const businessPhone = business.phone || null;
    const category = intentData?.category?.split('.').pop()?.replace(/_/g, ' ') || 'your service';

    const message =
      `🎉 <b>Great news!</b>\n\n` +
      `<b>${businessName}</b> has accepted your ${category} request and will be in touch shortly.\n\n` +
      (businessPhone ? `📞 Their number: <b>${businessPhone}</b>\n\n` : '') +
      `Feel free to reach out to them directly if you don't hear back soon.\n\n` +
      `After the job is done, we'll ask you to rate the experience. Your feedback helps the whole community!`;

    // Try Telegram first
    const telegramChatId = consumer.telegram_chat_id ||
      (consumer.phone?.startsWith('tg:') ? consumer.phone.slice(3) : null);

    if (telegramChatId) {
      await sendTelegramReply(telegramChatId, message);
      console.log(`Consumer ${consumer.id} notified via Telegram (chat: ${telegramChatId})`);
      return;
    }

    // Fallback to WhatsApp if consumer has a real phone number
    if (consumer.phone && !consumer.phone.startsWith('tg:')) {
      // WhatsApp doesn't support HTML, strip tags
      const plainMessage = message.replace(/<[^>]+>/g, '');
      await sendWhatsAppReply(consumer.phone, plainMessage);
      console.log(`Consumer ${consumer.id} notified via WhatsApp (${consumer.phone})`);
      return;
    }

    console.log(`notifyConsumerAccepted: no channel available for consumer ${consumer.id}`);
  } catch (error) {
    console.error('notifyConsumerAccepted error:', error);
  }
}

/**
 * Notify a consumer that their request is being escalated to the next provider
 * (previous provider was unavailable or didn't respond in time).
 */
export async function notifyConsumerEscalating(consumerId: string): Promise<void> {
  const supabase = createServiceClient();

  try {
    const { data: consumer } = await supabase
      .from('consumers')
      .select('*')
      .eq('id', consumerId)
      .single();

    if (!consumer) return;

    const message =
      `🔄 Still working on it — the first provider wasn't available, ` +
      `so we're reaching out to the next one on your list.\n\n` +
      `Hang tight, you'll be notified as soon as someone confirms.`;

    const telegramChatId = consumer.telegram_chat_id ||
      (consumer.phone?.startsWith('tg:') ? consumer.phone.slice(3) : null);

    if (telegramChatId) {
      await sendTelegramReply(telegramChatId, message);
    } else if (consumer.phone && !consumer.phone.startsWith('tg:')) {
      await sendWhatsAppReply(consumer.phone, message);
    }
  } catch (error) {
    console.error('notifyConsumerEscalating error:', error);
  }
}

/**
 * Notify a consumer that no providers were found for their request,
 * with a promise to alert them when one becomes available.
 */
export async function notifyConsumerNoProviders(consumerId: string, _intentId: string): Promise<void> {
  const supabase = createServiceClient();

  try {
    const { data: consumer } = await supabase
      .from('consumers')
      .select('*')
      .eq('id', consumerId)
      .single();

    if (!consumer) return;

    const message =
      `😔 We couldn't find a matching provider right now.\n\n` +
      `We've saved your request and will notify you the moment someone becomes available in your area.\n\n` +
      `You don't need to do anything — just sit tight!`;

    const telegramChatId = consumer.telegram_chat_id ||
      (consumer.phone?.startsWith('tg:') ? consumer.phone.slice(3) : null);

    if (telegramChatId) {
      await sendTelegramReply(telegramChatId, message);
    } else if (consumer.phone && !consumer.phone.startsWith('tg:')) {
      await sendWhatsAppReply(consumer.phone, message);
    }
  } catch (error) {
    console.error('notifyConsumerNoProviders error:', error);
  }
}
