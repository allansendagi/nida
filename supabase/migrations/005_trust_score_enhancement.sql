-- =============================================================================
-- Trust Score Enhancement & Business Verification
-- =============================================================================

-- Add Commercial Registration fields to businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS cr_number TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS cr_verified BOOLEAN DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS cr_verified_at TIMESTAMPTZ;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS cr_verified_by UUID REFERENCES auth.users(id);

-- =============================================================================
-- Enhanced Trust Score Calculation
-- Factors: ratings (40%), response rate (25%), completion rate (25%), account age (10%)
-- =============================================================================

CREATE OR REPLACE FUNCTION calculate_enhanced_trust_score(p_business_id UUID)
RETURNS INTEGER AS $$
DECLARE
  -- Rating factors
  avg_rating NUMERIC;
  rating_count INTEGER;
  rating_score NUMERIC;

  -- Response rate factors
  total_offers INTEGER;
  responded_offers INTEGER;
  response_rate NUMERIC;
  response_score NUMERIC;

  -- Completion rate factors
  total_executions INTEGER;
  completed_executions INTEGER;
  completion_rate NUMERIC;
  completion_score NUMERIC;

  -- Account age factors
  account_age_days INTEGER;
  age_score NUMERIC;

  -- Final score
  final_score INTEGER;
BEGIN
  -- Calculate rating score (40% weight)
  SELECT AVG(score), COUNT(*) INTO avg_rating, rating_count
  FROM ratings
  WHERE business_id = p_business_id;

  IF rating_count = 0 THEN
    rating_score := 50; -- Default neutral
  ELSIF rating_count < 5 THEN
    -- Less influence with fewer ratings
    rating_score := 50 + ((avg_rating - 3) * 5 * (rating_count / 5.0));
  ELSE
    rating_score := 50 + ((avg_rating - 3) * 10);
  END IF;
  rating_score := LEAST(100, GREATEST(0, rating_score));

  -- Calculate response rate score (25% weight)
  -- Count offers made to this business and how many were responded to
  SELECT
    COUNT(*) FILTER (WHERE offer_state IN ('offered', 'accepted', 'rejected', 'expired')),
    COUNT(*) FILTER (WHERE offer_state IN ('accepted', 'rejected') AND responded_at IS NOT NULL)
  INTO total_offers, responded_offers
  FROM negotiations
  WHERE business_id = p_business_id;

  IF total_offers = 0 THEN
    response_rate := 1.0; -- Default to 100% if no offers yet
  ELSE
    response_rate := responded_offers::NUMERIC / total_offers::NUMERIC;
  END IF;
  response_score := response_rate * 100;

  -- Calculate completion rate score (25% weight)
  -- Compare completed executions vs disputed
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO total_executions, completed_executions
  FROM executions e
  JOIN negotiations n ON e.negotiation_id = n.id
  WHERE n.business_id = p_business_id
    AND e.status IN ('completed', 'disputed');

  IF total_executions = 0 THEN
    completion_rate := 1.0; -- Default to 100% if no executions yet
  ELSE
    completion_rate := completed_executions::NUMERIC / total_executions::NUMERIC;
  END IF;
  completion_score := completion_rate * 100;

  -- Calculate account age score (10% weight)
  -- Max bonus at 1 year (365 days)
  SELECT EXTRACT(DAY FROM NOW() - created_at)::INTEGER
  INTO account_age_days
  FROM businesses
  WHERE id = p_business_id;

  age_score := LEAST(100, (account_age_days::NUMERIC / 365.0) * 100);

  -- Calculate final weighted score
  -- Ratings: 40%, Response Rate: 25%, Completion Rate: 25%, Account Age: 10%
  final_score := (
    (rating_score * 0.40) +
    (response_score * 0.25) +
    (completion_score * 0.25) +
    (age_score * 0.10)
  )::INTEGER;

  RETURN LEAST(100, GREATEST(0, final_score));
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Trigger to sync trust_score to NOMOS contract
-- =============================================================================

CREATE OR REPLACE FUNCTION sync_trust_score_to_nomos()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the nomos_contract->issuer->trust_score when business.trust_score changes
  IF NEW.trust_score IS DISTINCT FROM OLD.trust_score THEN
    NEW.nomos_contract := jsonb_set(
      NEW.nomos_contract::jsonb,
      '{issuer,trust_score}',
      to_jsonb(NEW.trust_score)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_trust_score_to_nomos ON businesses;
CREATE TRIGGER trigger_sync_trust_score_to_nomos
BEFORE UPDATE ON businesses
FOR EACH ROW
EXECUTE FUNCTION sync_trust_score_to_nomos();

-- =============================================================================
-- Enhanced trust score update trigger (replaces basic one)
-- =============================================================================

CREATE OR REPLACE FUNCTION update_business_trust_score()
RETURNS TRIGGER AS $$
DECLARE
  new_trust_score INTEGER;
BEGIN
  -- Calculate enhanced trust score
  new_trust_score := calculate_enhanced_trust_score(NEW.business_id);

  -- Update the business
  UPDATE businesses
  SET trust_score = new_trust_score
  WHERE id = NEW.business_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger already exists from initial schema, just replacing the function

-- =============================================================================
-- Additional triggers for response rate and completion rate updates
-- =============================================================================

-- Update trust score when negotiation response changes
CREATE OR REPLACE FUNCTION update_trust_score_on_negotiation_response()
RETURNS TRIGGER AS $$
DECLARE
  new_trust_score INTEGER;
BEGIN
  -- Only recalculate if offer_state changed to accepted or rejected
  IF NEW.offer_state IN ('accepted', 'rejected') AND
     (OLD.offer_state IS NULL OR OLD.offer_state = 'offered') THEN
    new_trust_score := calculate_enhanced_trust_score(NEW.business_id);

    UPDATE businesses
    SET trust_score = new_trust_score
    WHERE id = NEW.business_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_trust_score_on_response ON negotiations;
CREATE TRIGGER trigger_update_trust_score_on_response
AFTER UPDATE ON negotiations
FOR EACH ROW
EXECUTE FUNCTION update_trust_score_on_negotiation_response();

-- Update trust score when execution status changes
CREATE OR REPLACE FUNCTION update_trust_score_on_execution_status()
RETURNS TRIGGER AS $$
DECLARE
  v_business_id UUID;
  new_trust_score INTEGER;
BEGIN
  -- Get the business_id from the negotiation
  SELECT n.business_id INTO v_business_id
  FROM negotiations n
  WHERE n.id = NEW.negotiation_id;

  -- Recalculate if status changed to completed or disputed
  IF NEW.status IN ('completed', 'disputed') AND
     (OLD.status IS NULL OR OLD.status = 'confirmed') THEN
    new_trust_score := calculate_enhanced_trust_score(v_business_id);

    UPDATE businesses
    SET trust_score = new_trust_score
    WHERE id = v_business_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_trust_score_on_execution ON executions;
CREATE TRIGGER trigger_update_trust_score_on_execution
AFTER UPDATE ON executions
FOR EACH ROW
EXECUTE FUNCTION update_trust_score_on_execution_status();
