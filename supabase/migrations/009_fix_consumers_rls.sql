-- =============================================================================
-- FIX: Data Persistence Issues
-- =============================================================================
-- This migration fixes RLS policies that were preventing leads from displaying
-- correctly in the dashboard after real-time updates.

-- =============================================================================
-- 1. FIX CONSUMERS RLS POLICY
-- =============================================================================
-- The original policy only allowed viewing consumers after an execution was created.
-- This broke the lead_view JOIN for leads that hadn't been accepted yet.
-- When real-time subscription refetched with user auth, RLS blocked access.

-- Add policy to allow viewing consumers through negotiations (not just executions)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'consumers'
    AND policyname = 'consumers_select_via_negotiation'
  ) THEN
    CREATE POLICY "consumers_select_via_negotiation" ON consumers
      FOR SELECT USING (
        id IN (
          SELECT i.consumer_id FROM intents i
          JOIN negotiations n ON n.intent_id = i.id
          WHERE n.business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
        )
      );
  END IF;
END $$;

-- =============================================================================
-- 2. ENSURE LEAD_VIEW HAS ALL REQUIRED COLUMNS
-- =============================================================================
-- Recreate the view to ensure it has offer_state and other sequential dispatch columns

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

-- =============================================================================
-- 3. GRANT ACCESS TO THE VIEW
-- =============================================================================
-- Ensure authenticated users can access the view
GRANT SELECT ON lead_view TO authenticated;

-- =============================================================================
-- 4. ENABLE REALTIME FOR NEGOTIATIONS TABLE
-- =============================================================================
-- Ensure realtime is enabled so the dashboard can receive live updates
-- (Ignore error if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE negotiations;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Already added, ignore
END $$;
