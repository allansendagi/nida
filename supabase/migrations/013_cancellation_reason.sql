-- Add cancellation_reason to intents for post-cancel feedback collection
ALTER TABLE intents ADD COLUMN IF NOT EXISTS cancellation_reason text;
