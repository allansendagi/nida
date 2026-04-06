import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getRedis } from '@/lib/redis';

const CODE_TTL_SECONDS = 600; // 10 minutes

function generateCode(): string {
  // 6 alphanumeric characters, uppercase — easy to type on mobile
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I ambiguity
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/**
 * POST /api/business/telegram-link
 * Generates a one-time code for the authenticated business to link their Telegram account.
 * The code expires in 10 minutes and is consumed by the Telegram bot on /link <CODE>.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the business for this user
  const serviceClient = createServiceClient();
  const { data: business } = await serviceClient
    .from('businesses')
    .select('id, display_name, telegram_chat_id')
    .eq('user_id', user.id)
    .single();

  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  const code = generateCode();
  const key = `tg_link:${code}`;

  await redis.set(key, { businessId: business.id, displayName: business.display_name }, {
    ex: CODE_TTL_SECONDS,
  });

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || '';
  const deepLink = botUsername ? `https://t.me/${botUsername}?start=link-${code}` : null;

  return NextResponse.json({
    code,
    expiresInSeconds: CODE_TTL_SECONDS,
    deepLink,
    alreadyLinked: !!business.telegram_chat_id,
  });
}
