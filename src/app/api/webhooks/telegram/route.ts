import { NextResponse } from 'next/server';
import { processMessage } from '@/lib/conversations/service';
import { sendTelegramReply, telegramAdapter } from '@/lib/notifications/channels/telegram';
import { createServiceClient } from '@/lib/supabase/server';
import { acceptOffer, rejectOffer } from '@/lib/notifications/sequential';
import { notifyConsumerAccepted } from '@/lib/notifications/consumer';
import { getRedis } from '@/lib/redis';
import { validateEnv } from '@/lib/config/validate-env';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Telegram webhook handler
 * Receives updates for messages and callback queries (button clicks)
 */
export async function POST(request: Request) {
  // Fail fast if required env vars are missing
  const envCheck = validateEnv();
  if (!envCheck.ok) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

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

  // Deduplicate: skip if we've already processed this exact message
  // Telegram retries webhooks if the server doesn't respond in time, causing duplicates
  const redis = getRedis();
  if (redis && message.message_id) {
    const dedupKey = `tg_msg:${chatId}:${message.message_id}`;
    const seen = await redis.get(dedupKey).catch(() => null);
    if (seen) {
      console.log(`Skipping duplicate message ${message.message_id} from ${chatId}`);
      return;
    }
    await redis.set(dedupKey, '1', { ex: 300 }).catch(() => {}); // 5 min TTL
  }

  // Rate limiting: max 10 messages per 60 seconds per chatId
  if (redis) {
    const rateKey = `rate:tg:${chatId}`;
    const count = await redis.incr(rateKey).catch(() => null);
    if (count === 1) await redis.expire(rateKey, 60).catch(() => {});
    if (count !== null && count > 10) {
      await sendTelegramReply(chatId, "You're sending messages too fast. Please wait a moment and try again.");
      return;
    }
  }

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
    // Clear the awaiting_phone flag
    const redis = getRedis();
    if (redis) await redis.del(`awaiting_phone:${chatId}`).catch(() => {});

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

  // Check if we're waiting for a manually typed phone number
  // This handles the case where the user types their number instead of using the button
  const phonePattern = /^\+?[\d\s\-\(\)]{7,15}$/;
  if (phonePattern.test(text.trim())) {
    const redis = getRedis();
    const awaitingPhone = redis ? await redis.get(`awaiting_phone:${chatId}`).catch(() => null) : null;

    if (awaitingPhone) {
      await redis!.del(`awaiting_phone:${chatId}`).catch(() => {});
      await saveTypedPhoneNumber(chatId, text.trim());
      return;
    }
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

  // Handle business Telegram linking: /start link-CODE or /link CODE
  const linkMatch =
    text.match(/^\/start link-([A-Z0-9]{6})$/i) ||
    text.match(/^\/link ([A-Z0-9]{6})$/i);

  if (linkMatch) {
    await handleBusinessTelegramLink(chatId, linkMatch[1].toUpperCase());
    return;
  }

  console.log(`Processing Telegram message from ${chatId}: ${text}`);

  // Send typing indicator while processing — shows "typing..." bubble to user
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (botToken) {
    fetch(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
    }).catch(() => {}); // fire-and-forget, don't block on failure
  }

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

  if (!negotiationId || !UUID_REGEX.test(negotiationId) || !['accept', 'decline'].includes(action)) {
    await telegramAdapter.answerCallbackQuery(callbackId, 'Invalid request', true);
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

      // Fetch negotiation + consumer contact to share with business
      const supabase = createServiceClient();
      const { data: neg } = await supabase
        .from('negotiations')
        .select('*, intent:intents(*, consumer:consumers(*))')
        .eq('id', negotiationId)
        .single();

      // Build consumer contact message for the business
      let contactLine = 'Customer is on Telegram — they will receive your contact details.';
      if (neg?.intent?.consumer) {
        const c = neg.intent.consumer;
        const consumerPhone = c.phone;
        const telegramId = c.telegram_chat_id || (consumerPhone?.startsWith('tg:') ? consumerPhone.slice(3) : null);
        if (consumerPhone && !consumerPhone.startsWith('tg:')) {
          contactLine = `📞 Customer phone: <b>${consumerPhone}</b>`;
        } else if (telegramId) {
          contactLine = `💬 Customer is Telegram-only — they've been sent your contact details.`;
        }
      }

      await telegramAdapter.editMessageText(
        chatId,
        messageId,
        `✅ <b>Lead Accepted!</b>\n\n${contactLine}\n\nPlease reach out to them promptly — they're waiting!`
      );

      await telegramAdapter.answerCallbackQuery(callbackId, '✅ Lead accepted!');

      // Create execution record so dashboard shows contact info
      if (neg?.intent) {
        const { generateExecutionId } = await import('@/lib/utils');
        void supabase.from('executions').insert({
          execution_id: generateExecutionId(),
          negotiation_id: negotiationId,
          agreed_terms: { price: 0, currency: 'QAR', date: new Date().toISOString(), warranty_days: 0, payment_method: 'tbd', cancellation: { free_until: new Date().toISOString(), fee: 0 } },
          status: 'confirmed',
          consumer_contact: {
            name: neg.intent.consumer?.name || 'Customer',
            ...(neg.intent.consumer?.phone && !neg.intent.consumer.phone.startsWith('tg:')
              ? { phone: neg.intent.consumer.phone }
              : {}),
            ...(neg.intent.consumer?.telegram_chat_id
              ? { telegram_chat_id: neg.intent.consumer.telegram_chat_id, contact_method: 'telegram' }
              : {}),
          },
        });

        // Update intent to executing
        await supabase.from('intents').update({ status: 'executing' }).eq('id', neg.intent.id);
      }

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

  // Set Redis flag so manually typed numbers are intercepted (10 min TTL)
  const redis = getRedis();
  if (redis) {
    await redis.set(`awaiting_phone:${chatId}`, '1', { ex: 600 }).catch(() => {});
  }

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
 * Save a phone number that the user typed manually (instead of using the share button)
 */
async function saveTypedPhoneNumber(chatId: string, rawNumber: string): Promise<void> {
  const supabase = createServiceClient();

  // Normalize: strip spaces/dashes/parens, then handle prefix variants
  let phone = rawNumber.replace(/[\s\-\(\)]/g, '');

  if (phone.startsWith('00974')) {
    // International dial prefix for Qatar: 00974 → +974
    phone = '+974' + phone.slice(5);
  } else if (phone.startsWith('+974') && phone.length === 12) {
    // Already correct E.164 Qatar number
  } else if (/^[3-7]\d{7}$/.test(phone)) {
    // 8-digit Qatar local number
    phone = '+974' + phone;
  } else if (!phone.startsWith('+')) {
    phone = '+' + phone;
  }

  // Enforce E.164 max length (15 digits + '+')
  if (phone.length > 16) {
    phone = phone.slice(0, 16);
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  // Find consumer by telegram_chat_id or legacy tg: phone — then update by ID
  let consumerId: string | null = null;

  const { data: byTelegramId } = await supabase
    .from('consumers').select('id').eq('telegram_chat_id', chatId).single();
  if (byTelegramId) {
    consumerId = byTelegramId.id;
  } else {
    const { data: byLegacy } = await supabase
      .from('consumers').select('id').eq('phone', `tg:${chatId}`).single();
    if (byLegacy) consumerId = byLegacy.id;
  }

  if (!consumerId) {
    console.error(`No consumer found for chatId ${chatId} when saving typed phone`);
    if (botToken) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: "❌ Sorry, I couldn't save that number. Please try the Share button above, or contact support.",
          reply_markup: { remove_keyboard: true },
        }),
      });
    }
    return;
  }

  const { error } = await supabase
    .from('consumers')
    .update({ phone, telegram_chat_id: chatId })
    .eq('id', consumerId);

  if (error) {
    console.error('Failed to save typed phone number:', error);
    if (botToken) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: "❌ Sorry, I couldn't save that number. Please try the Share button above, or contact support.",
          reply_markup: { remove_keyboard: true },
        }),
      });
    }
    return;
  }

  // Confirm and remove keyboard
  if (botToken) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `✅ <b>Got it!</b>\n\nYour number (<code>${phone}</code>) has been saved. Providers can now reach you directly by phone.`,
        parse_mode: 'HTML',
        reply_markup: { remove_keyboard: true },
      }),
    });
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

  // Step 1: Find this consumer's ID (by telegram_chat_id or legacy tg: phone)
  let consumerId: string | null = null;

  const { data: byTelegramId } = await supabase
    .from('consumers')
    .select('id')
    .eq('telegram_chat_id', chatId)
    .single();

  if (byTelegramId) {
    consumerId = byTelegramId.id;
  } else {
    const { data: byLegacyPhone } = await supabase
      .from('consumers')
      .select('id')
      .eq('phone', `tg:${chatId}`)
      .single();
    if (byLegacyPhone) consumerId = byLegacyPhone.id;
  }

  if (!consumerId) {
    console.error(`No consumer found for chatId ${chatId}`);
    await sendTelegramReply(chatId, "Sorry, I couldn't save your phone number. Please try again or type it manually.");
    return;
  }

  // Step 2: Check if another consumer already owns this phone (UNIQUE constraint)
  const { data: existingWithPhone } = await supabase
    .from('consumers')
    .select('id')
    .eq('phone', phoneNumber)
    .neq('id', consumerId)
    .single();

  if (existingWithPhone) {
    // Merge: re-point all intents/conversations before deleting duplicate consumer
    await supabase.from('intents').update({ consumer_id: existingWithPhone.id }).eq('consumer_id', consumerId);
    await supabase.from('conversations').update({ consumer_id: existingWithPhone.id }).eq('consumer_id', consumerId);
    await supabase.from('consumers').update({ telegram_chat_id: chatId }).eq('id', existingWithPhone.id);
    await supabase.from('consumers').delete().eq('id', consumerId);
    console.log(`Merged consumer ${consumerId} into ${existingWithPhone.id} for phone ${phoneNumber}`);
  } else {
    // Update by ID — reliable, no chaining issues
    const { error } = await supabase
      .from('consumers')
      .update({ phone: phoneNumber, telegram_chat_id: chatId })
      .eq('id', consumerId);

    if (error) {
      console.error(`Failed to save phone for chat ${chatId}:`, error);
      await sendTelegramReply(chatId, "Sorry, I couldn't save your phone number. Please try again or type it manually.");
      return;
    }
  }

  console.log(`Phone ${phoneNumber} saved for consumer ${consumerId} (chat ${chatId})`);

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

/**
 * Link a business's Telegram account using a one-time code generated from the dashboard.
 */
async function handleBusinessTelegramLink(chatId: string, code: string): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    await sendTelegramReply(chatId, '❌ Link service is temporarily unavailable. Please try again in a moment.');
    return;
  }

  const key = `tg_link:${code}`;
  const record = await redis.get<{ businessId: string; displayName: string }>(key);

  if (!record) {
    await sendTelegramReply(
      chatId,
      '❌ That code is invalid or has expired. Please generate a new code from your Nida dashboard.'
    );
    return;
  }

  const supabase = createServiceClient();

  const { error } = await supabase
    .from('businesses')
    .update({ telegram_chat_id: chatId })
    .eq('id', record.businessId);

  if (error) {
    console.error('Failed to link business telegram_chat_id:', error);
    await sendTelegramReply(chatId, '❌ Something went wrong. Please try again or contact support.');
    return;
  }

  // Delete the code so it can't be reused
  await redis.del(key);

  await sendTelegramReply(
    chatId,
    `✅ <b>Telegram linked!</b>\n\n` +
    `Your account is now connected to <b>${record.displayName}</b> on Nida.\n\n` +
    `You'll receive new leads here with one-tap Accept/Decline buttons. 🎉`
  );

  console.log(`Business ${record.businessId} (${record.displayName}) linked Telegram chat ${chatId}`);
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
