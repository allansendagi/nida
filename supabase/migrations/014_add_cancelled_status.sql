-- Add 'cancelled' to intents status constraint.
-- Without this, every UPDATE intents SET status = 'cancelled' fails with a
-- constraint violation, leaving intents permanently stuck in 'matching'/'executing'.
-- No data migration needed — no rows have status = 'cancelled' today
-- (all prior cancel attempts silently failed due to this constraint).
ALTER TABLE intents DROP CONSTRAINT IF EXISTS intents_status_check;
ALTER TABLE intents ADD CONSTRAINT intents_status_check
  CHECK (status IN (
    'intake', 'structured', 'matching', 'negotiating',
    'executing', 'settled', 'no_providers', 'cancelled'
  ));
