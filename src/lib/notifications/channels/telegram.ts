import type { ChannelAdapter, NotificationPayload, NotificationResult, NotificationStatus } from '../types';
import { formatMessage, type TemplateName } from '../templates';

const TELEGRAM_API_URL = 'https://api.telegram.org';

export class TelegramAdapter implements ChannelAdapter {
  channel = 'telegram' as const;

  private botToken: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
  }

  async send(payload: NotificationPayload, template: string): Promise<NotificationResult> {
    if (!this.botToken) {
      console.warn('Telegram bot token not configured');
      return { success: false, error: 'Telegram not configured' };
    }

    // Get telegram_chat_id from payload (should be added to payload for telegram channel)
    const chatId = (payload as NotificationPayload & { telegramChatId?: string }).telegramChatId;

    if (!chatId) {
      console.warn('No Telegram chat ID for business:', payload.businessId);
      return { success: false, error: 'No Telegram chat ID configured' };
    }

    try {
      // Get message content
      const { body } = formatMessage(template as TemplateName, payload, 'telegram');

      // Send with inline keyboard for lead actions
      const result = await this.sendWithKeyboard(
        chatId,
        body,
        [
          [
            { text: '✅ Accept Lead', callback_data: `accept:${payload.negotiationId}` },
            { text: '❌ Decline', callback_data: `decline:${payload.negotiationId}` },
          ],
          [
            { text: '📋 View Details', url: payload.claimUrl },
          ],
        ]
      );

      return result;
    } catch (error) {
      console.error('Telegram send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async checkDelivery(externalId: string): Promise<NotificationStatus> {
    // Telegram doesn't provide delivery webhooks like WhatsApp
    // Messages are considered delivered once sent successfully
    console.debug('Check delivery for:', externalId);
    return 'delivered';
  }

  /**
   * Send a plain text message
   */
  async sendMessage(chatId: string, text: string, parseMode: 'MarkdownV2' | 'HTML' = 'MarkdownV2'): Promise<NotificationResult> {
    if (!this.botToken) {
      return { success: false, error: 'Telegram not configured' };
    }

    try {
      const response = await fetch(
        `${TELEGRAM_API_URL}/bot${this.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: parseMode,
          }),
        }
      );

      const data = await response.json();

      if (!data.ok) {
        console.error('Telegram API error:', data);
        return {
          success: false,
          error: data.description || 'Telegram API error',
        };
      }

      return {
        success: true,
        externalId: String(data.result?.message_id),
      };
    } catch (error) {
      console.error('Telegram send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send a message with inline keyboard buttons
   */
  async sendWithKeyboard(
    chatId: string,
    text: string,
    buttons: Array<Array<{ text: string; callback_data?: string; url?: string }>>
  ): Promise<NotificationResult> {
    if (!this.botToken) {
      return { success: false, error: 'Telegram not configured' };
    }

    try {
      const response = await fetch(
        `${TELEGRAM_API_URL}/bot${this.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: buttons,
            },
          }),
        }
      );

      const data = await response.json();

      if (!data.ok) {
        console.error('Telegram API error:', data);
        return {
          success: false,
          error: data.description || 'Telegram API error',
        };
      }

      return {
        success: true,
        externalId: String(data.result?.message_id),
      };
    } catch (error) {
      console.error('Telegram send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Answer a callback query (when user clicks inline button)
   */
  async answerCallbackQuery(
    callbackQueryId: string,
    text?: string,
    showAlert = false
  ): Promise<boolean> {
    if (!this.botToken) {
      return false;
    }

    try {
      const response = await fetch(
        `${TELEGRAM_API_URL}/bot${this.botToken}/answerCallbackQuery`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            callback_query_id: callbackQueryId,
            text,
            show_alert: showAlert,
          }),
        }
      );

      const data = await response.json();
      return data.ok === true;
    } catch (error) {
      console.error('Telegram answerCallbackQuery error:', error);
      return false;
    }
  }

  /**
   * Edit message text (for updating after button click)
   */
  async editMessageText(
    chatId: string,
    messageId: string,
    text: string
  ): Promise<boolean> {
    if (!this.botToken) {
      return false;
    }

    try {
      const response = await fetch(
        `${TELEGRAM_API_URL}/bot${this.botToken}/editMessageText`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text,
            parse_mode: 'HTML',
          }),
        }
      );

      const data = await response.json();
      return data.ok === true;
    } catch (error) {
      console.error('Telegram editMessageText error:', error);
      return false;
    }
  }
}

export const telegramAdapter = new TelegramAdapter();

/**
 * Send a conversational reply to a Telegram user
 * Used for AI intake conversations (clarifying questions, confirmations, etc.)
 */
export async function sendTelegramReply(chatId: string, message: string): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.warn('Telegram bot token not configured, message not sent:', message);
    return { success: false, error: 'Telegram not configured' };
  }

  try {
    const response = await fetch(
      `${TELEGRAM_API_URL}/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      console.error('Telegram API error:', data);
      return {
        success: false,
        error: data.description || 'Telegram API error',
      };
    }

    return {
      success: true,
      messageId: String(data.result?.message_id),
    };
  } catch (error) {
    console.error('Telegram send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
