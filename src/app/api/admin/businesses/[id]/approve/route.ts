import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminApi } from '@/lib/auth/admin';
import { sendTelegramReply } from '@/lib/notifications/channels/telegram';
import { sendWhatsAppReply } from '@/lib/notifications/channels/whatsapp';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require admin access
  const adminCheck = await requireAdminApi();
  if (adminCheck.error) {
    return NextResponse.json(
      { error: adminCheck.error.message },
      { status: adminCheck.error.status }
    );
  }

  try {
    const { id } = await params;
    const { user } = adminCheck;

    const serviceClient = createServiceClient();

    // Verify business exists and is pending
    const { data: business } = await serviceClient
      .from('businesses')
      .select('id, approval_status, user_id, email, display_name')
      .eq('id', id)
      .single();

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    if (business.approval_status !== 'pending') {
      return NextResponse.json(
        { error: 'Business is not pending approval' },
        { status: 400 }
      );
    }

    // Update business to approved
    const { data, error } = await serviceClient
      .from('businesses')
      .update({
        approval_status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id,
        approval_notes: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error approving business:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Re-alert consumers with unmatched intents that this business can now serve
    rematchNoProviderIntents(serviceClient, data).catch(err =>
      console.error('rematchNoProviderIntents error:', err)
    );

    return NextResponse.json({ business: data });
  } catch (error) {
    console.error('Error in POST /api/admin/businesses/[id]/approve:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * After a business is approved, find any unmatched (no_providers) intents
 * in overlapping zones/categories and notify those consumers that help is now available.
 */
async function rematchNoProviderIntents(
  supabase: ReturnType<typeof createServiceClient>,
  business: { id: string; categories: string[]; service_zones: string[]; display_name: string }
) {
  // Fetch intents that previously had no providers
  const { data: intents, error } = await supabase
    .from('intents')
    .select('*, consumer:consumers(*)')
    .eq('status', 'no_providers')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !intents || intents.length === 0) return;

  const bizCategories: string[] = business.categories || [];
  const bizZones: string[] = business.service_zones || [];

  for (const intent of intents) {
    const intentData = intent.intent_data as { category?: string; location?: { zone?: string } };
    const intentCategory = intentData?.category || '';
    const intentZone = intentData?.location?.zone || '';

    // Check zone overlap
    if (!bizZones.includes(intentZone)) continue;

    // Check category overlap: intent category must start with or match a business category prefix
    const categoryMatch = bizCategories.some(bc => {
      const prefix = bc.split('.').slice(0, 2).join('.');
      return intentCategory.startsWith(prefix) || bc.startsWith(intentCategory);
    });

    if (!categoryMatch) continue;

    // This business can serve this intent — notify the consumer
    const consumer = intent.consumer as { telegram_chat_id?: string; phone?: string } | null;
    if (!consumer) continue;

    const categoryLabel = intentCategory.split('.').pop()?.replace(/_/g, ' ') || 'service';
    const zoneLabel = intentZone.replace(/_/g, ' ');

    const message =
      `🎉 <b>Good news!</b>\n\n` +
      `A new provider just joined Nida and is available for <b>${categoryLabel}</b> in <b>${zoneLabel}</b>!\n\n` +
      `Just send us a new message with your request and we'll match you right away.`;

    const telegramId = consumer.telegram_chat_id ||
      (consumer.phone?.startsWith('tg:') ? consumer.phone.slice(3) : null);

    if (telegramId) {
      await sendTelegramReply(telegramId, message);
    } else if (consumer.phone && !consumer.phone.startsWith('tg:')) {
      await sendWhatsAppReply(consumer.phone, message);
    }

    // Mark intent as re-alerted so we don't spam consumers
    await supabase
      .from('intents')
      .update({ status: 'structured' })
      .eq('id', intent.id);

    console.log(`Re-alerted consumer for intent ${intent.id} after business ${business.id} approved`);
  }
}
