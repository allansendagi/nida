import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { LeadDetail } from '@/components/dashboard/lead-detail';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
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
    redirect('/dashboard');
  }

  // Get negotiation with intent and consumer details
  const { data: negotiation, error } = await supabase
    .from('negotiations')
    .select(`
      *,
      intent:intents (
        *,
        consumer:consumers (*)
      )
    `)
    .eq('id', id)
    .eq('business_id', business.id)
    .single();

  if (error || !negotiation) {
    notFound();
  }

  // Get execution if exists
  const { data: execution } = await supabase
    .from('executions')
    .select('*')
    .eq('negotiation_id', id)
    .single();

  return (
    <div className="max-w-2xl">
      <LeadDetail
        negotiation={negotiation}
        execution={execution}
        businessId={business.id}
      />
    </div>
  );
}
