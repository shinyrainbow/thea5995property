'use client';

// =============================================================================
// THE A 5995 - Image Uploader Component
// =============================================================================

import { useState, useCallback, useRef } from 'react';
import {
  Upload,
  X,
  GripVertical,
  Star,
  StarOff,
  Loader2,
  ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UploadedImage {
  id?: string;
  url: string;
  alt_en?: string;
  alt_th?: string;
  alt_zh?: string;
  sort_order: number;
  is_primary: boolean;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  folder?: string;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onChange,
  folder = 'properties',
  maxImages = 20,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      // 1. Request presigned URL
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { data } = await response.json();

      // 2. PUT file directly to S3
      const uploadResponse = await fetch(data.presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload to S3');
      }

      // 3. Return the public URL
      return data.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = maxImages - images.length;

      if (remaining <= 0) {
        setUploadError(`Maximum ${maxImages} images allowed.`);
        return;
      }

      const filesToUpload = fileArray.slice(0, remaining);
      setIsUploading(true);
      setUploadError(null);

      const newImages: UploadedImage[] = [];

      for (const file of filesToUpload) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setUploadError('Files must be under 10MB each.');
          continue;
        }

        const url = await uploadFile(file);
        if (url) {
          newImages.push({
            url,
            sort_order: images.length + newImages.length,
            is_primary: images.length === 0 && newImages.length === 0,
          });
        }
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }

      setIsUploading(false);
    },
    [images, onChange, maxImages, folder],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files?.length) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    // If the removed image was primary, make the first one primary
    if (images[index].is_primary && updated.length > 0) {
      updated[0].is_primary = true;
    }
    // Re-index sort_order
    updated.forEach((img, i) => {
      img.sort_order = i;
    });
    onChange(updated);
  };

  const setPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));
    onChange(updated);
  };

  // Drag-to-reorder handlers
  const handleReorderDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleReorderDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const updated = [...images];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    updated.forEach((img, i) => {
      img.sort_order = i;
    });
    onChange(updated);
    setDragIndex(index);
  };

  const handleReorderDragEnd = () => {
    setDragIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          dragOver
            ? 'border-secondary-400 bg-secondary-50'
            : 'border-luxury-300 hover:border-secondary-400 hover:bg-luxury-50',
          isUploading && 'pointer-events-none opacity-60',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              handleFiles(e.target.files);
              e.target.value = '';
            }
          }}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 text-secondary-400 animate-spin" />
            <p className="text-sm text-luxury-500">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-10 h-10 text-luxury-400" />
            <p className="text-sm font-medium text-primary-700">
              Drop images here or click to browse
            </p>
            <p className="text-xs text-luxury-400">
              JPEG, PNG, WebP up to 10MB. Maximum {maxImages} images.
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
          <button
            onClick={() => setUploadError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              draggable
              onDragStart={() => handleReorderDragStart(index)}
              onDragOver={(e) => handleReorderDragOver(e, index)}
              onDragEnd={handleReorderDragEnd}
              className={cn(
                'relative group rounded-lg overflow-hidden border-2 transition-all',
                image.is_primary
                  ? 'border-secondary-400 ring-2 ring-secondary-200'
                  : 'border-luxury-200',
                dragIndex === index && 'opacity-50',
              )}
            >
              {/* Image */}
              <div className="aspect-square bg-luxury-100 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt_en || `Image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.classList.add(
                      'flex',
                      'items-center',
                      'justify-center',
                    );
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />

                {/* Primary badge */}
                {image.is_primary && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-secondary-400 text-white text-xs font-medium rounded-full">
                    Primary
                  </div>
                )}

                {/* Drag handle */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                  <GripVertical className="w-5 h-5 text-white drop-shadow-lg" />
                </div>

                {/* Action buttons */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrimary(index);
                    }}
                    className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition-colors"
                    title={image.is_primary ? 'Primary image' : 'Set as primary'}
                  >
                    {image.is_primary ? (
                      <Star className="w-4 h-4 text-secondary-500 fill-secondary-500" />
                    ) : (
                      <StarOff className="w-4 h-4 text-luxury-500" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="p-1.5 bg-red-500/90 rounded-lg hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Sort order indicator */}
              <div className="p-2 text-xs text-center text-luxury-500 bg-luxury-50">
                {index + 1} of {images.length}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !isUploading && (
        <div className="text-center py-4 text-luxury-400 text-sm">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}
