import { createServiceClient } from '@/lib/supabase/server';
import { sendTelegramReply } from './channels/telegram';
import { sendWhatsAppReply } from './channels/whatsapp';
import type { IntentData } from '@/types/nomos';

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
 * Notify a consumer that no providers were found for their request,
 * with a promise to alert them when one becomes available.
 */
export async function notifyConsumerNoProviders(consumerId: string, intentId: string): Promise<void> {
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
