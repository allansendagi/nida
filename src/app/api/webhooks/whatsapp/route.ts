import { NextResponse } from 'next/server';
import { processMessage } from '@/lib/conversations/service';
import { sendWhatsAppReply } from '@/lib/notifications/channels/whatsapp';
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

    // Verify signature
    if (!verifySignature(rawBody, signature)) {
      console.error('Invalid WhatsApp webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
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

          // Process message through AI intake
          await processWhatsAppMessage(from, text, message.id);
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
async function processWhatsAppMessage(
  phone: string,
  text: string,
  messageId: string
): Promise<void> {
  console.log(`Processing WhatsApp message ${messageId} from ${phone}`);

  try {
    // Send immediate acknowledgment so user knows Nida received their message
    // WhatsApp has no native typing indicator, so this bridges the gap
    await sendWhatsAppReply(phone, "⏳ Nida is on it...");

    // Process through conversation service (AI intake)
    const result = await processMessage(phone, text);

    console.log(`AI response for ${phone}:`, {
      intentCreated: result.intentCreated,
      intentId: result.intentId,
      responseLength: result.response.length,
    });

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
