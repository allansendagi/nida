import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminApi } from '@/lib/auth/admin';
import { processIntake, validateIntentData } from '@/lib/ai/intake';
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
    const { consumerPhone, consumerName, message } = body;

    if (!consumerPhone || !message) {
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

    // 2. Get or create conversation
    let { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('consumer_id', consumer.id)
      .eq('state', 'greeting')
      .or('state.eq.clarifying')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!conversation) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          consumer_id: consumer.id,
          phone: consumerPhone,
          state: 'greeting',
          messages: [],
          partial_intent: {},
        })
        .select()
        .single();

      if (convError) {
        return NextResponse.json(
          { error: `Failed to create conversation: ${convError.message}` },
          { status: 500 }
        );
      }
      conversation = newConv;
    }

    // 3. Add consumer message to conversation
    const updatedMessages = [
      ...(conversation.messages || []),
      { role: 'consumer', content: message, timestamp: new Date().toISOString() },
    ];

    // 4. Process with AI
    const intakeResult = await processIntake(
      updatedMessages.map((m: { role: string; content: string }) => ({
        role: m.role as 'consumer' | 'assistant',
        content: m.content,
      }))
    );

    // 5. Check if intent is complete
    const validation = validateIntentData(intakeResult.intent_data);

    if (intakeResult.complete && validation.valid) {
      // Create the intent and run DISCOVER
      const fullIntentData: IntentData = {
        category: intakeResult.intent_data.category!,
        location: {
          zone: intakeResult.intent_data.location!.zone,
          text: intakeResult.intent_data.location?.text,
        },
        budget: intakeResult.intent_data.budget,
        urgency: intakeResult.intent_data.urgency || 'this_week',
        specifics: intakeResult.intent_data.specifics,
      };

      const { data: intent, error: intentError } = await supabase
        .from('intents')
        .insert({
          consumer_id: consumer.id,
          status: 'structured',
          intent_data: fullIntentData,
          original_message: message,
        })
        .select()
        .single();

      if (intentError) {
        return NextResponse.json(
          { error: `Failed to create intent: ${intentError.message}` },
          { status: 500 }
        );
      }

      // Update conversation
      await supabase
        .from('conversations')
        .update({
          state: 'complete',
          intent_id: intent.id,
          messages: updatedMessages,
          partial_intent: fullIntentData,
        })
        .eq('id', conversation.id);

      // Run DISCOVER
      const { data: businesses } = await supabase.from('businesses').select('*');
      let matches = matchBusinessesToIntent(businesses || [], fullIntentData, 5);
      matches = filterByLeadTime(matches, fullIntentData.urgency);

      // Create negotiations - all start as 'pending', only rank #1 will be 'offered'
      const negotiations = [];

      for (const match of matches) {
        const discoverMessage = createDiscoverMessage(match.score, match.rank, match.breakdown);
        const { data: negotiation } = await supabase
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

        if (negotiation) {
          negotiations.push(negotiation);
        }
      }

      // Update intent status
      await supabase
        .from('intents')
        .update({ status: matches.length > 0 ? 'matching' : 'structured' })
        .eq('id', intent.id);

      // START SEQUENTIAL DISPATCH - only notifies rank #1
      let dispatchResult: { success: boolean; offeredTo?: string; error?: string } = { success: false };
      if (negotiations.length > 0) {
        dispatchResult = await startSequentialDispatch(intent.id);
      }

      return NextResponse.json({
        complete: true,
        intent,
        matchCount: matches.length,
        dispatch: dispatchResult,
      });
    } else {
      // Need more information - update conversation
      const clarifyingQuestion = intakeResult.clarifying_question ||
        `Could you please provide your ${validation.missing[0]}?`;

      const messagesWithResponse = [
        ...updatedMessages,
        { role: 'assistant', content: clarifyingQuestion, timestamp: new Date().toISOString() },
      ];

      await supabase
        .from('conversations')
        .update({
          state: 'clarifying',
          messages: messagesWithResponse,
          partial_intent: intakeResult.intent_data,
        })
        .eq('id', conversation.id);

      return NextResponse.json({
        complete: false,
        clarifyingQuestion,
        partialIntent: intakeResult.intent_data,
      });
    }
  } catch (error) {
    console.error('Error in POST /api/admin/intents/ai:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
