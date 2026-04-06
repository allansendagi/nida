import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminApi } from '@/lib/auth/admin';
import { matchBusinessesToIntent, filterByLeadTime } from '@/lib/nomos/discover';
import { createDiscoverMessage } from '@/lib/nomos/protocol';
import { startSequentialDispatch } from '@/lib/notifications';
import type { IntentData } from '@/types/nomos';

export async function POST(request: Request) {
  // Require admin access
  const adminCheck = await requireAdminApi();
  if (adminCheck.error) {
    return NextResponse.json(
      { error: adminCheck.error.message },
      { status: adminCheck.error.status }
    );
  }

  try {
    const body = await request.json();
    const { consumerPhone, consumerName, intentData } = body;

    if (!consumerPhone || !intentData?.category || !intentData?.location?.zone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // 1. Create or get consumer
    let { data: consumer } = await supabase
      .from('consumers')
      .select('*')
      .eq('phone', consumerPhone)
      .single();

    if (!consumer) {
      const { data: newConsumer, error: consumerError } = await supabase
        .from('consumers')
        .insert({ phone: consumerPhone, name: consumerName })
        .select()
        .single();

      if (consumerError) {
        return NextResponse.json(
          { error: `Failed to create consumer: ${consumerError.message}` },
          { status: 500 }
        );
      }
      consumer = newConsumer;
    }

    // 2. Create intent
    const fullIntentData: IntentData = {
      category: intentData.category,
      location: {
        zone: intentData.location.zone,
        text: intentData.location.text,
      },
      budget: intentData.budget,
      urgency: intentData.urgency || 'this_week',
      specifics: intentData.specifics,
    };

    const { data: intent, error: intentError } = await supabase
      .from('intents')
      .insert({
        consumer_id: consumer.id,
        status: 'structured',
        intent_data: fullIntentData,
      })
      .select()
      .single();

    if (intentError) {
      return NextResponse.json(
        { error: `Failed to create intent: ${intentError.message}` },
        { status: 500 }
      );
    }

    // 3. Run DISCOVER - get all non-rejected businesses (consistent with conversation flow)
    const { data: businesses, error: bizError } = await supabase
      .from('businesses')
      .select('*')
      .neq('approval_status', 'rejected');

    if (bizError) {
      return NextResponse.json(
        { error: `Failed to fetch businesses: ${bizError.message}` },
        { status: 500 }
      );
    }

    // 4. Match businesses to intent
    let matches = matchBusinessesToIntent(businesses || [], fullIntentData, 5);

    // Filter by lead time based on urgency
    matches = filterByLeadTime(matches, fullIntentData.urgency);

    // 5. Create negotiation records for matches
    // All start as 'pending', only rank #1 will be 'offered' via sequential dispatch
    const negotiations = [];

    for (const match of matches) {
      const discoverMessage = createDiscoverMessage(
        match.score,
        match.rank,
        match.breakdown
      );

      const { data: negotiation, error: negError } = await supabase
        .from('negotiations')
        .insert({
          intent_id: intent.id,
          business_id: match.business.id,
          state: 'discovered',
          messages: [discoverMessage],
          match_score: match.score,
          score_breakdown: match.breakdown,
          match_rank: match.rank,
          offer_state: 'pending', // All start as pending
        })
        .select()
        .single();

      if (!negError && negotiation) {
        negotiations.push(negotiation);
      }
    }

    // 6. Update intent status
    await supabase
      .from('intents')
      .update({ status: matches.length > 0 ? 'matching' : 'structured' })
      .eq('id', intent.id);

    // 7. START SEQUENTIAL DISPATCH - only notifies rank #1
    let dispatchResult: { success: boolean; offeredTo?: string; error?: string } = { success: false };
    if (negotiations.length > 0) {
      dispatchResult = await startSequentialDispatch(intent.id);
      console.log(`Sequential dispatch started: offered to ${dispatchResult.offeredTo || 'none'}`);
    }

    return NextResponse.json({
      intent,
      matchCount: matches.length,
      negotiations,
      dispatch: dispatchResult,
    });
  } catch (error) {
    console.error('Error in POST /api/admin/intents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
