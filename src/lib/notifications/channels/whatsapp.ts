import type { ChannelAdapter, NotificationPayload, NotificationResult, NotificationStatus } from '../types';
import { formatMessage, type TemplateName } from '../templates';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

export class WhatsAppAdapter implements ChannelAdapter {
  channel = 'whatsapp' as const;

  private phoneNumberId: string;
  private accessToken: string;

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
  }

  async send(payload: NotificationPayload, template: string): Promise<NotificationResult> {
    if (!this.phoneNumberId || !this.accessToken) {
      console.warn('WhatsApp credentials not configured');
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      // Format phone number (remove + and spaces)
      const phone = payload.businessPhone.replace(/[\s+\-]/g, '');

      // Get message content
      const { body } = formatMessage(template as TemplateName, payload, 'whatsapp');

      // For approved templates, use template API
      // For now, use text message (only works within 24h window)
      const response = await fetch(
        `${WHATSAPP_API_URL}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: phone,
            type: 'text',
            text: { body },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('WhatsApp API error:', data);
        return {
          success: false,
          error: data.error?.message || 'WhatsApp API error',
        };
      }

      return {
        success: true,
        externalId: data.messages?.[0]?.id,
      };
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async checkDelivery(externalId: string): Promise<NotificationStatus> {
    // WhatsApp sends delivery webhooks, so we track status via webhooks
    // This is a placeholder for manual status check if needed
    console.debug('Check delivery for:', externalId);
    return 'sent';
  }

  // Send using approved template (for notifications outside 24h window)
  async sendTemplate(
    phone: string,
    templateName: string,
    parameters: Record<string, string>
  ): Promise<NotificationResult> {
    if (!this.phoneNumberId || !this.accessToken) {
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const formattedPhone = phone.replace(/[\s+\-]/g, '');

      const response = await fetch(
        `${WHATSAPP_API_URL}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: formattedPhone,
            type: 'template',
            template: {
              name: templateName,
              language: { code: 'en' },
              components: [
                {
                  type: 'body',
                  parameters: Object.values(parameters).map((value) => ({
                    type: 'text',
                    text: value,
                  })),
                },
              ],
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error?.message };
      }

      return { success: true, externalId: data.messages?.[0]?.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const whatsappAdapter = new WhatsAppAdapter();

/**
 * Mark an incoming WhatsApp message as read — sends blue double ticks immediately,
 * giving the impression of a live person on the other end.
 */
export async function markWhatsAppMessageRead(messageId: string): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) return;

  await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }),
  }).catch(err => console.error('WhatsApp mark-read error:', err));
}

/**
 * Send a reaction to an incoming WhatsApp message
 * Used as an elegant "processing" indicator instead of a text bubble
 */
export async function sendWhatsAppReaction(
  phone: string,
  messageId: string,
  emoji: string
): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) return;

  const formattedPhone = phone.replace(/[\s+\-]/g, '');
  await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'reaction',
      reaction: { message_id: messageId, emoji },
    }),
  }).catch(err => console.error('WhatsApp reaction error:', err));
}

/**
 * Send an interactive list rating request after job completion
 */
export async function sendWhatsAppRatingRequest(
  phone: string,
  executionId: string,
  businessName: string,
  category: string
): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) return;

  const formattedPhone = phone.replace(/[\s+\-]/g, '');
  await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: {
          text: `✅ Your ${category} job with ${businessName} is complete!\n\nHow did it go? Your rating helps other customers find great providers.`,
        },
        action: {
          button: 'Rate now',
          sections: [{
            title: 'Your Rating',
            rows: [
              { id: `rate:5:${executionId}`, title: '⭐⭐⭐⭐⭐ Excellent' },
              { id: `rate:4:${executionId}`, title: '⭐⭐⭐⭐ Good' },
              { id: `rate:3:${executionId}`, title: '⭐⭐⭐ OK' },
              { id: `rate:2:${executionId}`, title: '⭐⭐ Poor' },
              { id: `rate:1:${executionId}`, title: '⭐ Very Poor' },
            ],
          }],
        },
      },
    }),
  }).catch(err => console.error('WhatsApp rating request error:', err));
}

/**
 * Send a conversational reply to a WhatsApp user
 * Used for AI intake conversations (clarifying questions, confirmations, etc.)
 */
export async function sendWhatsAppReply(phone: string, message: string): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn('WhatsApp credentials not configured, message not sent:', message);
    return { success: false, error: 'WhatsApp not configured' };
  }

  try {
    // Format phone number (remove + and spaces)
    const formattedPhone = phone.replace(/[\s+\-]/g, '');

    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'text',
          text: { body: message.slice(0, 4096) },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', data);
      return {
        success: false,
        error: data.error?.message || 'WhatsApp API error',
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
