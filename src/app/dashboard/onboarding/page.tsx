import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BusinessProfileForm } from '@/components/dashboard/business-profile-form';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user already has a business
  const { data: existingBusiness } = await supabase
    .from('businesses')
    .select('id, display_name, phone, email, categories, service_zones, approval_status, approval_notes, cr_number')
    .eq('user_id', user.id)
    .single();

  // If business exists and is approved, redirect to dashboard
  if (existingBusiness?.approval_status === 'approved') {
    redirect('/dashboard');
  }

  // If business exists and is pending, redirect to dashboard (they'll see pending message)
  if (existingBusiness?.approval_status === 'pending') {
    redirect('/dashboard');
  }

  // If business was rejected, allow them to edit and resubmit
  const isResubmission = existingBusiness?.approval_status === 'rejected';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          {isResubmission ? 'Update Your Business Profile' : 'Complete Your Business Profile'}
        </h1>
        <p className="text-gray-600">
          {isResubmission
            ? 'Please address the feedback below and resubmit your application for review.'
            : 'Fill out the form below to register your business on Nida. Once submitted, our team will review your application.'}
        </p>
      </div>

      <BusinessProfileForm
        existingBusiness={isResubmission ? existingBusiness : null}
      />
    </div>
  );
}
