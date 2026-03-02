'use client';

// =============================================================================
// THE A 5995 - Property Gallery Component
// =============================================================================

import { useState, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GalleryImage {
  url: string;
  alt: string;
}

interface PropertyGalleryProps {
  images: GalleryImage[];
  propertyTitle: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PropertyGallery({
  images,
  propertyTitle,
}: PropertyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Use placeholder if no images
  const galleryImages: GalleryImage[] =
    images.length > 0
      ? images
      : [{ url: '/images/placeholder-property.jpg', alt: propertyTitle }];

  const lightboxImage = galleryImages[selectedIndex] || galleryImages[0];

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : galleryImages.length - 1,
        );
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) =>
          prev < galleryImages.length - 1 ? prev + 1 : 0,
        );
      }
    },
    [lightboxOpen, galleryImages.length],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [lightboxOpen]);

  function goToPrevious() {
    setSelectedIndex((prev) =>
      prev > 0 ? prev - 1 : galleryImages.length - 1,
    );
  }

  function goToNext() {
    setSelectedIndex((prev) =>
      prev < galleryImages.length - 1 ? prev + 1 : 0,
    );
  }

  const mainImage = galleryImages[0];
  const sideImages = galleryImages.slice(1, 5);
  const totalCount = galleryImages.length;

  return (
    <>
      {/* Gallery Grid - Proplify style */}
      <div className="relative overflow-hidden rounded-xl">
        {totalCount === 1 ? (
          /* Single image */
          <div
            className="relative h-64 cursor-pointer md:h-105"
            onClick={() => { setSelectedIndex(0); setLightboxOpen(true); }}
          >
            <img
              src={mainImage.url}
              alt={mainImage.alt}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          /* Multi-image grid: big left + 2x2 right */
          <div className="grid h-64 grid-cols-1 gap-1 md:h-105 md:grid-cols-2">
            {/* Left - Main image */}
            <div
              className="relative cursor-pointer overflow-hidden"
              onClick={() => { setSelectedIndex(0); setLightboxOpen(true); }}
            >
              <img
                src={mainImage.url}
                alt={mainImage.alt}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Right - 2x2 grid */}
            <div
              className={cn(
                'hidden gap-1 md:grid',
                sideImages.length <= 2 ? 'grid-rows-2' : 'grid-cols-2 grid-rows-2',
              )}
            >
              {sideImages.map((image, index) => (
                <div
                  key={index}
                  className="relative cursor-pointer overflow-hidden"
                  onClick={() => { setSelectedIndex(index + 1); setLightboxOpen(true); }}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* See all photos button */}
        {totalCount > 1 && (
          <button
            type="button"
            onClick={() => { setSelectedIndex(0); setLightboxOpen(true); }}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-md transition-colors hover:bg-gray-100"
          >
            <Camera className="h-4 w-4" />
            <span>ดูรูปทั้งหมด ({totalCount})</span>
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close gallery"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Previous button */}
          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Main lightbox image */}
          <div
            className="max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.url}
              alt={lightboxImage.alt}
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
            />
          </div>

          {/* Next button */}
          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Image counter */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/50 px-4 py-2 text-sm font-medium text-white">
              {selectedIndex + 1} / {galleryImages.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
