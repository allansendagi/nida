import { NextResponse } from 'next/server';
import { processMessage } from '@/lib/conversations/service';
import { sendWhatsAppReply } from '@/lib/notifications/channels/whatsapp';

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
    const body = await request.json();

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
    // Process through conversation service (AI intake)
    const result = await processMessage(phone, text);

    console.log(`AI response for ${phone}:`, {
      intentCreated: result.intentCreated,
      intentId: result.intentId,
      responseLength: result.response.length,
    });

    // Send response back to user via WhatsApp
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
