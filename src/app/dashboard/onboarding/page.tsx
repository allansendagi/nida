'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BusinessProfileForm } from '@/components/dashboard/business-profile-form';
import { NomosUploadOnboarding } from '@/components/dashboard/nomos-upload-onboarding';

type Path = 'form' | 'nomos';

export default function OnboardingPage() {
  const [path, setPath] = useState<Path>('form');
  const [existingBusiness, setExistingBusiness] = useState<{
    id: string;
    display_name: string;
    phone: string;
    email: string | null;
    categories: string[];
    service_zones: string[];
    approval_status: string;
    approval_notes: string | null;
    cr_number: string | null;
  } | null>(null);
  const [isResubmission, setIsResubmission] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }

      const { data: biz } = await supabase
        .from('businesses')
        .select('id, display_name, phone, email, categories, service_zones, approval_status, approval_notes, cr_number')
        .eq('user_id', user.id)
        .single();

      if (biz?.approval_status === 'approved' || biz?.approval_status === 'pending') {
        router.replace('/dashboard');
        return;
      }

      if (biz?.approval_status === 'rejected') {
        setExistingBusiness(biz);
        setIsResubmission(true);
      }
    }
    load();
  }, [router]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          {isResubmission ? 'Update Your Business Profile' : 'Register Your Business'}
        </h1>
        <p className="text-muted-foreground">
          {isResubmission
            ? 'Please address the feedback below and resubmit your application for review.'
            : 'Choose how you want to set up your service profile.'}
        </p>
      </div>

      {/* Path toggle — only shown on first registration */}
      {!isResubmission && (
        <div className="mb-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPath('form')}
            className={`rounded-xl border p-4 text-left transition-all ${
              path === 'form'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
            }`}
          >
            <p className="font-semibold text-sm mb-1">Fill in a profile form</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Answer a few questions about your services, zones, and pricing. Takes about 2 minutes.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setPath('nomos')}
            className={`rounded-xl border p-4 text-left transition-all ${
              path === 'nomos'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
            }`}
          >
            <p className="font-semibold text-sm mb-1">
              Upload a{' '}
              <code className="text-xs bg-gray-100 px-1 rounded font-mono">.nomos</code>{' '}
              contract
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Already have a NOMOS contract? Upload it directly for precision matching.
            </p>
          </button>
        </div>
      )}

      {/* Render the chosen path */}
      {path === 'form' || isResubmission ? (
        <BusinessProfileForm existingBusiness={isResubmission ? existingBusiness : null} />
      ) : (
        <NomosUploadOnboarding />
      )}
    </div>
  );
}
