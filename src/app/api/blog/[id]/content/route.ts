// =============================================================================
// THE A 5995 - Blog Content Blocks API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { blogContentSchema } from '@/lib/validations';

// ---------------------------------------------------------------------------
// GET /api/blog/[id]/content - Get content blocks for a blog post
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('blog_contents')
      .select('*')
      .eq('blog_post_id', id)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Blog content query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch content blocks' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (error) {
    console.error('Blog content GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/blog/[id]/content - Add a content block (admin only)
// ---------------------------------------------------------------------------

export async function POST(
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

    // Override blog_post_id with the URL param
    const blockData = { ...body, blog_post_id: id };

    const validation = blogContentSchema.safeParse(blockData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = createServerClient();

    const { data: block, error } = await supabase
      .from('blog_contents')
      .insert(validation.data)
      .select()
      .single();

    if (error) {
      console.error('Blog content insert error:', error);
      return NextResponse.json(
        { error: 'Failed to add content block' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, data: block },
      { status: 201 },
    );
  } catch (error) {
    console.error('Blog content POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/blog/[id]/content - Update content blocks (admin only)
// Accepts an array of blocks to update/reorder
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

    if (!Array.isArray(body.blocks)) {
      return NextResponse.json(
        { error: 'blocks array is required' },
        { status: 400 },
      );
    }

    const supabase = createServerClient();

    // Delete existing blocks for this post
    await supabase
      .from('blog_contents')
      .delete()
      .eq('blog_post_id', id);

    // Insert all blocks with updated sort orders
    const blocksToInsert = body.blocks.map(
      (block: Record<string, unknown>, index: number) => ({
        blog_post_id: id,
        content_type: block.content_type,
        content_en: block.content_en || null,
        content_th: block.content_th || null,
        content_zh: block.content_zh || null,
        image_url: block.image_url || null,
        image_alt_en: block.image_alt_en || null,
        image_alt_th: block.image_alt_th || null,
        image_alt_zh: block.image_alt_zh || null,
        sort_order: index,
      }),
    );

    if (blocksToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('blog_contents')
        .insert(blocksToInsert);

      if (insertError) {
        console.error('Blog content bulk insert error:', insertError);
        return NextResponse.json(
          { error: 'Failed to update content blocks' },
          { status: 500 },
        );
      }
    }

    // Fetch updated blocks
    const { data: updatedBlocks, error: fetchError } = await supabase
      .from('blog_contents')
      .select('*')
      .eq('blog_post_id', id)
      .order('sort_order', { ascending: true });

    if (fetchError) {
      console.error('Blog content fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Blocks updated but failed to fetch results' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: updatedBlocks });
  } catch (error) {
    console.error('Blog content PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
