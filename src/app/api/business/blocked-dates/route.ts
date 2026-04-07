import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: business } = await supabase
      .from('businesses')
      .select('blocked_dates')
      .eq('user_id', user.id)
      .single();

    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 });

    return NextResponse.json({ dates: business.blocked_dates ?? [] });
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { dates } = await request.json();
    if (!Array.isArray(dates)) {
      return NextResponse.json({ error: 'dates must be an array' }, { status: 400 });
    }

    // Validate all entries are ISO date strings (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dates.some((d: unknown) => typeof d !== 'string' || !dateRegex.test(d))) {
      return NextResponse.json({ error: 'Invalid date format — use YYYY-MM-DD' }, { status: 400 });
    }

    const { error } = await supabase
      .from('businesses')
      .update({ blocked_dates: dates })
      .eq('user_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, dates });
  } catch (error) {
    console.error('Error saving blocked dates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
