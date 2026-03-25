import type { ChannelAdapter, NotificationPayload, NotificationResult } from '../types';
import { formatMessage, type TemplateName } from '../templates';

// Using Resend for email (easy to set up, good deliverability)
// Can swap for SendGrid, Postmark, etc.

export class EmailAdapter implements ChannelAdapter {
  channel = 'email' as const;

  private apiKey: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY || '';
    this.fromEmail = process.env.EMAIL_FROM || 'leads@nida.qa';
  }

  async send(payload: NotificationPayload, template: string): Promise<NotificationResult> {
    if (!payload.businessEmail) {
      return { success: false, error: 'No email address' };
    }

    if (!this.apiKey) {
      console.warn('Email API key not configured');
      return { success: false, error: 'Email not configured' };
    }

    try {
      const { subject, body } = formatMessage(template as TemplateName, payload, 'email');

      // Using Resend API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: payload.businessEmail,
          subject: subject || 'New Lead - Nida',
          text: body,
          html: this.toHtml(body, payload),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Email API error' };
      }

      return { success: true, externalId: data.id };
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private toHtml(text: string, payload: NotificationPayload): string {
    // Simple HTML wrapper
    const lines = text.split('\n').map((line) => {
      if (line.startsWith('📍') || line.startsWith('🔧') || line.startsWith('⚡') ||
          line.startsWith('📊') || line.startsWith('💰')) {
        return `<p style="margin: 8px 0;">${line}</p>`;
      }
      if (line.includes('Claim this lead') || line.includes('Claim now')) {
        return `<p style="margin: 16px 0;"><a href="${payload.claimUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Claim This Lead</a></p>`;
      }
      return `<p style="margin: 8px 0;">${line}</p>`;
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
    ${lines.join('\n')}
  </div>
  <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
    You received this because you're registered as a service provider on Nida.
  </p>
</body>
</html>
    `.trim();
  }
}

export const emailAdapter = new EmailAdapter();
