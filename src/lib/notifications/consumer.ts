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
  intentData: IntentData,
  consumerPhone?: string
): Promise<void> {
  const adminChatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
  if (!adminChatId) {
    console.warn('ADMIN_TELEGRAM_CHAT_ID not set — skipping admin alert');
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://nida-sigma.vercel.app';
  const category = intentData.category?.split('.').pop()?.replace(/_/g, ' ') || 'Unknown service';
  const categoryFull = intentData.category?.replace(/\./g, ' › ') || category;
  const zone = intentData.location?.zone?.replace(/_/g, ' ') || 'Unknown zone';
  const urgency = intentData.urgency || 'unknown';
  const budget = intentData.budget
    ? `${intentData.budget.min ?? '?'}–${intentData.budget.max ?? '?'} ${intentData.budget.currency ?? 'QAR'}`
    : 'Not specified';

  const message =
    `🚨 <b>UNMATCHED REQUEST — Action Needed</b>\n\n` +
    `A consumer needs <b>${category}</b> but we have no provider in their area.\n\n` +
    `📋 Service: <b>${categoryFull}</b>\n` +
    `📍 Zone: <b>${zone}</b>\n` +
    `⚡ Urgency: <b>${urgency}</b>\n` +
    `💰 Budget: ${budget}\n` +
    (consumerPhone ? `📞 Consumer: <code>${consumerPhone}</code>\n` : '') +
    `\n` +
    `<b>What to do:</b>\n` +
    `1. Find a provider for ${zone} / ${category}\n` +
    `2. Register them: ${appUrl}/admin/businesses\n` +
    `3. Approve them — consumer will be auto-notified\n\n` +
    `👉 <a href="${appUrl}/admin/intents">View all unmatched requests</a>`;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (botToken) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        chat_id: adminChatId,
        text: message,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            { text: '📋 View Unmatched Requests', url: `${appUrl}/admin/intents` },
            { text: '➕ Add Provider', url: `${appUrl}/admin/businesses` },
          ]],
        },
      }),
    }).catch(() => sendTelegramReply(adminChatId, message));
  } else {
    await sendTelegramReply(adminChatId, message);
  }
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
    const intentId = negotiation.intent?.id;

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
      // For Telegram, include an inline cancel button so the consumer stays in control
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (botToken && intentId) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(8000),
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: message,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[
                { text: '❌ Cancel this request', callback_data: `cancel:${intentId}` },
              ]],
            },
          }),
        }).catch(err => console.error('Failed to send accepted notification:', err));
      } else {
        await sendTelegramReply(telegramChatId, message);
      }
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
export async function notifyConsumerEscalating(consumerId: string, nextRank?: number, totalMatches?: number): Promise<void> {
  const supabase = createServiceClient();

  try {
    const { data: consumer } = await supabase
      .from('consumers')
      .select('*')
      .eq('id', consumerId)
      .single();

    if (!consumer) return;

    const progressNote = nextRank && totalMatches
      ? ` (provider ${nextRank} of ${totalMatches})`
      : '';
    const message =
      `🔄 <b>Still on it!</b>\n\n` +
      `The first provider wasn't available — we're checking the next one${progressNote}.\n\n` +
      `You'll be notified as soon as someone confirms. Sit tight!`;

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
export async function notifyConsumerNoProviders(consumerId: string, intentId: string): Promise<void> {
  const supabase = createServiceClient();

  try {
    const [{ data: consumer }, { data: intent }] = await Promise.all([
      supabase.from('consumers').select('*').eq('id', consumerId).single(),
      supabase.from('intents').select('intent_data').eq('id', intentId).single(),
    ]);

    if (!consumer) return;

    const intentData = intent?.intent_data as IntentData | null;
    const category = intentData?.category?.split('.').pop()?.replace(/_/g, ' ') || 'service';
    const zone = intentData?.location?.zone?.replace(/_/g, ' ') || 'your area';

    const telegramMessage =
      `🔍 <b>On it — sourcing manually</b>\n\n` +
      `We don't have a verified provider for <b>${category}</b> in <b>${zone}</b> right now.\n\n` +
      `Our team has been alerted and is personally finding someone for you. You'll get a notification the moment we confirm a match — usually within the hour.\n\n` +
      `No action needed from you. We've got this. 💪`;

    const whatsappMessage =
      `🔍 On it — sourcing manually\n\n` +
      `We don't have a verified provider for ${category} in ${zone} right now.\n\n` +
      `Our team has been alerted and is personally finding someone for you. You'll hear from us the moment we confirm — usually within the hour.\n\n` +
      `No action needed from you. We've got this 💪`;

    const telegramChatId = consumer.telegram_chat_id ||
      (consumer.phone?.startsWith('tg:') ? consumer.phone.slice(3) : null);

    if (telegramChatId) {
      await sendTelegramReply(telegramChatId, telegramMessage);
    } else if (consumer.phone && !consumer.phone.startsWith('tg:')) {
      await sendWhatsAppReply(consumer.phone, whatsappMessage);
    }
  } catch (error) {
    console.error('notifyConsumerNoProviders error:', error);
  }
}
