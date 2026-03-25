-- Nida MVP Database Schema
-- NOMOS Protocol v0.1.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- CONSUMERS
-- =============================================================================

CREATE TABLE consumers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consumers_phone ON consumers(phone);

-- =============================================================================
-- BUSINESSES (NOMOS Service Contracts)
-- =============================================================================

CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,

  -- The full NOMOS contract stored as JSONB
  nomos_contract JSONB NOT NULL,

  -- Denormalized fields for queries (extracted from contract)
  phone TEXT NOT NULL,
  email TEXT,
  display_name TEXT NOT NULL,
  categories TEXT[] NOT NULL,
  service_zones TEXT[] NOT NULL,
  trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  subscription_tier TEXT DEFAULT 'trial' CHECK (subscription_tier IN ('trial', 'basic', 'premium')),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_business_phone UNIQUE (phone)
);

-- GIN indexes for array queries
CREATE INDEX idx_businesses_categories ON businesses USING GIN (categories);
CREATE INDEX idx_businesses_zones ON businesses USING GIN (service_zones);
CREATE INDEX idx_businesses_user_id ON businesses(user_id);

-- =============================================================================
-- INTENTS (Structured Consumer Needs)
-- =============================================================================

CREATE TABLE intents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consumer_id UUID NOT NULL REFERENCES consumers ON DELETE CASCADE,

  -- Protocol state
  status TEXT DEFAULT 'intake' CHECK (status IN ('intake', 'structured', 'matching', 'negotiating', 'executing', 'settled')),

  -- Structured intent data (output of AI intake)
  intent_data JSONB NOT NULL,

  -- Original consumer message
  original_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intents_consumer_id ON intents(consumer_id);
CREATE INDEX idx_intents_status ON intents(status);
CREATE INDEX idx_intents_created_at ON intents(created_at DESC);

-- =============================================================================
-- NEGOTIATIONS (Agent Protocol Messages)
-- =============================================================================

CREATE TABLE negotiations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intent_id UUID NOT NULL REFERENCES intents ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses ON DELETE CASCADE,

  -- Protocol state machine
  state TEXT DEFAULT 'discovered' CHECK (state IN ('discovered', 'proposed', 'negotiating', 'accepted', 'executing', 'settled', 'escalated')),

  -- All protocol messages in order
  messages JSONB DEFAULT '[]'::JSONB,

  -- Scoring from DISCOVER phase
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  score_breakdown JSONB,
  match_rank INTEGER,

  -- Timing
  notified_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_intent_business UNIQUE (intent_id, business_id)
);

CREATE INDEX idx_negotiations_intent_id ON negotiations(intent_id);
CREATE INDEX idx_negotiations_business_id ON negotiations(business_id);
CREATE INDEX idx_negotiations_state ON negotiations(state);
CREATE INDEX idx_negotiations_created_at ON negotiations(created_at DESC);

-- =============================================================================
-- EXECUTIONS (Immutable Execution Records)
-- =============================================================================

CREATE TABLE executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id TEXT UNIQUE NOT NULL, -- e.g., "exec_0918374"
  negotiation_id UUID NOT NULL REFERENCES negotiations ON DELETE CASCADE,

  -- Agreed terms (immutable once created)
  agreed_terms JSONB NOT NULL,

  -- Status
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'disputed')),

  -- Consumer contact (revealed on execution)
  consumer_contact JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_executions_negotiation_id ON executions(negotiation_id);
CREATE INDEX idx_executions_execution_id ON executions(execution_id);
CREATE INDEX idx_executions_status ON executions(status);

-- =============================================================================
-- CONVERSATIONS (Multi-turn Intake State)
-- =============================================================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consumer_id UUID NOT NULL REFERENCES consumers ON DELETE CASCADE,
  phone TEXT NOT NULL,

  state TEXT DEFAULT 'greeting' CHECK (state IN ('greeting', 'clarifying', 'complete')),
  partial_intent JSONB DEFAULT '{}'::JSONB,
  messages JSONB DEFAULT '[]'::JSONB,

  intent_id UUID REFERENCES intents ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_consumer_id ON conversations(consumer_id);
CREATE INDEX idx_conversations_phone ON conversations(phone);
CREATE INDEX idx_conversations_state ON conversations(state);

-- =============================================================================
-- RATINGS
-- =============================================================================

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID NOT NULL REFERENCES executions ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses ON DELETE CASCADE,
  consumer_id UUID NOT NULL REFERENCES consumers ON DELETE CASCADE,

  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_rating_per_execution UNIQUE (execution_id)
);

CREATE INDEX idx_ratings_business_id ON ratings(business_id);
CREATE INDEX idx_ratings_consumer_id ON ratings(consumer_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE consumers ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Businesses: Users can only access their own business
CREATE POLICY "businesses_select_own" ON businesses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "businesses_update_own" ON businesses
  FOR UPDATE USING (auth.uid() = user_id);

-- Negotiations: Businesses can see their negotiations
CREATE POLICY "negotiations_select_own" ON negotiations
  FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

-- Executions: Businesses can see their executions
CREATE POLICY "executions_select_own" ON executions
  FOR SELECT USING (
    negotiation_id IN (
      SELECT id FROM negotiations
      WHERE business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
    )
  );

-- Intents: Businesses can see intents for their negotiations
CREATE POLICY "intents_select_via_negotiation" ON intents
  FOR SELECT USING (
    id IN (
      SELECT intent_id FROM negotiations
      WHERE business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
    )
  );

-- Consumers: Businesses can see consumers for their executions
CREATE POLICY "consumers_select_via_execution" ON consumers
  FOR SELECT USING (
    id IN (
      SELECT i.consumer_id FROM intents i
      JOIN negotiations n ON n.intent_id = i.id
      JOIN executions e ON e.negotiation_id = n.id
      WHERE n.business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
    )
  );

-- Ratings: Businesses can see ratings for their business
CREATE POLICY "ratings_select_own" ON ratings
  FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

-- =============================================================================
-- SERVICE ROLE POLICIES (for API routes with service role key)
-- =============================================================================

-- Allow service role full access (for admin operations)
CREATE POLICY "service_role_all_consumers" ON consumers
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "service_role_all_businesses" ON businesses
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "service_role_all_intents" ON intents
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "service_role_all_negotiations" ON negotiations
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "service_role_all_executions" ON executions
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "service_role_all_conversations" ON conversations
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "service_role_all_ratings" ON ratings
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Generate execution ID
CREATE OR REPLACE FUNCTION generate_execution_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'exec_' || LPAD(floor(random() * 10000000)::text, 7, '0');
END;
$$ LANGUAGE plpgsql;

-- Update business trust score based on ratings
CREATE OR REPLACE FUNCTION update_business_trust_score()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC;
  rating_count INTEGER;
  new_trust_score INTEGER;
BEGIN
  -- Calculate average rating
  SELECT AVG(score), COUNT(*) INTO avg_rating, rating_count
  FROM ratings
  WHERE business_id = NEW.business_id;

  -- Calculate trust score (base 50, adjusts based on ratings)
  -- More ratings = more influence on score
  new_trust_score := LEAST(100, GREATEST(0,
    CASE
      WHEN rating_count = 0 THEN 50
      WHEN rating_count < 5 THEN 50 + ((avg_rating - 3) * 5 * (rating_count / 5.0))
      ELSE 50 + ((avg_rating - 3) * 10)
    END
  ))::INTEGER;

  UPDATE businesses
  SET trust_score = new_trust_score
  WHERE id = NEW.business_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_trust_score
AFTER INSERT OR UPDATE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_business_trust_score();

-- =============================================================================
-- VIEWS FOR DASHBOARD
-- =============================================================================

-- Lead view for business dashboard
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
  n.created_at,
  n.notified_at,
  n.claimed_at,
  n.business_id,
  c.name as consumer_name
FROM negotiations n
JOIN intents i ON i.id = n.intent_id
JOIN consumers c ON c.id = i.consumer_id;
