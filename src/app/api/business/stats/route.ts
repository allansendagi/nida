import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: business } = await supabase
      .from('businesses')
      .select('id, trust_score, rating_summary')
      .eq('user_id', user.id)
      .single();

    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 });

    const service = createServiceClient();

    // Total leads received
    const { count: totalLeads } = await service
      .from('negotiations')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id);

    // Accepted leads
    const { count: acceptedLeads } = await service
      .from('negotiations')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id)
      .eq('offer_state', 'accepted');

    // Completed jobs
    const { count: completedJobs } = await service
      .from('executions')
      .select('*, negotiation:negotiations!inner(business_id)', { count: 'exact', head: true })
      .eq('negotiation.business_id', business.id)
      .eq('status', 'completed');

    // This month's leads
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: leadsThisMonth } = await service
      .from('negotiations')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id)
      .gte('created_at', startOfMonth.toISOString());

    const leadsReceived = totalLeads ?? 0;
    const accepted = acceptedLeads ?? 0;
    const acceptanceRate = leadsReceived > 0 ? Math.round((accepted / leadsReceived) * 100) : 0;

    const ratingSummary = business.rating_summary as { v2_average?: number; v2_count?: number } | null;

    return NextResponse.json({
      leadsReceived,
      acceptanceRate,
      jobsCompleted: completedJobs ?? 0,
      avgRating: ratingSummary?.v2_average ?? null,
      ratingCount: ratingSummary?.v2_count ?? 0,
      trustScore: business.trust_score ?? 50,
      leadsThisMonth: leadsThisMonth ?? 0,
    });
  } catch (error) {
    console.error('Error fetching business stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
