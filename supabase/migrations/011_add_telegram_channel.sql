-- Add Telegram as a notification channel

-- Update the channel check constraint to include telegram
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_channel_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_channel_check
  CHECK (channel IN ('whatsapp', 'sms', 'email', 'push', 'telegram'));

-- Add telegram_chat_id to businesses table for businesses that want Telegram notifications
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

-- Add telegram_chat_id to consumers table for consumers using Telegram
ALTER TABLE consumers ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

-- Update default notification preferences to include telegram as an option
-- Existing businesses keep their current preferences, this only affects new ones
COMMENT ON COLUMN businesses.notification_preferences IS
  'JSON with channels array (whatsapp, email, sms, push, telegram), quiet_hours, instant_alerts';

-- Create index for looking up businesses by telegram_chat_id
CREATE INDEX IF NOT EXISTS idx_businesses_telegram_chat_id ON businesses(telegram_chat_id)
  WHERE telegram_chat_id IS NOT NULL;

-- Create index for looking up consumers by telegram_chat_id
CREATE INDEX IF NOT EXISTS idx_consumers_telegram_chat_id ON consumers(telegram_chat_id)
  WHERE telegram_chat_id IS NOT NULL;
