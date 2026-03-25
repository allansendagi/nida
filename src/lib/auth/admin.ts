import { createClient, createServiceClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export interface AdminUser {
  id: string;
  user_id: string | null;
  email: string;
  role: 'admin' | 'super_admin';
  created_at: string;
  created_by: string | null;
}

/**
 * Check if the current authenticated user is an admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  // Use service client to check admin_users table
  const serviceClient = createServiceClient();

  // Check by user_id first (for linked accounts)
  const { data: adminByUserId } = await serviceClient
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (adminByUserId) {
    return true;
  }

  // Check by email (for accounts not yet linked)
  const { data: adminByEmail } = await serviceClient
    .from('admin_users')
    .select('id')
    .eq('email', user.email)
    .single();

  return !!adminByEmail;
}

/**
 * Get admin record for a specific user ID
 */
export async function getAdminUser(userId: string): Promise<AdminUser | null> {
  const serviceClient = createServiceClient();

  const { data } = await serviceClient
    .from('admin_users')
    .select('*')
    .eq('user_id', userId)
    .single();

  return data as AdminUser | null;
}

/**
 * Get admin record by email
 */
export async function getAdminUserByEmail(email: string): Promise<AdminUser | null> {
  const serviceClient = createServiceClient();

  const { data } = await serviceClient
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .single();

  return data as AdminUser | null;
}

/**
 * Link user_id to admin record on first login (if email matches)
 * This allows pre-registering admins by email before they create an account
 */
export async function linkAdminUser(userId: string, email: string | undefined): Promise<void> {
  if (!email) return;

  const serviceClient = createServiceClient();

  // Check if there's an admin record with this email but no user_id
  const { data: adminRecord } = await serviceClient
    .from('admin_users')
    .select('id, user_id')
    .eq('email', email)
    .single();

  if (adminRecord && !adminRecord.user_id) {
    // Link the user_id to the admin record
    await serviceClient
      .from('admin_users')
      .update({ user_id: userId })
      .eq('id', adminRecord.id);
  }
}

/**
 * Require admin access - throws/redirects if not admin
 * Use this at the start of admin pages or API routes
 */
export async function requireAdmin(): Promise<{ user: User; admin: AdminUser }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const serviceClient = createServiceClient();

  // First try to get by user_id
  let { data: admin } = await serviceClient
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // If not found by user_id, try by email
  if (!admin && user.email) {
    const { data: adminByEmail } = await serviceClient
      .from('admin_users')
      .select('*')
      .eq('email', user.email)
      .single();

    if (adminByEmail) {
      admin = adminByEmail;
      // Link the user_id for future lookups
      await linkAdminUser(user.id, user.email);
    }
  }

  if (!admin) {
    redirect('/dashboard');
  }

  return { user, admin: admin as AdminUser };
}

/**
 * Require admin access for API routes - returns error response if not admin
 * Use this in API route handlers instead of requireAdmin() which redirects
 */
export async function requireAdminApi(): Promise<{
  user: User;
  admin: AdminUser;
  error?: never;
} | {
  user?: never;
  admin?: never;
  error: { message: string; status: number };
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: { message: 'Authentication required', status: 401 } };
  }

  const serviceClient = createServiceClient();

  // First try to get by user_id
  let { data: admin } = await serviceClient
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // If not found by user_id, try by email
  if (!admin && user.email) {
    const { data: adminByEmail } = await serviceClient
      .from('admin_users')
      .select('*')
      .eq('email', user.email)
      .single();

    if (adminByEmail) {
      admin = adminByEmail;
      // Link the user_id for future lookups
      await linkAdminUser(user.id, user.email);
    }
  }

  if (!admin) {
    return { error: { message: 'Admin access required', status: 403 } };
  }

  return { user, admin: admin as AdminUser };
}

/**
 * Check if user is a super admin (can manage other admins)
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const serviceClient = createServiceClient();

  const { data } = await serviceClient
    .from('admin_users')
    .select('role')
    .eq('user_id', userId)
    .single();

  return data?.role === 'super_admin';
}
