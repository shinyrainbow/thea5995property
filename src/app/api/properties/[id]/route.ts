// =============================================================================
// THE A 5995 - Single Property API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { propertySchema } from '@/lib/validations';
import { generateSlug } from '@/lib/utils';

// ---------------------------------------------------------------------------
// GET /api/properties/[id] - Get a single property by ID
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { data: property, error } = await supabase
      .from('properties')
      .select(
        `
        *,
        property_type:property_types(*),
        images:property_images(*)
        `,
      )
      .eq('id', id)
      .single();

    if (error || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error('Property GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/properties/[id] - Update a property (admin only)
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
    const validation = propertySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const data = validation.data;
    const supabase = createServerClient();

    // If property belongs to a project, inherit title, description & location from the project
    if (data.project_id) {
      const { data: project } = await supabase
        .from('projects')
        .select('name_en, name_th, name_zh, description_en, description_th, description_zh, address, district, province, latitude, longitude')
        .eq('id', data.project_id)
        .single();
      if (project) {
        data.title_en = data.title_en || project.name_en;
        data.title_th = data.title_th || project.name_th;
        data.title_zh = data.title_zh || project.name_zh;
        data.description_en = data.description_en || project.description_en;
        data.description_th = data.description_th || project.description_th;
        data.description_zh = data.description_zh || project.description_zh;
        data.address = data.address || project.address;
        data.district = data.district || project.district;
        data.province = data.province || project.province;
        data.latitude = data.latitude ?? project.latitude;
        data.longitude = data.longitude ?? project.longitude;
      }
    }

    // Re-generate slugs if titles changed
    const slug_en = generateSlug(data.title_en || 'property');
    const slug_th = generateSlug(data.title_th || 'property');
    const slug_zh = generateSlug(data.title_zh || 'property');

    const { data: property, error } = await supabase
      .from('properties')
      .update({
        ...data,
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
        images:property_images(*)
        `,
      )
      .single();

    if (error) {
      console.error('Property update error:', error);
      return NextResponse.json(
        { error: 'Failed to update property' },
        { status: 500 },
      );
    }

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error('Property PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/properties/[id] - Delete a property (admin only)
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
      .from('property_images')
      .select('id, url')
      .eq('property_id', id);

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
      await supabase.from('property_images').delete().eq('property_id', id);
    }

    // Delete the property
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Property delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete property' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: 'Property deleted' });
  } catch (error) {
    console.error('Property DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
