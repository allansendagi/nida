import { NextResponse } from 'next/server';
import { processMessage } from '@/lib/conversations/service';
import { sendTelegramReply, telegramAdapter } from '@/lib/notifications/channels/telegram';
import { createServiceClient } from '@/lib/supabase/server';

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

    // After intent is created, ask for phone number
    if (result.intentCreated) {
      console.log(`Intent ${result.intentId} created from Telegram conversation with ${chatId}`);

      // Check if we already have a real phone number for this consumer
      const supabase = createServiceClient();
      const { data: consumer } = await supabase
        .from('consumers')
        .select('phone, telegram_chat_id')
        .eq('telegram_chat_id', chatId)
        .single();

      // If phone starts with 'tg:', they haven't provided a real phone yet
      if (consumer && consumer.phone.startsWith('tg:')) {
        // Ask for phone number with contact sharing button
        await sendPhoneNumberRequest(chatId);
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

  const supabase = createServiceClient();

  try {
    if (action === 'accept') {
      // Accept the lead
      const { error } = await supabase
        .from('negotiations')
        .update({
          state: 'accepted',
          offer_state: 'accepted',
          claimed_at: new Date().toISOString(),
        })
        .eq('id', negotiationId);

      if (error) {
        console.error('Failed to accept negotiation:', error);
        await telegramAdapter.answerCallbackQuery(callbackId, 'Failed to accept lead. Please try again.', true);
        return;
      }

      // Update the message to show accepted status
      await telegramAdapter.editMessageText(
        chatId,
        messageId,
        '✅ <b>Lead Accepted!</b>\n\nYou\'ve claimed this lead. The customer\'s contact information has been shared with you.\n\nPlease reach out to them promptly!'
      );

      await telegramAdapter.answerCallbackQuery(callbackId, '✅ Lead accepted successfully!');

      // Notify the consumer that a provider accepted their request
      await notifyConsumerOfAcceptance(negotiationId);

    } else if (action === 'decline') {
      // Decline the lead
      const { error } = await supabase
        .from('negotiations')
        .update({
          state: 'declined',
          offer_state: 'declined',
        })
        .eq('id', negotiationId);

      if (error) {
        console.error('Failed to decline negotiation:', error);
        await telegramAdapter.answerCallbackQuery(callbackId, 'Failed to decline lead. Please try again.', true);
        return;
      }

      // Update the message to show declined status
      await telegramAdapter.editMessageText(
        chatId,
        messageId,
        '❌ <b>Lead Declined</b>\n\nYou\'ve passed on this lead. It will be offered to another provider.'
      );

      await telegramAdapter.answerCallbackQuery(callbackId, 'Lead declined');

    } else {
      await telegramAdapter.answerCallbackQuery(callbackId, 'Unknown action');
    }
  } catch (error) {
    console.error('Error handling callback query:', error);
    await telegramAdapter.answerCallbackQuery(callbackId, 'An error occurred. Please try again.', true);
  }
}

/**
 * Notify consumer that a business has accepted their request
 */
async function notifyConsumerOfAcceptance(negotiationId: string): Promise<void> {
  const supabase = createServiceClient();

  try {
    // Get negotiation with intent, consumer, and business details
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
      console.error('Failed to fetch negotiation for consumer notification:', error);
      return;
    }

    const consumer = negotiation.intent?.consumer;
    const business = negotiation.business;

    if (!consumer?.telegram_chat_id) {
      console.log('Consumer does not have a Telegram chat ID, skipping notification');
      return;
    }

    // Build notification message
    const businessPhone = business?.phone || 'Contact through the platform';
    const businessName = business?.display_name || 'A service provider';

    const message =
      `🎉 <b>Great news!</b>\n\n` +
      `A service provider has accepted your request!\n\n` +
      `<b>${businessName}</b> will contact you shortly.\n\n` +
      `📞 Their phone: ${businessPhone}\n\n` +
      `Feel free to reach out to them directly if you don't hear back soon.`;

    await sendTelegramReply(consumer.telegram_chat_id, message);

    console.log(`Consumer ${consumer.id} notified of acceptance via Telegram`);
  } catch (error) {
    console.error('Error notifying consumer of acceptance:', error);
  }
}

/**
 * Send a request for phone number with contact sharing button
 */
async function sendPhoneNumberRequest(chatId: string): Promise<void> {
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
          text: "📞 <b>One more thing!</b>\n\nTo help the service provider contact you, please share your phone number.\n\nTap the button below to share it securely from your Telegram profile, or type it manually.",
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              [{ text: '📱 Share my phone number', request_contact: true }],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        }),
      }
    );
  } catch (error) {
    console.error('Error sending phone number request:', error);
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

  // Update the consumer's phone number
  const { error } = await supabase
    .from('consumers')
    .update({ phone: phoneNumber })
    .eq('telegram_chat_id', chatId);

  if (error) {
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
