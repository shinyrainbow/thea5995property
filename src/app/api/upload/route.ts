// =============================================================================
// THE A 5995 - Upload API Route (Presigned S3 URLs)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPresignedUploadUrl, getPublicUrl } from '@/lib/s3';


// ---------------------------------------------------------------------------
// POST /api/upload - Generate a presigned S3 upload URL (admin only)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { filename, contentType, folder = 'properties' } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'filename and contentType are required' },
        { status: 400 },
      );
    }

    // Validate content type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif',
    ];

    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 },
      );
    }

    // Generate a unique key for the file
    const extension = filename.split('.').pop() || 'jpg';
    const uniqueId = crypto.randomUUID();
    const key = `${folder}/${uniqueId}.${extension}`;

    // Get presigned URL
    const presignedUrl = await getPresignedUploadUrl(key, contentType);
    const publicUrl = getPublicUrl(key);

    return NextResponse.json({
      success: true,
      data: {
        presignedUrl,
        publicUrl,
        key,
      },
    });
  } catch (error) {
    console.error('Upload POST error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 },
    );
  }
}
