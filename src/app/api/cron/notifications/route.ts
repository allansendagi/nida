import { NextResponse } from 'next/server';
import { processNotificationQueue, processExpiredOffers } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions)
// Every 5 minutes is a good interval

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Process queued/failed notifications
    const queueResult = await processNotificationQueue();

    // Process expired offers and escalate to next provider
    const expiredResult = await processExpiredOffers();

    return NextResponse.json({
      success: true,
      notifications: {
        processed: queueResult.processed,
      },
      expiredOffers: {
        processed: expiredResult.processed,
        escalated: expiredResult.escalated,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron notification processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
