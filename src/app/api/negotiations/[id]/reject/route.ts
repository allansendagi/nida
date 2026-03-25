import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { rejectOffer } from '@/lib/notifications';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Props) {
  try {
    const { id: negotiationId } = await params;
    const body = await request.json();
    const { businessId, reason } = body;

    const userSupabase = await createClient();
    const serviceSupabase = createServiceClient();

    // Verify user owns this business
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

    // Verify this negotiation belongs to this business
    const { data: negotiation, error: negError } = await serviceSupabase
      .from('negotiations')
      .select('id, offer_state, intent_id')
      .eq('id', negotiationId)
      .eq('business_id', businessId)
      .single();

    if (negError || !negotiation) {
      return NextResponse.json({ error: 'Negotiation not found' }, { status: 404 });
    }

    // Check offer state - must be 'offered' to reject
    if (negotiation.offer_state !== 'offered') {
      return NextResponse.json(
        { error: `Cannot reject: this offer is in '${negotiation.offer_state}' state` },
        { status: 400 }
      );
    }

    // Reject the offer and escalate to next provider
    const result = await rejectOffer(negotiationId, reason);

    if (!result.success && !result.escalatedTo) {
      // All providers exhausted
      return NextResponse.json({
        success: true,
        message: 'Lead rejected. All providers have been exhausted.',
        escalatedTo: null,
      });
    }

    return NextResponse.json({
      success: true,
      message: result.escalatedTo
        ? `Lead rejected. Escalated to ${result.escalatedTo}.`
        : 'Lead rejected.',
      escalatedTo: result.escalatedTo || null,
    });
  } catch (error) {
    console.error('Error in POST /api/negotiations/[id]/reject:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
