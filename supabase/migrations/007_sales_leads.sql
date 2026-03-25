-- Sales Leads from Scraped Google Places Data
-- For business acquisition/outreach during home services launch

CREATE TABLE sales_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Google Places identifiers
  place_id TEXT UNIQUE NOT NULL,
  google_cid TEXT,

  -- Business info
  title TEXT NOT NULL,
  category_name TEXT,
  categories JSONB,

  -- Contact
  phone TEXT,
  phone_unformatted TEXT,
  website TEXT,

  -- Location
  address TEXT,
  city TEXT,
  neighborhood TEXT,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),

  -- Quality signals
  total_score DECIMAL(2,1),
  reviews_count INTEGER DEFAULT 0,
  opening_hours JSONB,

  -- Sales pipeline
  nida_category TEXT,  -- mapped category (e.g., 'home_services.pest_control')
  outreach_status TEXT DEFAULT 'new'
    CHECK (outreach_status IN ('new', 'contacted', 'interested', 'not_interested', 'converted', 'invalid')),
  contacted_at TIMESTAMPTZ,
  follow_up_at TIMESTAMPTZ,
  notes TEXT,

  -- Conversion tracking
  converted_business_id UUID REFERENCES businesses(id),

  -- Metadata
  source_file TEXT,
  scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sales workflow
CREATE INDEX idx_leads_status ON sales_leads(outreach_status);
CREATE INDEX idx_leads_category ON sales_leads(nida_category);
CREATE INDEX idx_leads_rating ON sales_leads(total_score DESC NULLS LAST);
CREATE INDEX idx_leads_follow_up ON sales_leads(follow_up_at) WHERE follow_up_at IS NOT NULL;
CREATE INDEX idx_leads_city ON sales_leads(city);
CREATE INDEX idx_leads_phone ON sales_leads(phone) WHERE phone IS NOT NULL;

-- Row Level Security
ALTER TABLE sales_leads ENABLE ROW LEVEL SECURITY;

-- Service role policy for admin operations
CREATE POLICY "service_role_all_sales_leads" ON sales_leads
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_sales_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sales_leads_updated_at
BEFORE UPDATE ON sales_leads
FOR EACH ROW
EXECUTE FUNCTION update_sales_leads_updated_at();
