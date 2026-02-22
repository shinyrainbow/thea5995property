// =============================================================================
// THE A 5995 - Property Grid Component
// =============================================================================

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import PropertyCard from './PropertyCard';
import type { Property, PropertyImage } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PropertyGridProps {
  properties: (Property & { images: PropertyImage[] })[];
  loading?: boolean;
  className?: string;
  /** Number of skeleton cards to show while loading */
  skeletonCount?: number;
}

// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------

function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-luxury-200 bg-white animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-[4/3] bg-luxury-100" />

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <div className="mb-2 h-5 w-3/4 rounded bg-luxury-100" />
        <div className="mb-3 h-4 w-1/2 rounded bg-luxury-100" />

        {/* Location */}
        <div className="mb-3 h-3.5 w-2/3 rounded bg-luxury-100" />

        {/* Amenities */}
        <div className="mt-auto border-t border-luxury-100 pt-3">
          <div className="flex gap-4">
            <div className="h-4 w-10 rounded bg-luxury-100" />
            <div className="h-4 w-10 rounded bg-luxury-100" />
            <div className="h-4 w-16 rounded bg-luxury-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PropertyGrid({
  properties,
  loading = false,
  className,
  skeletonCount = 6,
}: PropertyGridProps) {
  const locale = useLocale();
  const t = useTranslations('common');

  // Loading state
  if (loading) {
    return (
      <div
        className={cn(
          'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3',
          className,
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!properties || properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-luxury-100">
          <Building2 className="h-8 w-8 text-luxury-400" />
        </div>
        <h3 className="mb-2 font-heading text-xl font-semibold text-primary-700">
          {t('noResults')}
        </h3>
        <p className="max-w-sm text-luxury-500">
          Try adjusting your filters or search criteria to find properties.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          locale={locale}
        />
      ))}
    </div>
  );
}
