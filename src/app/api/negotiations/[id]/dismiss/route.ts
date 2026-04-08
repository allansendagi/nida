import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Dismiss a lead from the provider's dashboard.
 * Only allowed for terminal states: cancelled, expired, rejected.
 * Sets offer_state to 'dismissed' so it's filtered from the active feed.
 */
export async function POST(request: Request, { params }: Props) {
  try {
    const { id: negotiationId } = await params;
    const body = await request.json();
    const { businessId } = body;

    const userSupabase = await createClient();
    const serviceSupabase = createServiceClient();

    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: business } = await userSupabase
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const { data: negotiation } = await serviceSupabase
      .from('negotiations')
      .select('id, offer_state')
      .eq('id', negotiationId)
      .eq('business_id', businessId)
      .single();

    if (!negotiation) {
      return NextResponse.json({ error: 'Negotiation not found' }, { status: 404 });
    }

    const dismissable = ['cancelled', 'expired', 'rejected'];
    if (!dismissable.includes(negotiation.offer_state)) {
      return NextResponse.json(
        { error: 'Only cancelled, expired, or rejected leads can be dismissed' },
        { status: 400 }
      );
    }

    await serviceSupabase
      .from('negotiations')
      .update({ offer_state: 'dismissed' })
      .eq('id', negotiationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/negotiations/[id]/dismiss:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
