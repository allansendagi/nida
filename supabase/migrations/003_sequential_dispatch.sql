-- Sequential Dispatch Schema Migration
-- Uber-style lead dispatch: one provider at a time with timeout escalation

-- =============================================================================
-- INTENTS: Add sequential dispatch tracking fields
-- =============================================================================

-- Track which rank we're currently offering to
ALTER TABLE intents ADD COLUMN current_offer_rank INTEGER DEFAULT 1;

-- When the current offer expires (triggers escalation to next rank)
ALTER TABLE intents ADD COLUMN offer_expires_at TIMESTAMPTZ;

-- When we started the dispatch process
ALTER TABLE intents ADD COLUMN dispatch_started_at TIMESTAMPTZ;

-- =============================================================================
-- NEGOTIATIONS: Add offer state tracking
-- =============================================================================

-- Track the state of each provider's offer
ALTER TABLE negotiations ADD COLUMN offer_state TEXT DEFAULT 'pending'
  CHECK (offer_state IN ('pending', 'offered', 'accepted', 'rejected', 'expired', 'cancelled'));

-- When this provider was offered the lead
ALTER TABLE negotiations ADD COLUMN offered_at TIMESTAMPTZ;

-- When this provider responded (accepted/rejected)
ALTER TABLE negotiations ADD COLUMN responded_at TIMESTAMPTZ;

-- Optional reason for rejection
ALTER TABLE negotiations ADD COLUMN rejection_reason TEXT;

-- =============================================================================
-- INDEXES for efficient queries
-- =============================================================================

-- Index for cron job to find intents with expiring offers
CREATE INDEX idx_intents_offer_expiry
  ON intents(offer_expires_at)
  WHERE status = 'matching' AND offer_expires_at IS NOT NULL;

-- Index for finding the current active offer for an intent
CREATE INDEX idx_negotiations_offer_state
  ON negotiations(intent_id, offer_state)
  WHERE offer_state = 'offered';

-- Index for finding pending negotiations by rank (for escalation)
CREATE INDEX idx_negotiations_pending_rank
  ON negotiations(intent_id, match_rank)
  WHERE offer_state = 'pending';

-- =============================================================================
-- UPDATE INTENT STATUS OPTIONS
-- =============================================================================

-- Add 'no_providers' status for when all providers reject/timeout
ALTER TABLE intents DROP CONSTRAINT IF EXISTS intents_status_check;
ALTER TABLE intents ADD CONSTRAINT intents_status_check
  CHECK (status IN ('intake', 'structured', 'matching', 'negotiating', 'executing', 'settled', 'no_providers'));

-- =============================================================================
-- UPDATE LEAD VIEW to include offer state and expiry
-- =============================================================================

DROP VIEW IF EXISTS lead_view;
CREATE OR REPLACE VIEW lead_view AS
SELECT
  n.id,
  n.intent_id,
  i.intent_data->>'category' as category,
  i.intent_data->'location'->>'zone' as location_zone,
  i.intent_data->'location'->>'text' as location_text,
  (i.intent_data->'budget'->>'min')::INTEGER as budget_min,
  (i.intent_data->'budget'->>'max')::INTEGER as budget_max,
  i.intent_data->>'urgency' as urgency,
  n.match_score,
  n.match_rank,
  n.state,
  n.offer_state,
  n.offered_at,
  n.responded_at,
  i.offer_expires_at,
  n.created_at,
  n.notified_at,
  n.claimed_at,
  n.business_id,
  c.name as consumer_name
FROM negotiations n
JOIN intents i ON i.id = n.intent_id
JOIN consumers c ON c.id = i.consumer_id;
