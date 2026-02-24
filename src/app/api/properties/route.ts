// =============================================================================
// THE A 5995 - Properties API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { propertySchema } from '@/lib/validations';
import { generateSlug } from '@/lib/utils';
import type { PaginatedResponse, PropertyWithDetails } from '@/types';

// ---------------------------------------------------------------------------
// GET /api/properties - List properties with filters
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = request.nextUrl;

    // Parse query parameters
    const type = searchParams.get('type');
    const transaction = searchParams.get('transaction');
    const province = searchParams.get('province');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const bedrooms = searchParams.get('bedrooms');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');
    const projectId = searchParams.get('project_id');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = Math.min(parseInt(searchParams.get('perPage') || '12', 10), 100);

    // Build the query
    let query = supabase
      .from('properties')
      .select(
        `
        *,
        property_type:property_types(*),
        images:property_images(*)
        `,
        { count: 'exact' },
      );

    // Check if the request is from an admin (to show all statuses)
    const session = await auth();
    if (!session) {
      // Public users only see active properties
      query = query.eq('status', 'active');
    } else if (status) {
      query = query.eq('status', status);
    }

    // Apply filters
    if (type) {
      query = query.eq('property_type_id', type);
    }

    if (transaction) {
      query = query.eq('transaction_type', transaction);
    }

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (province) {
      query = query.ilike('province', `%${province}%`);
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    if (bedrooms) {
      query = query.gte('bedrooms', parseInt(bedrooms, 10));
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    if (search) {
      query = query.or(
        `title_en.ilike.%${search}%,title_th.ilike.%${search}%,title_zh.ilike.%${search}%,address.ilike.%${search}%,district.ilike.%${search}%`,
      );
    }

    // Apply sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Properties query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 },
      );
    }

    const total = count ?? 0;
    const response: PaginatedResponse<PropertyWithDetails> = {
      data: (data as unknown as PropertyWithDetails[]) ?? [],
      total,
      page,
      per_page: perPage,
      total_pages: Math.ceil(total / perPage),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Properties GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/properties - Create a new property (admin only)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate with Zod
    const validation = propertySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const data = validation.data;
    const supabase = createServerClient();

    // If property belongs to a project, inherit title & description from the project
    if (data.project_id) {
      const { data: project } = await supabase
        .from('projects')
        .select('name_en, name_th, name_zh, description_en, description_th, description_zh')
        .eq('id', data.project_id)
        .single();
      if (project) {
        data.title_en = data.title_en || project.name_en;
        data.title_th = data.title_th || project.name_th;
        data.title_zh = data.title_zh || project.name_zh;
        data.description_en = data.description_en || project.description_en;
        data.description_th = data.description_th || project.description_th;
        data.description_zh = data.description_zh || project.description_zh;
      }
    }

    // Generate slugs from titles
    const slug_en = generateSlug(data.title_en || 'property');
    const slug_th = generateSlug(data.title_th || 'property');
    const slug_zh = generateSlug(data.title_zh || 'property');

    const { data: property, error } = await supabase
      .from('properties')
      .insert({
        ...data,
        slug_en,
        slug_th,
        slug_zh,
      })
      .select(
        `
        *,
        property_type:property_types(*),
        images:property_images(*)
        `,
      )
      .single();

    if (error) {
      console.error('Property insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create property' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, data: property },
      { status: 201 },
    );
  } catch (error) {
    console.error('Properties POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
