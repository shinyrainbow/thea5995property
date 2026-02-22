// =============================================================================
// THE A 5995 - Blog Posts API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { blogPostSchema } from '@/lib/validations';
import { generateSlug } from '@/lib/utils';
import type { PaginatedResponse, BlogPost } from '@/types';

// ---------------------------------------------------------------------------
// GET /api/blog - List blog posts
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = request.nextUrl;

    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = Math.min(parseInt(searchParams.get('perPage') || '12', 10), 100);
    const search = searchParams.get('search');

    let query = supabase
      .from('blog_posts')
      .select('*, author:admin_users(id, name)', { count: 'exact' });

    // Check if admin - admin sees all, public sees published only
    const session = await auth();
    if (!session) {
      query = query.eq('status', 'published');
    } else {
      const status = searchParams.get('status');
      if (status) {
        query = query.eq('status', status);
      }
    }

    if (search) {
      query = query.or(
        `title_en.ilike.%${search}%,title_th.ilike.%${search}%,title_zh.ilike.%${search}%`,
      );
    }

    query = query.order('created_at', { ascending: false });

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Blog posts query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch blog posts' },
        { status: 500 },
      );
    }

    const total = count ?? 0;
    const response: PaginatedResponse<BlogPost> = {
      data: (data as unknown as BlogPost[]) ?? [],
      total,
      page,
      per_page: perPage,
      total_pages: Math.ceil(total / perPage),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Blog GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/blog - Create a new blog post (admin only)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const validation = blogPostSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const data = validation.data;

    const slug_en = generateSlug(data.title_en);
    const slug_th = generateSlug(data.title_th);
    const slug_zh = generateSlug(data.title_zh);

    const supabase = createServerClient();

    const { data: post, error } = await supabase
      .from('blog_posts')
      .insert({
        ...data,
        slug_en,
        slug_th,
        slug_zh,
        author_id: session.user.id,
      })
      .select('*, author:admin_users(id, name)')
      .single();

    if (error) {
      console.error('Blog post insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create blog post' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, data: post },
      { status: 201 },
    );
  } catch (error) {
    console.error('Blog POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
