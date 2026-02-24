// =============================================================================
// THE A 5995 - Property Images API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { deleteS3Object, getKeyFromUrl } from '@/lib/s3';

// ---------------------------------------------------------------------------
// PUT /api/properties/[id]/images - Sync images for a property (admin only)
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
    const { images } = await request.json();

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { error: 'images must be an array' },
        { status: 400 },
      );
    }

    const supabase = createServerClient();

    // Get existing images for this property
    const { data: existingImages } = await supabase
      .from('property_images')
      .select('id, url')
      .eq('property_id', id);

    const existingIds = new Set((existingImages || []).map((img) => img.id));
    const incomingIds = new Set(
      images.filter((img: { id?: string }) => img.id).map((img: { id: string }) => img.id),
    );

    // Delete images that were removed
    const toDelete = (existingImages || []).filter((img) => !incomingIds.has(img.id));
    for (const img of toDelete) {
      try {
        const key = getKeyFromUrl(img.url);
        await deleteS3Object(key);
      } catch {
        // Continue even if S3 delete fails
      }
      await supabase.from('property_images').delete().eq('id', img.id);
    }

    // Upsert images: insert new ones, update existing ones
    for (const image of images) {
      if (image.id && existingIds.has(image.id)) {
        // Update existing image
        await supabase
          .from('property_images')
          .update({
            url: image.url,
            alt_en: image.alt_en || null,
            alt_th: image.alt_th || null,
            alt_zh: image.alt_zh || null,
            sort_order: image.sort_order,
            is_primary: image.is_primary,
          })
          .eq('id', image.id);
      } else {
        // Insert new image
        await supabase.from('property_images').insert({
          property_id: id,
          url: image.url,
          alt_en: image.alt_en || null,
          alt_th: image.alt_th || null,
          alt_zh: image.alt_zh || null,
          sort_order: image.sort_order,
          is_primary: image.is_primary,
        });
      }
    }

    // Return updated images
    const { data: updatedImages } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', id)
      .order('sort_order');

    return NextResponse.json({ success: true, data: updatedImages });
  } catch (error) {
    console.error('Property images PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to sync images' },
      { status: 500 },
    );
  }
}
