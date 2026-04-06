import { NextResponse } from 'next/server';
import { processMessage } from '@/lib/conversations/service';
import { sendTelegramReply, telegramAdapter } from '@/lib/notifications/channels/telegram';
import { createServiceClient } from '@/lib/supabase/server';
import { acceptOffer, rejectOffer } from '@/lib/notifications/sequential';
import { notifyConsumerAccepted } from '@/lib/notifications/consumer';

/**
 * Telegram webhook handler
 * Receives updates for messages and callback queries (button clicks)
 */
export async function POST(request: Request) {
  try {
    // Verify the webhook secret from URL parameter
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      console.error('Invalid Telegram webhook secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Log incoming webhook for debugging
    console.log('Telegram webhook received:', JSON.stringify(body, null, 2));

    // Handle regular messages
    if (body.message) {
      await handleMessage(body.message);
    }

    // Handle callback queries (button clicks)
    if (body.callback_query) {
      await handleCallbackQuery(body.callback_query);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    // Still return 200 to prevent retries
    return NextResponse.json({ ok: true });
  }
}

/**
 * Handle incoming text messages
 */
async function handleMessage(message: TelegramMessage): Promise<void> {
  const chatId = String(message.chat.id);
  const text = message.text;

  // Handle contact sharing (phone number)
  if (message.contact) {
    await handleContactSharing(chatId, message.contact);
    return;
  }

  if (!text) {
    // Ignore non-text messages for now
    console.log('Ignoring non-text message from chat:', chatId);
    return;
  }

  // Handle /start command
  if (text === '/start') {
    await sendTelegramReply(
      chatId,
      "Welcome to Nida! 👋\n\nI can help you find service providers in Qatar.\n\nJust tell me what you're looking for, for example:\n• \"I need an AC repair technician in West Bay\"\n• \"Looking for a plumber urgently in The Pearl\"\n• \"Need a home cleaning service this week\"\n\nWhat can I help you find today?"
    );
    return;
  }

  // Handle "no thanks" response to optional phone sharing
  if (text === '💬 No thanks, use Telegram only') {
    await sendTelegramReply(
      chatId,
      "No problem! You'll receive all updates right here in Telegram. 👍"
    );
    // Remove the keyboard
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: "We'll notify you here as soon as a provider responds.",
          reply_markup: { remove_keyboard: true },
        }),
      });
    }
    return;
  }

  // Handle /help command
  if (text === '/help') {
    await sendTelegramReply(
      chatId,
      "Here's how to use Nida:\n\n" +
      "1. Tell me what service you need\n" +
      "2. I'll ask a few questions to understand your requirements\n" +
      "3. I'll match you with the best service providers\n" +
      "4. They'll contact you with quotes\n\n" +
      "Just describe what you need and I'll take care of the rest!"
    );
    return;
  }

  console.log(`Processing Telegram message from ${chatId}: ${text}`);

  try {
    // Use chat ID as the phone identifier for Telegram users
    // Prefix with 'tg:' to distinguish from phone numbers
    const telegramIdentifier = `tg:${chatId}`;

    // Process through conversation service (AI intake)
    const result = await processMessage(telegramIdentifier, text);

    console.log(`AI response for Telegram ${chatId}:`, {
      intentCreated: result.intentCreated,
      intentId: result.intentId,
      responseLength: result.response.length,
    });

    // Send response back to user via Telegram
    const sendResult = await sendTelegramReply(chatId, result.response);

    if (sendResult.success) {
      console.log(`Reply sent to Telegram ${chatId}, messageId: ${sendResult.messageId}`);
    } else {
      console.error(`Failed to send reply to Telegram ${chatId}:`, sendResult.error);
    }

    // After intent is created, offer optional phone sharing
    if (result.intentCreated) {
      console.log(`Intent ${result.intentId} created from Telegram conversation with ${chatId}`);

      const supabase = createServiceClient();

      // Check if consumer already has a real phone number
      let hasPhone = false;
      const { data: consumerByTelegram } = await supabase
        .from('consumers')
        .select('phone, telegram_chat_id')
        .eq('telegram_chat_id', chatId)
        .single();

      if (consumerByTelegram?.phone && !consumerByTelegram.phone.startsWith('tg:')) {
        hasPhone = true;
      } else if (!consumerByTelegram) {
        // Migrate legacy tg: phone record
        const { data: legacyConsumer } = await supabase
          .from('consumers')
          .select('phone, telegram_chat_id')
          .eq('phone', `tg:${chatId}`)
          .single();

        if (legacyConsumer) {
          await supabase
            .from('consumers')
            .update({ telegram_chat_id: chatId })
            .eq('phone', `tg:${chatId}`);
          hasPhone = legacyConsumer.phone ? !legacyConsumer.phone.startsWith('tg:') : false;
        }
      }

      // Only ask if they haven't shared a number yet
      if (!hasPhone) {
        await sendOptionalPhoneRequest(chatId);
      }
    }
  } catch (error) {
    console.error(`Error processing Telegram message from ${chatId}:`, error);

    // Try to send error message to user
    try {
      await sendTelegramReply(
        chatId,
        "I'm sorry, I encountered an issue. Please try again in a moment."
      );
    } catch (sendError) {
      console.error('Failed to send error message:', sendError);
    }
  }
}

/**
 * Handle callback queries (inline button clicks)
 */
async function handleCallbackQuery(callbackQuery: TelegramCallbackQuery): Promise<void> {
  const callbackId = callbackQuery.id;
  const chatId = String(callbackQuery.message?.chat.id);
  const messageId = String(callbackQuery.message?.message_id);
  const data = callbackQuery.data;

  if (!data) {
    await telegramAdapter.answerCallbackQuery(callbackId, 'Invalid action');
    return;
  }

  console.log(`Telegram callback from ${chatId}: ${data}`);

  // Parse callback data (format: "action:negotiationId")
  const [action, negotiationId] = data.split(':');

  if (!negotiationId) {
    await telegramAdapter.answerCallbackQuery(callbackId, 'Invalid callback data');
    return;
  }

  try {
    if (action === 'accept') {
      const result = await acceptOffer(negotiationId);

      if (!result.success) {
        console.error('Failed to accept offer:', result.error);
        await telegramAdapter.answerCallbackQuery(callbackId, result.error || 'Failed to accept lead.', true);
        return;
      }

      await telegramAdapter.editMessageText(
        chatId,
        messageId,
        '✅ <b>Lead Accepted!</b>\n\nYou\'ve claimed this lead. The customer\'s contact details will be shared with you.\n\nPlease reach out to them promptly — they\'re waiting!'
      );

      await telegramAdapter.answerCallbackQuery(callbackId, '✅ Lead accepted!');

      // Notify the consumer via their channel (Telegram or WhatsApp)
      await notifyConsumerAccepted(negotiationId);

    } else if (action === 'decline') {
      const result = await rejectOffer(negotiationId, 'Business declined via Telegram');

      if (!result.success) {
        console.error('Failed to decline offer:', result.error);
        await telegramAdapter.answerCallbackQuery(callbackId, 'Failed to decline lead.', true);
        return;
      }

      await telegramAdapter.editMessageText(
        chatId,
        messageId,
        '❌ <b>Lead Passed</b>\n\nYou\'ve passed on this lead. It\'s been offered to the next available provider.'
      );

      await telegramAdapter.answerCallbackQuery(callbackId, 'Lead passed to next provider');

    } else {
      await telegramAdapter.answerCallbackQuery(callbackId, 'Unknown action');
    }
  } catch (error) {
    console.error('Error handling callback query:', error);
    await telegramAdapter.answerCallbackQuery(callbackId, 'An error occurred. Please try again.', true);
  }
}

/**
 * Offer optional phone number sharing after intent is created.
 * The provider can be notified via Telegram even without a phone number,
 * but sharing a number lets them call directly.
 */
async function sendOptionalPhoneRequest(chatId: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return;

  try {
    await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: "📞 <b>One quick thing</b> — want the provider to be able to call you directly?\n\nSharing your number means they can reach you by phone. You'll get updates here either way.",
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              [{ text: '📱 Share my number', request_contact: true }],
              [{ text: '💬 No thanks, use Telegram only' }],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        }),
      }
    );
  } catch (error) {
    console.error('Error sending optional phone request:', error);
  }
}

/**
 * Handle contact sharing from user
 */
async function handleContactSharing(chatId: string, contact: TelegramContact): Promise<void> {
  const supabase = createServiceClient();

  // Format phone number (ensure it has + prefix)
  let phoneNumber = contact.phone_number;
  if (!phoneNumber.startsWith('+')) {
    phoneNumber = '+' + phoneNumber;
  }

  console.log(`Received phone number from Telegram ${chatId}: ${phoneNumber}`);

  // Try to update by telegram_chat_id first (new format)
  let { data: updated, error } = await supabase
    .from('consumers')
    .update({ phone: phoneNumber })
    .eq('telegram_chat_id', chatId)
    .select()
    .single();

  // If no rows updated, try by phone field (legacy format)
  if (!updated) {
    const result = await supabase
      .from('consumers')
      .update({ phone: phoneNumber, telegram_chat_id: chatId })
      .eq('phone', `tg:${chatId}`)
      .select()
      .single();

    updated = result.data;
    error = result.error;
  }

  if (error || !updated) {
    console.error('Failed to update consumer phone:', error);
    await sendTelegramReply(
      chatId,
      "Sorry, I couldn't save your phone number. Please try again or type it manually."
    );
    return;
  }

  // Remove the keyboard and confirm
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (botToken) {
    await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `✅ <b>Thank you!</b>\n\nYour phone number (${phoneNumber}) has been saved. Service providers will now be able to contact you directly.\n\nWe'll notify you here when a provider accepts your request!`,
          parse_mode: 'HTML',
          reply_markup: {
            remove_keyboard: true,
          },
        }),
      }
    );
  }
}

// Telegram types
interface TelegramContact {
  phone_number: string;
  first_name: string;
  last_name?: string;
  user_id?: number;
}

interface TelegramMessage {
  message_id: number;
  from?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  chat: {
    id: number;
    type: 'private' | 'group' | 'supergroup' | 'channel';
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  date: number;
  text?: string;
  contact?: TelegramContact;
}

interface TelegramCallbackQuery {
  id: string;
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  message?: TelegramMessage;
  chat_instance: string;
  data?: string;
}
