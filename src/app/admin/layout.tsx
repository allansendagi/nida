import { Sidebar } from '@/components/dashboard/sidebar';
import { createClient } from '@/lib/supabase/server';
import { isCurrentUserAdmin, linkAdminUser } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Link admin record if email matches but user_id is null
  await linkAdminUser(user.id, user.email);

  // Check if user is admin using database
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isAdmin={true} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
