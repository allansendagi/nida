import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import type { ServiceCategory } from '@/types/database';

// Revalidate cached data every hour
export const revalidate = 3600;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leafOnly = searchParams.get('leaf') === 'true';
    const parentId = searchParams.get('parent');

    const supabase = createServiceClient();

    let query = supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (leafOnly) {
      // Leaf categories have no children - they have a parent_id but no other categories reference them
      // For simplicity, we consider categories with specifics_to_collect as leaf nodes
      query = query.not('parent_id', 'is', null);
    }

    if (parentId) {
      query = query.eq('parent_id', parentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If requesting leaf nodes, filter to only those with specifics_to_collect
    let categories = data as ServiceCategory[];
    if (leafOnly) {
      categories = categories.filter(
        (c) => c.specifics_to_collect && c.specifics_to_collect.length > 0
      );
    }

    return NextResponse.json(
      { categories },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

