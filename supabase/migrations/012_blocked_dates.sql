-- Add blocked_dates to businesses for availability management
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS blocked_dates jsonb DEFAULT '[]'::jsonb;

-- Add consumer_rating to executions for the simplified rating flow
ALTER TABLE executions ADD COLUMN IF NOT EXISTS consumer_rating integer CHECK (consumer_rating BETWEEN 1 AND 5);
