// =============================================================================
// THE A 5995 - Property Card Component
// =============================================================================

import { Link } from '@/i18n/routing';
import { MapPin, BedDouble, Bath, Maximize, Star } from 'lucide-react';
import { cn, getLocalizedField, formatPrice } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import type { Property, PropertyImage } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PropertyCardProps {
  property: Property & { images: PropertyImage[] };
  locale: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusBadgeVariant(
  status: string,
): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  switch (status) {
    case 'active':
      return 'success';
    case 'sold':
      return 'danger';
    case 'rented':
      return 'warning';
    default:
      return 'default';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'sold':
      return 'Sold';
    case 'rented':
      return 'Rented';
    case 'draft':
      return 'Draft';
    default:
      return status;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PropertyCard({
  property,
  locale,
  className,
}: PropertyCardProps) {
  const title = getLocalizedField(property, 'title', locale);
  const slug = getLocalizedField(property, 'slug', locale);
  const price = formatPrice(property.price, locale);

  // Get primary image or first available
  const primaryImage =
    property.images.find((img) => img.is_primary) || property.images[0];
  const imageUrl = primaryImage?.url || '/images/placeholder-property.jpg';
  const imageAlt = primaryImage
    ? getLocalizedField(primaryImage, 'alt', locale) || title
    : title;

  const isSale = property.transaction_type === 'sale';

  return (
    <Link
      href={`/properties/${slug}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-luxury-200 bg-white',
        'transition-all duration-300',
        'hover:shadow-lg hover:shadow-luxury-200/50 hover:-translate-y-1',
        className,
      )}
    >
      {/* Featured ribbon */}
      {property.featured && (
        <div className="absolute left-0 top-4 z-10 flex items-center gap-1 rounded-r-full bg-secondary-400 px-3 py-1 text-xs font-bold text-primary-700 shadow-md">
          <Star className="h-3 w-3 fill-current" />
          Featured
        </div>
      )}

      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient overlay with price */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-transparent" />

        {/* Price tag */}
        <div className="absolute bottom-3 left-3">
          <span className="font-heading text-xl font-bold text-white drop-shadow-lg">
            {price}
          </span>
          {!isSale && (
            <span className="ml-1 text-sm text-luxury-200">/month</span>
          )}
        </div>

        {/* Badges - top right */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <Badge
            variant={isSale ? 'info' : 'success'}
            className="text-xs shadow-sm"
          >
            {isSale ? 'For Sale' : 'For Rent'}
          </Badge>
          {property.status !== 'active' && (
            <Badge
              variant={getStatusBadgeVariant(property.status)}
              className="text-xs shadow-sm"
            >
              {getStatusLabel(property.status)}
            </Badge>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <h3 className="mb-1.5 line-clamp-2 font-heading text-lg font-semibold text-primary-700 group-hover:text-secondary-500 transition-colors">
          {title}
        </h3>

        {/* Location */}
        <div className="mb-3 flex items-center gap-1 text-sm text-luxury-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-secondary-400" />
          <span className="truncate">
            {property.district}, {property.province}
          </span>
        </div>

        {/* Amenities row */}
        <div className="mt-auto flex items-center gap-4 border-t border-luxury-100 pt-3">
          {property.bedrooms !== null && property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-luxury-600">
              <BedDouble className="h-4 w-4 text-luxury-400" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms !== null && property.bathrooms > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-luxury-600">
              <Bath className="h-4 w-4 text-luxury-400" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {(property.building_size || property.land_size) && (
            <div className="flex items-center gap-1.5 text-sm text-luxury-600">
              <Maximize className="h-4 w-4 text-luxury-400" />
              <span>
                {property.building_size || property.land_size} sqm
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
