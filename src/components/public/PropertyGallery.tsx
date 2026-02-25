'use client';

// =============================================================================
// THE A 5995 - Property Gallery Component
// =============================================================================

import { useState, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
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
  const remainingCount = galleryImages.length - 5;

  return (
    <>
      {/* Split Gallery: big left + grid right */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:h-90">
        {/* Left - Main big image */}
        <div
          className="relative h-70 md:h-full cursor-pointer overflow-hidden rounded-xl md:rounded-r-none bg-luxury-100"
          onClick={() => { setSelectedIndex(0); setLightboxOpen(true); }}
        >
          <img
            src={mainImage.url}
            alt={mainImage.alt}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSelectedIndex(0); setLightboxOpen(true); }}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-lg bg-black/50 text-white transition-colors hover:bg-black/70"
            aria-label="Open fullscreen gallery"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>

        {/* Right - Grid of remaining images */}
        {sideImages.length > 0 && (
          <div className="grid grid-cols-2 gap-2 h-45 md:h-full">
            {sideImages.map((image, index) => (
              <div
                key={index}
                className={cn(
                  'relative cursor-pointer overflow-hidden bg-luxury-100',
                  index === 0 && 'rounded-tl-none md:rounded-tl-none',
                  index === 1 && 'rounded-tr-xl md:rounded-tr-xl',
                  index === 2 && 'rounded-bl-none md:rounded-bl-none',
                  index === 3 && 'rounded-br-xl md:rounded-br-xl',
                )}
                onClick={() => { setSelectedIndex(index + 1); setLightboxOpen(true); }}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
                {/* Show "+N more" overlay on last image if there are more */}
                {index === sideImages.length - 1 && remainingCount > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-lg font-bold text-white">+{remainingCount} more</span>
                  </div>
                )}
              </div>
            ))}
          </div>
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
