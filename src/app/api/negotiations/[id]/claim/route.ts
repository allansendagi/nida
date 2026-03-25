import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { createAcceptMessage, appendMessage } from '@/lib/nomos/protocol';
import { generateExecutionId } from '@/lib/utils';
import type { AgreedTerms, NomosContract, ProtocolMessage } from '@/types/nomos';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Props) {
  try {
    const { id: negotiationId } = await params;
    const body = await request.json();
    const { businessId } = body;

    const userSupabase = await createClient();
    const serviceSupabase = createServiceClient();

    // Verify user owns this business
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: business } = await userSupabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Get the negotiation
    const { data: negotiation, error: negError } = await serviceSupabase
      .from('negotiations')
      .select(`
        *,
        intent:intents (
          *,
          consumer:consumers (*)
        )
      `)
      .eq('id', negotiationId)
      .eq('business_id', businessId)
      .single();

    if (negError || !negotiation) {
      return NextResponse.json({ error: 'Negotiation not found' }, { status: 404 });
    }

    // Check if already claimed
    if (negotiation.state !== 'discovered') {
      return NextResponse.json(
        { error: 'Lead already claimed or in different state' },
        { status: 400 }
      );
    }

    const contract = business.nomos_contract as NomosContract;
    const intent = negotiation.intent;

    // Calculate agreed terms based on contract and intent
    const basePrice = contract.pricing.rules[0]?.base || 350;
    const urgencyMultiplier = contract.pricing.urgency_multiplier?.[intent.intent_data.urgency as keyof typeof contract.pricing.urgency_multiplier] || 1;
    const finalPrice = Math.round(basePrice * urgencyMultiplier);

    const agreedTerms: AgreedTerms = {
      price: finalPrice,
      currency: contract.pricing.currency,
      date: new Date().toISOString(),
      warranty_days: contract.terms.warranty_days,
      payment_method: 'cash',
      cancellation: {
        free_until: new Date(Date.now() + contract.terms.cancellation_policy.free_cancellation_hours * 60 * 60 * 1000).toISOString(),
        fee: Math.round(finalPrice * contract.terms.cancellation_policy.fee_percentage / 100),
      },
    };

    // Generate execution ID
    const executionId = generateExecutionId();

    // Create ACCEPT message
    const acceptMessage = createAcceptMessage(executionId, agreedTerms);
    const updatedMessages = appendMessage(
      negotiation.messages as ProtocolMessage[],
      acceptMessage
    );

    // Update negotiation
    const { error: updateNegError } = await serviceSupabase
      .from('negotiations')
      .update({
        state: 'accepted',
        messages: updatedMessages,
        claimed_at: new Date().toISOString(),
      })
      .eq('id', negotiationId);

    if (updateNegError) {
      return NextResponse.json(
        { error: `Failed to update negotiation: ${updateNegError.message}` },
        { status: 500 }
      );
    }

    // Create execution record
    const { data: execution, error: execError } = await serviceSupabase
      .from('executions')
      .insert({
        execution_id: executionId,
        negotiation_id: negotiationId,
        agreed_terms: agreedTerms,
        status: 'confirmed',
        consumer_contact: {
          phone: intent.consumer.phone,
          name: intent.consumer.name || 'Customer',
        },
      })
      .select()
      .single();

    if (execError) {
      return NextResponse.json(
        { error: `Failed to create execution: ${execError.message}` },
        { status: 500 }
      );
    }

    // Update intent status
    await serviceSupabase
      .from('intents')
      .update({ status: 'executing' })
      .eq('id', intent.id);

    return NextResponse.json({
      success: true,
      execution,
      consumerContact: execution.consumer_contact,
    });
  } catch (error) {
    console.error('Error in POST /api/negotiations/[id]/claim:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
