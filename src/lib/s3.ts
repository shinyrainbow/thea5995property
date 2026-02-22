// =============================================================================
// THE A 5995 - AWS S3 Client & Helpers
// =============================================================================

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  type PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// ---------------------------------------------------------------------------
// Environment variables
// ---------------------------------------------------------------------------

const region = process.env.AWS_REGION!;
const bucket = process.env.AWS_S3_BUCKET!;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;

// ---------------------------------------------------------------------------
// S3 Client singleton
// ---------------------------------------------------------------------------

export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a presigned URL that allows the client to upload a file directly
 * to S3 without exposing credentials.
 *
 * @param filename  - The desired object key / path within the bucket
 *                    (e.g. `properties/abc123/photo-1.jpg`).
 * @param contentType - The MIME type of the file (e.g. `image/jpeg`).
 * @param expiresIn   - Seconds until the URL expires (default: 5 minutes).
 * @returns A presigned PUT URL.
 */
export async function getPresignedUploadUrl(
  filename: string,
  contentType: string,
  expiresIn = 300,
): Promise<string> {
  const params: PutObjectCommandInput = {
    Bucket: bucket,
    Key: filename,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(params);
  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}

/**
 * Delete an object from S3 by its key.
 *
 * @param key - The object key to delete (e.g. `properties/abc123/photo-1.jpg`).
 */
export async function deleteS3Object(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  await s3Client.send(command);
}

/**
 * Build the public URL for an object stored in S3.
 *
 * Assumes the bucket is configured with a public access policy or
 * served through CloudFront. If using CloudFront, replace the base URL
 * with your distribution domain.
 *
 * @param key - The object key (e.g. `properties/abc123/photo-1.jpg`).
 * @returns The fully-qualified public URL.
 */
export function getPublicUrl(key: string): string {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Extract the S3 object key from a full public URL.
 * Useful when you need to delete an object given only its public URL.
 *
 * @param url - The full S3 URL.
 * @returns The object key portion of the URL.
 */
export function getKeyFromUrl(url: string): string {
  const baseUrl = `https://${bucket}.s3.${region}.amazonaws.com/`;
  if (url.startsWith(baseUrl)) {
    return url.slice(baseUrl.length);
  }
  // Fallback: try to extract path after the hostname
  try {
    const parsed = new URL(url);
    return parsed.pathname.slice(1); // remove leading '/'
  } catch {
    return url;
  }
}
