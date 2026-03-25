import { createClient } from '@/lib/supabase/server';
import { LeadFeed } from '@/components/dashboard/lead-feed';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get business for current user
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user!.id)
    .single();

  // State 1: No business exists - prompt to complete profile
  if (!business) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-4">Welcome to Nida</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="font-semibold text-blue-800 text-lg">Complete Your Business Profile</h2>
          <p className="text-blue-700 mt-2 mb-4">
            To start receiving leads, you need to set up your business profile. This includes
            your service categories, service areas, and pricing information.
          </p>
          <Link
            href="/dashboard/onboarding"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  // State 2: Business exists, pending approval
  if (business.approval_status === 'pending') {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-4">Welcome to Nida</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-yellow-800 text-lg">Application Under Review</h2>
              <p className="text-yellow-700 mt-2">
                Thank you for submitting your business profile! Our team is currently reviewing your
                application. This typically takes 1-2 business days.
              </p>
              <p className="text-yellow-700 mt-2">
                We&apos;ll notify you by email once your application has been reviewed.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Your Submitted Information</h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Business Name</dt>
              <dd className="font-medium">{business.display_name}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium">{business.phone}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Categories</dt>
              <dd className="font-medium">{business.categories.join(', ')}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Service Zones</dt>
              <dd className="font-medium">{business.service_zones.length} zones</dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }

  // State 3: Business exists, rejected - show rejection reason and edit button
  if (business.approval_status === 'rejected') {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-4">Welcome to Nida</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-red-800 text-lg">Application Needs Revision</h2>
              <p className="text-red-700 mt-2">
                Unfortunately, your application could not be approved at this time. Please review the
                feedback below and resubmit your application.
              </p>
              {business.approval_notes && (
                <div className="mt-4 p-3 bg-red-100 rounded-md">
                  <p className="text-sm font-medium text-red-800">Reviewer Feedback:</p>
                  <p className="text-red-700 mt-1">{business.approval_notes}</p>
                </div>
              )}
              <div className="mt-4">
                <Link
                  href="/dashboard/onboarding"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Edit and Resubmit
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 4: Business exists, approved - show normal dashboard with leads
  // Get leads for this business
  const { data: leads } = await supabase
    .from('lead_view')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>
        <span className="text-sm text-gray-500">
          {leads?.length || 0} available
        </span>
      </div>
      <LeadFeed
        initialLeads={leads || []}
        businessId={business.id}
      />
    </div>
  );
}
