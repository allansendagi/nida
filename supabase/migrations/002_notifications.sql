-- Notification dispatch tracking

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  negotiation_id UUID NOT NULL REFERENCES negotiations ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses ON DELETE CASCADE,

  -- Channel and status
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email', 'push')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),

  -- Delivery tracking
  external_id TEXT, -- WhatsApp message ID, SMS ID, etc.
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,

  -- Retry logic
  attempts INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ,

  -- Content (for debugging/audit)
  template TEXT,
  payload JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_negotiation ON notifications(negotiation_id);
CREATE INDEX idx_notifications_business ON notifications(business_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_pending ON notifications(status, next_retry_at)
  WHERE status IN ('pending', 'failed');

-- Business notification preferences
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "channels": ["whatsapp", "email"],
  "quiet_hours": {"start": "22:00", "end": "07:00"},
  "instant_alerts": true
}'::JSONB;

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

CREATE POLICY "service_role_all_notifications" ON notifications
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');
