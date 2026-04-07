import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { sendWhatsAppRatingRequest } from '@/lib/notifications/channels/whatsapp';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: Props) {
  try {
    const { id: executionId } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify this execution belongs to this user's business
    const service = createServiceClient();

    const { data: execution } = await service
      .from('executions')
      .select(`
        *,
        negotiation:negotiations (
          id, business_id,
          intent:intents (
            id,
            consumer:consumers (telegram_chat_id, phone, name),
            intent_data
          )
        )
      `)
      .eq('id', executionId)
      .single();

    if (!execution) return NextResponse.json({ error: 'Execution not found' }, { status: 404 });

    // Auth check — verify user owns the business
    const { data: business } = await supabase
      .from('businesses')
      .select('id, display_name')
      .eq('id', execution.negotiation?.business_id)
      .eq('user_id', user.id)
      .single();

    if (!business) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    if (execution.status !== 'confirmed') {
      return NextResponse.json({ error: 'Job is not in confirmed state' }, { status: 400 });
    }

    // Mark complete
    const { error: updateError } = await service
      .from('executions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        rating_status: 'requested',
        rating_requested_at: new Date().toISOString(),
      })
      .eq('id', executionId);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    // Mark intent as settled
    if (execution.negotiation?.intent?.id) {
      await service
        .from('intents')
        .update({ status: 'settled' })
        .eq('id', execution.negotiation.intent.id);
    }

    // Send rating request to consumer via Telegram
    const consumer = execution.negotiation?.intent?.consumer;
    const intentData = execution.negotiation?.intent?.intent_data;
    const category = (intentData?.category as string)?.split('.').pop()?.replace(/_/g, ' ') || 'service';

    const chatId = consumer?.telegram_chat_id ||
      (consumer?.phone?.startsWith('tg:') ? consumer.phone.slice(3) : null);

    if (chatId) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (botToken) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(8000),
          body: JSON.stringify({
            chat_id: chatId,
            text: `✅ <b>Your ${category} job with ${business.display_name} has been completed!</b>\n\nHow did it go? Your rating helps other customers find great providers.`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[
                { text: '⭐⭐⭐⭐⭐', callback_data: `rate:5:${executionId}` },
                { text: '⭐⭐⭐⭐', callback_data: `rate:4:${executionId}` },
                { text: '⭐⭐⭐', callback_data: `rate:3:${executionId}` },
              ]],
            },
          }),
        }).catch(err => console.error('Failed to send rating request:', err));
      }
    } else if (consumer?.phone && !consumer.phone.startsWith('tg:')) {
      // WhatsApp consumer — send interactive rating prompt
      await sendWhatsAppRatingRequest(
        consumer.phone,
        executionId,
        business.display_name,
        category
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error completing execution:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
