-- Admin users table for database-backed admin access
-- This replaces email domain checking with explicit admin records

-- =============================================================================
-- ADMIN USERS TABLE
-- =============================================================================

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "service_role_all_admin_users" ON admin_users
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Admins can read admin list
CREATE POLICY "admins_can_read_admin_users" ON admin_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- =============================================================================
-- INITIAL SUPER ADMIN
-- =============================================================================

-- Insert initial super admin (user_id will be linked on first login)
INSERT INTO admin_users (email, role, user_id)
VALUES ('allansendagi@gmail.com', 'super_admin', NULL)
ON CONFLICT (email) DO NOTHING;
