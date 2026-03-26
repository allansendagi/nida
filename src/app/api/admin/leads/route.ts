import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminApi } from '@/lib/auth/admin';

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdminApi();
  if (adminCheck.error) {
    return NextResponse.json(
      { error: adminCheck.error.message },
      { status: adminCheck.error.status }
    );
  }

  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);

    // Parse filters
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const minRating = searchParams.get('minRating');
    const hasPhone = searchParams.get('hasPhone');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('sales_leads')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('outreach_status', status);
    }

    if (category && category !== 'all') {
      query = query.eq('nida_category', category);
    }

    if (city && city !== 'all') {
      query = query.eq('city', city);
    }

    if (minRating) {
      query = query.gte('total_score', parseFloat(minRating));
    }

    if (hasPhone === 'true') {
      query = query.not('phone', 'is', null);
    }

    if (search) {
      // Escape special characters to prevent SQL injection in ilike patterns
      const escapedSearch = search.replace(/[%_\\]/g, '\\$&');
      query = query.or(`title.ilike.%${escapedSearch}%,phone.ilike.%${escapedSearch}%`);
    }

    // Order by rating (highest first), then by reviews count
    query = query
      .order('total_score', { ascending: false, nullsFirst: false })
      .order('reviews_count', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      leads: data,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get aggregate stats for the dashboard
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdminApi();
  if (adminCheck.error) {
    return NextResponse.json(
      { error: adminCheck.error.message },
      { status: adminCheck.error.status }
    );
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action !== 'stats') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Get counts by status
    const { data: statusCounts } = await supabase
      .from('sales_leads')
      .select('outreach_status')
      .then(({ data }) => {
        const counts: Record<string, number> = {};
        data?.forEach((row) => {
          counts[row.outreach_status] = (counts[row.outreach_status] || 0) + 1;
        });
        return { data: counts };
      });

    // Get counts by category
    const { data: categoryCounts } = await supabase
      .from('sales_leads')
      .select('nida_category')
      .not('nida_category', 'is', null)
      .then(({ data }) => {
        const counts: Record<string, number> = {};
        data?.forEach((row) => {
          if (row.nida_category) {
            counts[row.nida_category] = (counts[row.nida_category] || 0) + 1;
          }
        });
        return { data: counts };
      });

    // Get unique cities
    const { data: cities } = await supabase
      .from('sales_leads')
      .select('city')
      .not('city', 'is', null)
      .then(({ data }) => {
        const citySet = new Set<string>();
        data?.forEach((row) => {
          if (row.city) citySet.add(row.city);
        });
        return { data: Array.from(citySet).sort() };
      });

    // Get total count
    const { count: total } = await supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true });

    // Get leads with follow-up due
    const { count: followUpDue } = await supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .lte('follow_up_at', new Date().toISOString())
      .neq('outreach_status', 'converted')
      .neq('outreach_status', 'not_interested')
      .neq('outreach_status', 'invalid');

    return NextResponse.json({
      total,
      statusCounts,
      categoryCounts,
      cities,
      followUpDue,
    });
  } catch (error) {
    console.error('Error in POST /api/admin/leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
