import { NextResponse } from 'next/server';
import { processMessage } from '@/lib/conversations/service';
import { sendWhatsAppReply, sendWhatsAppReaction, markWhatsAppMessageRead } from '@/lib/notifications/channels/whatsapp';
import { sendTelegramReply } from '@/lib/notifications/channels/telegram';
import { createServiceClient } from '@/lib/supabase/server';
import { getRedis } from '@/lib/redis';
import crypto from 'crypto';

/**
 * Verify WhatsApp webhook signature using HMAC-SHA256
 */
function verifySignature(payload: string, signature: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  if (!appSecret) {
    console.error('WHATSAPP_APP_SECRET environment variable is not set');
    return false;
  }

  if (!signature) {
    console.error('Missing X-Hub-Signature-256 header');
    return false;
  }

  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// WhatsApp Webhook Verification (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified');
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// WhatsApp Message Handler (POST)
export async function POST(request: Request) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    // Verify signature — return 200 even on failure so WhatsApp doesn't retry
    if (!verifySignature(rawBody, signature)) {
      console.error('Invalid WhatsApp webhook signature — dropping request');
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const body = JSON.parse(rawBody);

    // Log incoming webhook for debugging
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Extract message data
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value?.messages) {
      for (const message of value.messages) {
        const from = message.from; // sender phone number

        if (message.type === 'text') {
          const text = message.text?.body;
          console.log(`Message from ${from}: ${text}`);
          await processWhatsAppMessage(from, text, message.id);
        }

        // Handle interactive list replies (e.g. rating selections)
        if (message.type === 'interactive' && message.interactive?.type === 'list_reply') {
          const replyId: string = message.interactive.list_reply.id;
          if (replyId.startsWith('rate:')) {
            const parts = replyId.split(':');
            const score = parseInt(parts[1]);
            const executionId = parts[2];
            await handleWhatsAppRating(from, score, executionId);
          }
        }
      }
    }

    // Handle status updates (delivery, read receipts)
    if (value?.statuses) {
      for (const status of value.statuses) {
        console.log(`Message ${status.id} status: ${status.status}`);
        // Could update notification records here if needed
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ status: 'received' });
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    // Still return 200 to prevent retries
    return NextResponse.json({ status: 'error' });
  }
}

/**
 * Process an incoming WhatsApp message through the AI intake flow
 */
async function handleWhatsAppCancel(phone: string): Promise<void> {
  const supabase = createServiceClient();

  // Find ALL consumers with this phone — duplicate records can exist if .single() ever
  // errored during consumer creation, causing multiple rows for the same phone number
  const { data: consumers } = await supabase
    .from('consumers')
    .select('id')
    .eq('phone', phone);

  if (!consumers || consumers.length === 0) {
    await sendWhatsAppReply(phone, "No active request found to cancel.");
    return;
  }

  const consumerIds = consumers.map(c => c.id);
  console.log(`[handleWhatsAppCancel] phone=${phone} consumers=${consumerIds.join(',')}`);

  // Find ALL non-terminal intents across ALL consumer records for this phone
  const { data: intents } = await supabase
    .from('intents')
    .select('id, status')
    .in('consumer_id', consumerIds)
    .not('status', 'in', '("cancelled","settled","no_providers")')
    .order('created_at', { ascending: false });

  console.log(`[handleWhatsAppCancel] phone=${phone} found=${intents?.length ?? 0} intents:`, intents?.map(i => `${i.id}(${i.status})`).join(','));

  if (!intents || intents.length === 0) {
    await sendWhatsAppReply(phone, "No active request found to cancel.");
    return;
  }

  let anyExecuting = false;

  for (const intent of intents) {
    const wasExecuting = intent.status === 'executing';
    if (wasExecuting) anyExecuting = true;

    // Cancel intent and all pending/offered negotiations
    const { error: cancelErr } = await supabase.from('intents').update({ status: 'cancelled' }).eq('id', intent.id);
    console.log(`[handleWhatsAppCancel] cancelled intent ${intent.id}: err=${cancelErr?.message ?? 'none'}`);
    await supabase.from('negotiations')
      .update({ offer_state: 'cancelled' })
      .eq('intent_id', intent.id)
      .in('offer_state', ['pending', 'offered', 'accepted']);

    // Cancel executions and notify the business provider
    if (wasExecuting) {
      const { data: executions } = await supabase
        .from('executions')
        .select('id, negotiation:negotiations!inner(business_id, businesses(telegram_chat_id, display_name))')
        .eq('negotiation.intent_id', intent.id)
        .in('status', ['confirmed']);

      for (const exec of executions ?? []) {
        await supabase.from('executions').update({ status: 'cancelled' }).eq('id', exec.id);

        type ExecNeg = { business_id: string; businesses: { telegram_chat_id: string | null; display_name: string }[] | null };
        const neg = exec.negotiation as unknown as ExecNeg | null;
        const bizChatId = neg?.businesses?.[0]?.telegram_chat_id;
        const bizName = neg?.businesses?.[0]?.display_name || 'Provider';

        if (bizChatId) {
          await sendTelegramReply(bizChatId,
            `ℹ️ <b>Job cancelled by customer</b>\n\nThe customer has cancelled their request. No action needed from you.\n\nThank you, ${bizName} — we'll keep sending you new leads!`
          ).catch(() => {});
        }
      }
    }
  }

  // Close all open conversations across ALL consumer records for this phone
  await supabase
    .from('conversations')
    .update({ state: 'complete' })
    .in('consumer_id', consumerIds)
    .neq('state', 'complete');

  const msg = anyExecuting
    ? "❌ Your request has been cancelled. The provider has been notified. Send a new message anytime to start fresh!"
    : "❌ Your request has been cancelled. Send a new message anytime to start fresh!";

  await sendWhatsAppReply(phone, msg);
}

async function handleWhatsAppRating(phone: string, score: number, executionId: string): Promise<void> {
  const supabase = createServiceClient();

  const { data: execution } = await supabase
    .from('executions')
    .select('id, negotiation:negotiations(business_id)')
    .eq('id', executionId)
    .maybeSingle();

  if (!execution) return;

  await supabase
    .from('executions')
    .update({ consumer_rating: score, rating_status: 'rated' })
    .eq('id', executionId);

  // Recalculate business average rating
  const businessId = (execution.negotiation as { business_id?: string } | null)?.business_id;
  if (businessId) {
    const { data: ratings } = await supabase
      .from('executions')
      .select('consumer_rating, negotiation:negotiations!inner(business_id)')
      .eq('negotiation.business_id', businessId)
      .not('consumer_rating', 'is', null);

    if (ratings && ratings.length > 0) {
      const avg = ratings.reduce((sum, r) => sum + (r.consumer_rating as number), 0) / ratings.length;
      await supabase
        .from('businesses')
        .update({ rating_summary: { average: Math.round(avg * 10) / 10, count: ratings.length } })
        .eq('id', businessId);
    }
  }

  const stars = '⭐'.repeat(score);
  await sendWhatsAppReply(phone, `Thank you! You gave ${stars} — your feedback helps the Nida community. 🙏`);
}

/** Parse text input as a 1-5 rating. Handles "5", "⭐⭐⭐⭐⭐", "⭐⭐⭐⭐⭐ Excellent", etc. */
function parseRatingText(text: string): number | null {
  const t = text.trim();
  // Count star emojis
  const stars = (t.match(/⭐/g) || []).length;
  if (stars >= 1 && stars <= 5) return stars;
  // Plain number
  const num = parseInt(t);
  if (!isNaN(num) && num >= 1 && num <= 5) return num;
  return null;
}

async function processWhatsAppMessage(
  phone: string,
  text: string,
  messageId: string
): Promise<void> {
  console.log(`Processing WhatsApp message ${messageId} from ${phone}`);

  // Deduplicate: skip if we've already processed this exact message
  // WhatsApp retries webhooks if the server doesn't respond in time, causing duplicate intents
  const redis = getRedis();
  if (redis && messageId) {
    const dedupKey = `wa_msg:${phone}:${messageId}`;
    const seen = await redis.get(dedupKey).catch(() => null);
    if (seen) {
      console.log(`Skipping duplicate WhatsApp message ${messageId} from ${phone}`);
      return;
    }
    await redis.set(dedupKey, '1', { ex: 300 }).catch(() => {}); // 5 min TTL
  }

  // Mark message as read immediately — sends blue double ticks (world-class live feel)
  markWhatsAppMessageRead(messageId).catch(() => {});

  // Intercept cancel command before AI processing
  if (text.trim().toLowerCase() === 'cancel') {
    await handleWhatsAppCancel(phone);
    return;
  }

  // Intercept text-based rating input (fallback if user types instead of tapping list)
  const ratingScore = parseRatingText(text);
  if (ratingScore !== null) {
    const supabase = createServiceClient();
    const { data: consumer } = await supabase
      .from('consumers').select('id').eq('phone', phone).maybeSingle();
    if (consumer) {
      const { data: pendingExec } = await supabase
        .from('executions')
        .select('id, negotiation:negotiations!inner(intent:intents!inner(consumer_id))')
        .eq('rating_status', 'requested')
        .eq('negotiation.intent.consumer_id', consumer.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (pendingExec) {
        await handleWhatsAppRating(phone, ratingScore, pendingExec.id);
        return;
      }
    }
  }

  try {
    // ⏳ reaction — visible processing indicator on their message
    sendWhatsAppReaction(phone, messageId, '⏳').catch(() => {});

    // Process through conversation service (AI intake)
    const result = await processMessage(phone, text);

    console.log(`AI response for ${phone}:`, {
      intentCreated: result.intentCreated,
      intentId: result.intentId,
      responseLength: result.response.length,
    });

    // Remove the ⏳ reaction once processing is done
    sendWhatsAppReaction(phone, messageId, '').catch(() => {});

    // Send actual response back to user via WhatsApp
    const sendResult = await sendWhatsAppReply(phone, result.response);

    if (sendResult.success) {
      console.log(`Reply sent to ${phone}, messageId: ${sendResult.messageId}`);
    } else {
      console.error(`Failed to send reply to ${phone}:`, sendResult.error);
    }

    // Log intent creation
    if (result.intentCreated) {
      console.log(`Intent ${result.intentId} created from WhatsApp conversation with ${phone}`);
    }
  } catch (error) {
    console.error(`Error processing message from ${phone}:`, error);

    // Try to send error message to user
    try {
      await sendWhatsAppReply(
        phone,
        "I'm sorry, I encountered an issue. Please try again in a moment."
      );
    } catch (sendError) {
      console.error('Failed to send error message:', sendError);
    }
  }
}
