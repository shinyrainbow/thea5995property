// =============================================================================
// THE A 5995 - Property Card Component
// =============================================================================

import { Link } from '@/i18n/routing';
import { MapPin, BedDouble, Bath, Maximize, Star } from 'lucide-react';
import { cn, getLocalizedField, formatPrice, getLocalizedProvince } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import type { Property, PropertyImage, PropertyType } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PropertyCardProps {
  property: Property & { images: PropertyImage[]; property_type?: PropertyType };
  locale: string;
  className?: string;
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
  const typeName = property.property_type
    ? getLocalizedField(property.property_type, 'name', locale)
    : null;

  return (
    <Link
      href={`/properties/${slug}`}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl border border-luxury-200 bg-white',
        'transition-all duration-300',
        'hover:shadow-lg hover:shadow-luxury-200/50 hover:-translate-y-1',
        className,
      )}
    >
      {/* Featured ribbon */}
      {property.featured === true && (
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

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-transparent" />

        {/* Property type badge - top left (pushed down when featured ribbon is shown) */}
        {typeName ? (
          <div className={cn("absolute left-3", property.featured ? "top-12" : "top-3")}>
            <Badge variant="default" className="text-xs shadow-sm bg-white/90 text-primary-700 backdrop-blur-sm">
              {typeName.toUpperCase()}
            </Badge>
          </div>
        ) : null}

        {/* Price tag - top right */}
        <div className="absolute right-3 top-3">
          <span className="inline-block rounded-md bg-primary-900/80 px-2.5 py-1 font-heading text-sm font-bold text-white backdrop-blur-sm">
            {price}
            {!isSale ? (
              <span className="ml-0.5 text-xs font-normal text-luxury-200">/mo</span>
            ) : null}
          </span>
        </div>

        {/* Transaction badge - bottom left */}
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          <Badge
            variant={isSale ? 'info' : 'success'}
            className="text-xs shadow-sm"
          >
            {isSale ? 'For Sale' : 'For Rent'}
          </Badge>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title - fixed min-height for consistent sizing */}
        <h3 className="mb-1.5 min-h-13 line-clamp-2 font-heading text-lg font-semibold text-primary-700 group-hover:text-secondary-500 transition-colors">
          {title}
        </h3>

        {/* Location */}
        <div className="mb-3 flex items-center gap-1 text-sm text-luxury-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-secondary-400" />
          <span className="truncate">
            {[property.district, property.province ? getLocalizedProvince(property.province, locale) : ''].filter(Boolean).join(', ')}
          </span>
        </div>

        {/* Amenities row - fixed min-height */}
        <div className="mt-auto flex items-center gap-4 border-t border-luxury-100 pt-3 min-h-10">
          {Number(property.bedrooms) > 0 ? (
            <div className="flex items-center gap-1.5 text-sm text-luxury-600">
              <BedDouble className="h-4 w-4 text-luxury-400" />
              <span>{property.bedrooms} Bed</span>
            </div>
          ) : null}
          {Number(property.bathrooms) > 0 ? (
            <div className="flex items-center gap-1.5 text-sm text-luxury-600">
              <Bath className="h-4 w-4 text-luxury-400" />
              <span>{property.bathrooms} Bath</span>
            </div>
          ) : null}
          {Number(property.building_size || property.land_size) > 0 ? (
            <div className="flex items-center gap-1.5 text-sm text-luxury-600">
              <Maximize className="h-4 w-4 text-luxury-400" />
              <span>{property.building_size || property.land_size} sqm</span>
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
