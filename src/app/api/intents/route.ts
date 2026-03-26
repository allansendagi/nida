import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminApi } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const adminCheck = await requireAdminApi();
  if (adminCheck.error) {
    return NextResponse.json(
      { error: adminCheck.error.message },
      { status: adminCheck.error.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = createServiceClient();

    let query = supabase
      .from('intents')
      .select(`
        *,
        consumer:consumers (*),
        negotiations (
          id,
          business_id,
          state,
          match_score,
          match_rank
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ intents: data });
  } catch (error) {
    console.error('Error in GET /api/intents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
