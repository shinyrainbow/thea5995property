// =============================================================================
// THE A 5995 - Single Blog Post API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { blogPostSchema } from '@/lib/validations';
import { generateSlug } from '@/lib/utils';

// ---------------------------------------------------------------------------
// GET /api/blog/[id] - Get a single blog post with content blocks
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { data: post, error } = await supabase
      .from('blog_posts')
      .select(
        `
        *,
        author:admin_users(id, name),
        content_blocks:blog_content(*)
        `,
      )
      .eq('id', id)
      .single();

    if (error || !post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 },
      );
    }

    // Sort content blocks by sort_order
    if (post.content_blocks) {
      (post.content_blocks as Array<{ sort_order: number }>).sort(
        (a, b) => a.sort_order - b.sort_order,
      );
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Blog post GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/blog/[id] - Update a blog post (admin only)
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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
      .update({
        ...data,
        slug_en,
        slug_th,
        slug_zh,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, author:admin_users(id, name)')
      .single();

    if (error) {
      console.error('Blog post update error:', error);
      return NextResponse.json(
        { error: 'Failed to update blog post' },
        { status: 500 },
      );
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Blog post PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/blog/[id] - Delete a blog post (admin only)
// ---------------------------------------------------------------------------

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createServerClient();

    // Delete content blocks first
    await supabase
      .from('blog_content')
      .delete()
      .eq('blog_post_id', id);

    // Delete the blog post
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Blog post delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete blog post' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: 'Blog post deleted' });
  } catch (error) {
    console.error('Blog post DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
