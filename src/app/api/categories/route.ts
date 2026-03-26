import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

interface ServiceCategory {
  id: string;
  parent_id: string | null;
  name: string;
  description: string;
  keywords: string[];
  common_phrases: string[];
  specifics_to_collect: string[];
  is_active: boolean;
  display_order: number;
}

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

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper type for hierarchical categories
interface CategoryWithChildren extends ServiceCategory {
  children?: CategoryWithChildren[];
}

// Helper function to build category tree (not used currently, kept for future use)
async function buildCategoryTree(
  categories: ServiceCategory[]
): Promise<CategoryWithChildren[]> {
  const categoryMap = new Map<string, CategoryWithChildren>();
  const roots: CategoryWithChildren[] = [];

  // First pass: create map of all categories
  for (const cat of categories) {
    categoryMap.set(cat.id, { ...cat, children: [] });
  }

  // Second pass: build tree structure
  for (const cat of categories) {
    const node = categoryMap.get(cat.id)!;
    if (cat.parent_id && categoryMap.has(cat.parent_id)) {
      const parent = categoryMap.get(cat.parent_id)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else if (!cat.parent_id) {
      roots.push(node);
    }
  }

  return roots;
}
