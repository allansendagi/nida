-- =============================================================================
-- NIDA Revolutionary Rating System v2
-- WhatsApp-native, AI-powered, two-sided trust marketplace
-- =============================================================================

-- =============================================================================
-- RATING CONVERSATIONS (Multi-turn WhatsApp conversations for collecting ratings)
-- =============================================================================

CREATE TABLE rating_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID NOT NULL REFERENCES executions ON DELETE CASCADE,
  rater_type TEXT NOT NULL CHECK (rater_type IN ('consumer', 'business')),
  rater_id UUID NOT NULL,

  -- Conversation state machine
  state TEXT DEFAULT 'pending' CHECK (state IN (
    'pending',      -- Not yet initiated
    'initiated',    -- First message sent, awaiting response
    'collecting',   -- Actively collecting feedback (multi-turn)
    'complete',     -- Rating successfully collected
    'expired',      -- No response after reminders
    'skipped'       -- User opted out or dismissed
  )),

  -- Conversation history
  messages JSONB DEFAULT '[]'::JSONB,

  -- AI-extracted data from conversation
  extracted_data JSONB DEFAULT '{}'::JSONB,
  -- Structure: {
  --   sentiment: 'positive' | 'neutral' | 'negative',
  --   themes: ['professional', 'punctual', 'quality', ...],
  --   suggested_score: 1-5,
  --   key_phrases: ['arrived on time', 'explained everything', ...],
  --   concerns: ['late arrival', ...]
  -- }

  -- Rich media attachments (photos, voice notes)
  media_attachments JSONB DEFAULT '[]'::JSONB,
  -- Structure: [{ type: 'photo'|'voice', url: string, analysis: {...} }]

  -- Timing
  initiated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,

  -- Reminder tracking
  reminder_count INTEGER DEFAULT 0,
  next_reminder_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_rating_conversation UNIQUE (execution_id, rater_type)
);

CREATE INDEX idx_rating_conversations_execution ON rating_conversations(execution_id);
CREATE INDEX idx_rating_conversations_rater ON rating_conversations(rater_id, rater_type);
CREATE INDEX idx_rating_conversations_state ON rating_conversations(state);
CREATE INDEX idx_rating_conversations_next_reminder ON rating_conversations(next_reminder_at)
  WHERE state IN ('initiated', 'collecting') AND next_reminder_at IS NOT NULL;

-- =============================================================================
-- RATINGS V2 (Enhanced ratings with AI-extracted insights)
-- =============================================================================

CREATE TABLE ratings_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID NOT NULL REFERENCES executions ON DELETE CASCADE,
  rating_conversation_id UUID REFERENCES rating_conversations ON DELETE SET NULL,

  -- Who is rating whom
  rater_type TEXT NOT NULL CHECK (rater_type IN ('consumer', 'business')),
  rater_id UUID NOT NULL,
  ratee_id UUID NOT NULL,

  -- Core rating
  overall_score INTEGER NOT NULL CHECK (overall_score >= 1 AND overall_score <= 5),

  -- Dimensional ratings (different for consumer vs business ratings)
  -- Consumer rating business: quality, professionalism, value, communication, timeliness
  -- Business rating consumer: clarity, punctuality, respect, payment
  dimensions JSONB DEFAULT '{}'::JSONB,

  -- AI-extracted sentiment analysis
  sentiment JSONB DEFAULT '{}'::JSONB,
  -- Structure: {
  --   overall: 'positive'|'neutral'|'negative',
  --   confidence: 0.0-1.0,
  --   themes: [{name: string, sentiment: string, mentions: number}],
  --   keywords: [string]
  -- }

  -- Raw feedback text (from conversation or direct submission)
  raw_feedback TEXT,

  -- Rich media evidence
  photos JSONB DEFAULT '[]'::JSONB,
  voice_note_transcription TEXT,

  -- Flags for moderation and insights
  highlight_worthy BOOLEAN DEFAULT false,  -- Exceptionally good feedback
  concern_flagged BOOLEAN DEFAULT false,   -- Needs attention

  -- Mutual reveal tracking
  revealed_at TIMESTAMPTZ,  -- When both sides could see each other's rating

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_rating_v2 UNIQUE (execution_id, rater_type)
);

CREATE INDEX idx_ratings_v2_execution ON ratings_v2(execution_id);
CREATE INDEX idx_ratings_v2_rater ON ratings_v2(rater_id, rater_type);
CREATE INDEX idx_ratings_v2_ratee ON ratings_v2(ratee_id);
CREATE INDEX idx_ratings_v2_score ON ratings_v2(overall_score);
CREATE INDEX idx_ratings_v2_created ON ratings_v2(created_at DESC);

-- =============================================================================
-- CONSUMER REPUTATION (Two-sided trust - consumers build reputation too)
-- =============================================================================

CREATE TABLE consumer_reputation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consumer_id UUID NOT NULL REFERENCES consumers ON DELETE CASCADE UNIQUE,

  -- Overall trust score (0-100)
  trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),

  -- Dimensional scores (0-5 scale, from business ratings)
  clarity_score NUMERIC(3,2) DEFAULT 0,       -- How clear were their requirements
  punctuality_score NUMERIC(3,2) DEFAULT 0,   -- Were they on time / available
  respect_score NUMERIC(3,2) DEFAULT 0,       -- Respectful communication
  payment_score NUMERIC(3,2) DEFAULT 0,       -- Prompt payment

  -- Activity metrics
  total_jobs INTEGER DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,

  -- Cancellation tracking
  cancellation_count INTEGER DEFAULT 0,
  cancellation_rate NUMERIC(5,4) DEFAULT 0,

  -- Badges earned
  badges JSONB DEFAULT '[]'::JSONB,
  -- Structure: [{ type: 'first_job', 'five_star', 'repeat_customer', earned_at: timestamp }]

  -- Priority tier for matching
  priority_tier TEXT DEFAULT 'standard' CHECK (priority_tier IN (
    'standard',   -- Default
    'preferred',  -- Trust >= 60 + 3 jobs: 5% match boost
    'premium'     -- Trust >= 80 + 5 jobs: 15% match boost
  )),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consumer_reputation_trust ON consumer_reputation(trust_score);
CREATE INDEX idx_consumer_reputation_tier ON consumer_reputation(priority_tier);

-- =============================================================================
-- BUSINESS RATING INSIGHTS (Aggregated intelligence for businesses)
-- =============================================================================

CREATE TABLE business_rating_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses ON DELETE CASCADE,

  -- Time period
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly', 'quarterly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Aggregate metrics
  total_ratings INTEGER DEFAULT 0,
  average_score NUMERIC(3,2) DEFAULT 0,

  -- Theme analysis
  positive_themes JSONB DEFAULT '[]'::JSONB,
  -- Structure: [{ theme: 'professional', count: 12, trend: 'up'|'stable'|'down' }]

  negative_themes JSONB DEFAULT '[]'::JSONB,
  -- Structure: [{ theme: 'late arrival', count: 3, trend: 'up'|'stable'|'down' }]

  -- AI-generated insights
  insights JSONB DEFAULT '[]'::JSONB,
  -- Structure: [{
  --   type: 'strength'|'improvement'|'trend'|'alert',
  --   message: '3 customers mentioned late arrivals this week',
  --   priority: 'high'|'medium'|'low',
  --   actionable: boolean
  -- }]

  -- Comparative ranking within category
  category_percentile INTEGER,  -- 0-100, higher is better

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_business_insight_period UNIQUE (business_id, period_type, period_start)
);

CREATE INDEX idx_business_insights_business ON business_rating_insights(business_id);
CREATE INDEX idx_business_insights_period ON business_rating_insights(period_type, period_start);

-- =============================================================================
-- COMPLETION SIGNALS (Smart timing - detect when service is complete)
-- =============================================================================

CREATE TABLE completion_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID NOT NULL REFERENCES executions ON DELETE CASCADE,

  -- Signal type
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'business_marked_complete',   -- Business explicitly marked job done
    'consumer_confirmed',         -- Consumer confirmed completion
    'time_elapsed',               -- Enough time passed for service type
    'payment_detected',           -- Payment was processed
    'follow_up_silence'           -- No issues raised after service time
  )),

  -- Confidence in this signal (0.0-1.0)
  confidence NUMERIC(3,2) DEFAULT 0.0,

  -- Additional context
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_completion_signals_execution ON completion_signals(execution_id);
CREATE INDEX idx_completion_signals_type ON completion_signals(signal_type);

-- =============================================================================
-- SCHEMA UPDATES TO EXISTING TABLES
-- =============================================================================

-- Add reputation tracking to consumers
ALTER TABLE consumers ADD COLUMN IF NOT EXISTS reputation_id UUID REFERENCES consumer_reputation(id);

-- Add rating workflow tracking to executions
ALTER TABLE executions ADD COLUMN IF NOT EXISTS rating_status TEXT DEFAULT 'pending'
  CHECK (rating_status IN (
    'pending',         -- No ratings requested yet
    'requested',       -- Rating request sent
    'consumer_rated',  -- Only consumer has rated
    'business_rated',  -- Only business has rated
    'both_rated',      -- Both have rated, awaiting reveal
    'revealed',        -- Mutual reveal complete
    'expired'          -- Rating window closed
  ));
ALTER TABLE executions ADD COLUMN IF NOT EXISTS rating_requested_at TIMESTAMPTZ;
ALTER TABLE executions ADD COLUMN IF NOT EXISTS ratings_revealed_at TIMESTAMPTZ;

-- Add rating summary to businesses (denormalized for quick access)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS rating_summary JSONB DEFAULT '{}'::JSONB;
-- Structure: {
--   v2_count: number,
--   v2_average: number,
--   recent_themes: ['professional', 'punctual'],
--   last_rating_at: timestamp
-- }

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE rating_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_rating_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE completion_signals ENABLE ROW LEVEL SECURITY;

-- Service role policies (for API routes)
CREATE POLICY "service_role_all_rating_conversations" ON rating_conversations
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "service_role_all_ratings_v2" ON ratings_v2
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "service_role_all_consumer_reputation" ON consumer_reputation
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "service_role_all_business_rating_insights" ON business_rating_insights
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "service_role_all_completion_signals" ON completion_signals
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Businesses can see their own ratings and insights
CREATE POLICY "ratings_v2_select_business" ON ratings_v2
  FOR SELECT USING (
    ratee_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

CREATE POLICY "business_insights_select_own" ON business_rating_insights
  FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

-- =============================================================================
-- CONSUMER REPUTATION CALCULATION FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION calculate_consumer_trust_score(p_consumer_id UUID)
RETURNS INTEGER AS $$
DECLARE
  -- Rating factors
  avg_rating NUMERIC;
  rating_count INTEGER;
  rating_score NUMERIC;

  -- Job completion factors
  total_jobs INTEGER;
  job_score NUMERIC;

  -- Cancellation factors
  cancel_count INTEGER;
  cancel_rate NUMERIC;
  cancel_score NUMERIC;

  -- Account age factors
  account_age_days INTEGER;
  age_score NUMERIC;

  -- Final score
  final_score INTEGER;
BEGIN
  -- Get rating stats from ratings_v2 where consumer is the ratee
  SELECT AVG(overall_score), COUNT(*) INTO avg_rating, rating_count
  FROM ratings_v2
  WHERE ratee_id = p_consumer_id AND rater_type = 'business';

  IF rating_count = 0 THEN
    rating_score := 50;
  ELSIF rating_count < 3 THEN
    rating_score := 50 + ((avg_rating - 3) * 5 * (rating_count / 3.0));
  ELSE
    rating_score := 50 + ((avg_rating - 3) * 10);
  END IF;
  rating_score := LEAST(100, GREATEST(0, rating_score));

  -- Get completed job count
  SELECT COUNT(*) INTO total_jobs
  FROM executions e
  JOIN negotiations n ON e.negotiation_id = n.id
  JOIN intents i ON n.intent_id = i.id
  WHERE i.consumer_id = p_consumer_id AND e.status = 'completed';

  -- Job score: More completed jobs = higher score, caps at 10 jobs
  job_score := LEAST(100, (total_jobs::NUMERIC / 10.0) * 100);

  -- Get cancellation rate (from intents that were cancelled after matching)
  SELECT COUNT(*) INTO cancel_count
  FROM intents i
  WHERE i.consumer_id = p_consumer_id
    AND i.status = 'settled'
    AND EXISTS (
      SELECT 1 FROM negotiations n
      WHERE n.intent_id = i.id
      AND n.state = 'escalated'
    );

  IF total_jobs + cancel_count = 0 THEN
    cancel_rate := 0;
  ELSE
    cancel_rate := cancel_count::NUMERIC / (total_jobs + cancel_count)::NUMERIC;
  END IF;
  cancel_score := (1 - cancel_rate) * 100;

  -- Account age (max at 180 days for consumers)
  SELECT EXTRACT(DAY FROM NOW() - created_at)::INTEGER
  INTO account_age_days
  FROM consumers
  WHERE id = p_consumer_id;

  age_score := LEAST(100, (COALESCE(account_age_days, 0)::NUMERIC / 180.0) * 100);

  -- Calculate final weighted score
  -- Business Ratings: 50%, Completed Jobs: 20%, Cancellation Rate: 15%, Account Age: 15%
  final_score := (
    (rating_score * 0.50) +
    (job_score * 0.20) +
    (cancel_score * 0.15) +
    (age_score * 0.15)
  )::INTEGER;

  RETURN LEAST(100, GREATEST(0, final_score));
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- CONSUMER PRIORITY TIER CALCULATION
-- =============================================================================

CREATE OR REPLACE FUNCTION calculate_consumer_priority_tier(p_trust_score INTEGER, p_total_jobs INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF p_trust_score >= 80 AND p_total_jobs >= 5 THEN
    RETURN 'premium';
  ELSIF p_trust_score >= 60 AND p_total_jobs >= 3 THEN
    RETURN 'preferred';
  ELSE
    RETURN 'standard';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGER: Update consumer reputation when business rates them
-- =============================================================================

CREATE OR REPLACE FUNCTION update_consumer_reputation()
RETURNS TRIGGER AS $$
DECLARE
  v_consumer_id UUID;
  new_trust_score INTEGER;
  new_tier TEXT;
  v_total_jobs INTEGER;
  v_avg_rating NUMERIC;
  v_rating_count INTEGER;
BEGIN
  -- Only process business ratings of consumers
  IF NEW.rater_type != 'business' THEN
    RETURN NEW;
  END IF;

  v_consumer_id := NEW.ratee_id;

  -- Calculate new trust score
  new_trust_score := calculate_consumer_trust_score(v_consumer_id);

  -- Get updated stats
  SELECT AVG(overall_score), COUNT(*) INTO v_avg_rating, v_rating_count
  FROM ratings_v2
  WHERE ratee_id = v_consumer_id AND rater_type = 'business';

  SELECT COUNT(*) INTO v_total_jobs
  FROM executions e
  JOIN negotiations n ON e.negotiation_id = n.id
  JOIN intents i ON n.intent_id = i.id
  WHERE i.consumer_id = v_consumer_id AND e.status = 'completed';

  -- Calculate tier
  new_tier := calculate_consumer_priority_tier(new_trust_score, v_total_jobs);

  -- Upsert consumer reputation
  INSERT INTO consumer_reputation (
    consumer_id, trust_score, rating_count, average_rating, total_jobs, priority_tier, updated_at
  ) VALUES (
    v_consumer_id, new_trust_score, v_rating_count, COALESCE(v_avg_rating, 0), v_total_jobs, new_tier, NOW()
  )
  ON CONFLICT (consumer_id) DO UPDATE SET
    trust_score = EXCLUDED.trust_score,
    rating_count = EXCLUDED.rating_count,
    average_rating = EXCLUDED.average_rating,
    total_jobs = EXCLUDED.total_jobs,
    priority_tier = EXCLUDED.priority_tier,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_consumer_reputation ON ratings_v2;
CREATE TRIGGER trigger_update_consumer_reputation
AFTER INSERT ON ratings_v2
FOR EACH ROW
EXECUTE FUNCTION update_consumer_reputation();

-- =============================================================================
-- TRIGGER: Update business trust score when consumer rates them (v2)
-- =============================================================================

CREATE OR REPLACE FUNCTION update_business_trust_score_v2()
RETURNS TRIGGER AS $$
DECLARE
  v_business_id UUID;
  new_trust_score INTEGER;
  v_avg_rating NUMERIC;
  v_rating_count INTEGER;
  v_themes TEXT[];
BEGIN
  -- Only process consumer ratings of businesses
  IF NEW.rater_type != 'consumer' THEN
    RETURN NEW;
  END IF;

  v_business_id := NEW.ratee_id;

  -- Calculate new trust score using existing enhanced function
  new_trust_score := calculate_enhanced_trust_score(v_business_id);

  -- Get rating stats for summary
  SELECT AVG(overall_score), COUNT(*) INTO v_avg_rating, v_rating_count
  FROM ratings_v2
  WHERE ratee_id = v_business_id AND rater_type = 'consumer';

  -- Extract recent themes from sentiment data
  SELECT ARRAY_AGG(DISTINCT theme) INTO v_themes
  FROM (
    SELECT jsonb_array_elements_text(sentiment->'keywords') as theme
    FROM ratings_v2
    WHERE ratee_id = v_business_id
      AND rater_type = 'consumer'
      AND created_at > NOW() - INTERVAL '30 days'
    LIMIT 10
  ) t;

  -- Update business trust score and summary
  UPDATE businesses
  SET
    trust_score = new_trust_score,
    rating_summary = jsonb_build_object(
      'v2_count', v_rating_count,
      'v2_average', ROUND(COALESCE(v_avg_rating, 0)::NUMERIC, 2),
      'recent_themes', COALESCE(v_themes, ARRAY[]::TEXT[]),
      'last_rating_at', NEW.created_at
    )
  WHERE id = v_business_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_business_trust_score_v2 ON ratings_v2;
CREATE TRIGGER trigger_update_business_trust_score_v2
AFTER INSERT ON ratings_v2
FOR EACH ROW
EXECUTE FUNCTION update_business_trust_score_v2();

-- =============================================================================
-- FUNCTION: Check and trigger mutual reveal
-- =============================================================================

CREATE OR REPLACE FUNCTION check_mutual_reveal(p_execution_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  consumer_rating_exists BOOLEAN;
  business_rating_exists BOOLEAN;
BEGIN
  -- Check if both ratings exist
  SELECT EXISTS(
    SELECT 1 FROM ratings_v2
    WHERE execution_id = p_execution_id AND rater_type = 'consumer'
  ) INTO consumer_rating_exists;

  SELECT EXISTS(
    SELECT 1 FROM ratings_v2
    WHERE execution_id = p_execution_id AND rater_type = 'business'
  ) INTO business_rating_exists;

  IF consumer_rating_exists AND business_rating_exists THEN
    -- Update execution status
    UPDATE executions
    SET rating_status = 'both_rated'
    WHERE id = p_execution_id;

    RETURN TRUE;
  ELSIF consumer_rating_exists THEN
    UPDATE executions SET rating_status = 'consumer_rated' WHERE id = p_execution_id;
  ELSIF business_rating_exists THEN
    UPDATE executions SET rating_status = 'business_rated' WHERE id = p_execution_id;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- FUNCTION: Reveal mutual ratings
-- =============================================================================

CREATE OR REPLACE FUNCTION reveal_mutual_ratings(p_execution_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  can_reveal BOOLEAN;
BEGIN
  -- Check if both ratings exist
  can_reveal := check_mutual_reveal(p_execution_id);

  IF can_reveal THEN
    -- Mark both ratings as revealed
    UPDATE ratings_v2
    SET revealed_at = NOW()
    WHERE execution_id = p_execution_id AND revealed_at IS NULL;

    -- Update execution status
    UPDATE executions
    SET
      rating_status = 'revealed',
      ratings_revealed_at = NOW()
    WHERE id = p_execution_id;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGER: Auto-check mutual reveal after rating insert
-- =============================================================================

CREATE OR REPLACE FUNCTION trigger_check_mutual_reveal()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_mutual_reveal(NEW.execution_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_reveal_on_rating ON ratings_v2;
CREATE TRIGGER trigger_check_reveal_on_rating
AFTER INSERT ON ratings_v2
FOR EACH ROW
EXECUTE FUNCTION trigger_check_mutual_reveal();

-- =============================================================================
-- VIEW: Rating status overview for business dashboard
-- =============================================================================

CREATE OR REPLACE VIEW rating_status_view AS
SELECT
  e.id as execution_id,
  e.execution_id as execution_code,
  e.status as execution_status,
  e.rating_status,
  e.rating_requested_at,
  e.ratings_revealed_at,
  n.business_id,
  i.consumer_id,
  -- Consumer rating (if exists and revealed or own rating)
  cr.overall_score as consumer_rating_score,
  cr.raw_feedback as consumer_feedback,
  cr.revealed_at as consumer_revealed_at,
  -- Business rating (if exists)
  br.overall_score as business_rating_score,
  br.revealed_at as business_revealed_at,
  -- Conversation states
  cc.state as consumer_conversation_state,
  bc.state as business_conversation_state
FROM executions e
JOIN negotiations n ON e.negotiation_id = n.id
JOIN intents i ON n.intent_id = i.id
LEFT JOIN ratings_v2 cr ON cr.execution_id = e.id AND cr.rater_type = 'consumer'
LEFT JOIN ratings_v2 br ON br.execution_id = e.id AND br.rater_type = 'business'
LEFT JOIN rating_conversations cc ON cc.execution_id = e.id AND cc.rater_type = 'consumer'
LEFT JOIN rating_conversations bc ON bc.execution_id = e.id AND bc.rater_type = 'business';
