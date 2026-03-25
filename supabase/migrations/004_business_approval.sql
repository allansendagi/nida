-- Business Approval Workflow Schema Migration
-- Self-service registration with admin approval flow

-- =============================================================================
-- BUSINESSES: Add approval workflow fields
-- =============================================================================

-- Add columns
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS approval_notes TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- Add check constraint
ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_approval_status_check;
ALTER TABLE businesses ADD CONSTRAINT businesses_approval_status_check
  CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- =============================================================================
-- INDEXES for efficient queries
-- =============================================================================

-- Index for finding pending businesses for admin review
CREATE INDEX IF NOT EXISTS idx_businesses_approval_status
  ON businesses(approval_status)
  WHERE approval_status = 'pending';

-- =============================================================================
-- Set existing businesses to approved (grandfather them in)
-- =============================================================================

UPDATE businesses SET approval_status = 'approved', approved_at = created_at
WHERE approval_status IS NULL OR approval_status = 'pending';
