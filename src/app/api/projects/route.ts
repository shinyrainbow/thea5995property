// =============================================================================
// THE A 5995 - Projects API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { projectSchema } from '@/lib/validations';
import { generateSlug } from '@/lib/utils';
import type { PaginatedResponse, ProjectWithDetails } from '@/types';

// ---------------------------------------------------------------------------
// GET /api/projects - List projects with filters
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = request.nextUrl;

    // Parse query parameters
    const type = searchParams.get('type');
    const province = searchParams.get('province');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = Math.min(parseInt(searchParams.get('perPage') || '12', 10), 100);

    // Build the query
    let query = supabase
      .from('projects')
      .select(
        `
        *,
        property_type:property_types(*),
        images:project_images(*)
        `,
        { count: 'exact' },
      );

    // Filter by status
    const session = await auth();
    if (status && status !== 'all') {
      query = query.eq('status', status);
    } else if (!status && !session) {
      // Public users only see active projects
      query = query.eq('status', 'active');
    }
    // status=all or admin with no status param → return all projects

    // Apply filters
    if (type) {
      query = query.eq('property_type_id', type);
    }

    if (province) {
      query = query.ilike('province', `%${province}%`);
    }

    if (search) {
      query = query.or(
        `name_en.ilike.%${search}%,name_th.ilike.%${search}%,name_zh.ilike.%${search}%,address.ilike.%${search}%,district.ilike.%${search}%`,
      );
    }

    // Apply sorting
    switch (sort) {
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
      console.error('Projects query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 },
      );
    }

    const total = count ?? 0;
    const response: PaginatedResponse<ProjectWithDetails> = {
      data: (data as unknown as ProjectWithDetails[]) ?? [],
      total,
      page,
      per_page: perPage,
      total_pages: Math.ceil(total / perPage),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Projects GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/projects - Create a new project (admin only)
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
    const validation = projectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const data = validation.data;

    // Generate slugs from names
    const slug_en = generateSlug(data.name_en);
    const slug_th = generateSlug(data.name_th);
    const slug_zh = generateSlug(data.name_zh);

    // Ensure property_type_id is an integer (DB column is SERIAL/INTEGER)
    const property_type_id = typeof data.property_type_id === 'string'
      ? parseInt(data.property_type_id, 10)
      : data.property_type_id;

    const supabase = createServerClient();

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        ...data,
        property_type_id,
        slug_en,
        slug_th,
        slug_zh,
      })
      .select(
        `
        *,
        property_type:property_types(*),
        images:project_images(*)
        `,
      )
      .single();

    if (error) {
      console.error('Project insert error:', error);
      return NextResponse.json(
        { error: `Failed to create project: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, data: project },
      { status: 201 },
    );
  } catch (error) {
    console.error('Projects POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
