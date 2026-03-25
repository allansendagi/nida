import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileEditor } from '@/components/dashboard/profile-editor';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get business for current user
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!business) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Business Profile</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="font-semibold text-yellow-800">Setup Required</h2>
          <p className="text-yellow-700 mt-1">
            Your business profile has not been set up yet. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Business Profile</h1>
      <ProfileEditor business={business} />
    </div>
  );
}
