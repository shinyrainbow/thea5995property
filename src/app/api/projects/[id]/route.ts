// =============================================================================
// THE A 5995 - Single Project API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { projectSchema } from '@/lib/validations';
import { generateSlug } from '@/lib/utils';

// ---------------------------------------------------------------------------
// GET /api/projects/[id] - Get a single project by ID
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { data: project, error } = await supabase
      .from('projects')
      .select(
        `
        *,
        property_type:property_types(*),
        images:project_images(*)
        `,
      )
      .eq('id', id)
      .single();

    if (error || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Project GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/projects/[id] - Update a project (admin only)
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

    // Validate with Zod
    const validation = projectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const data = validation.data;

    // Re-generate slugs if names changed
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
      .update({
        ...data,
        property_type_id,
        slug_en,
        slug_th,
        slug_zh,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(
        `
        *,
        property_type:property_types(*),
        images:project_images(*)
        `,
      )
      .single();

    if (error) {
      console.error('Project update error:', error);
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 },
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Project PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/projects/[id] - Delete a project (admin only)
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

    // First, delete associated images from S3 and database
    const { data: images } = await supabase
      .from('project_images')
      .select('id, url')
      .eq('project_id', id);

    if (images && images.length > 0) {
      // Delete images from S3
      const { deleteS3Object, getKeyFromUrl } = await import('@/lib/s3');
      for (const image of images) {
        try {
          const key = getKeyFromUrl(image.url);
          await deleteS3Object(key);
        } catch (s3Error) {
          console.error('Failed to delete S3 object:', s3Error);
        }
      }

      // Delete image records
      await supabase.from('project_images').delete().eq('project_id', id);
    }

    // Nullify project_id on any properties referencing this project
    await supabase
      .from('properties')
      .update({ project_id: null })
      .eq('project_id', id);

    // Delete the project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Project delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    console.error('Project DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
