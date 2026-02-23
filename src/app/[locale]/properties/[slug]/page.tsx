// =============================================================================
// THE A 5995 - Property Detail Page
// =============================================================================

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { supabase } from '@/lib/supabase';
import { getLocalizedField, formatPrice } from '@/lib/utils';
import PropertyGallery from '@/components/public/PropertyGallery';
import InquiryForm from '@/components/public/InquiryForm';
import PropertyGrid from '@/components/public/PropertyGrid';
import type { PropertyWithDetails, Locale } from '@/types';
import {
  BedDouble,
  Bath,
  Maximize,
  MapPin,
  Tag,
  ArrowLeft,
  Share2,
  Map,
  Home,
  Ruler,
  FolderKanban,
  ChevronRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Fetch property helper
// ---------------------------------------------------------------------------

async function getPropertyBySlug(
  slug: string,
  locale: string,
): Promise<PropertyWithDetails | null> {
  try {
    // Try matching slug against the locale-specific slug column
    const slugColumn = `slug_${locale}`;
    const { data, error } = await supabase
      .from('properties')
      .select('*, property_type:property_types(*), images:property_images(*), project:projects(*)')
      .eq(slugColumn, slug)
      .eq('status', 'active')
      .single();

    if (data) return data as PropertyWithDetails;

    // Fallback: try all slug columns
    for (const loc of ['en', 'th', 'zh']) {
      if (loc === locale) continue;
      const { data: fallbackData } = await supabase
        .from('properties')
        .select('*, property_type:property_types(*), images:property_images(*), project:projects(*)')
        .eq(`slug_${loc}`, slug)
        .eq('status', 'active')
        .single();

      if (fallbackData) return fallbackData as PropertyWithDetails;
    }

    return null;
  } catch {
    return null;
  }
}

async function getSimilarProperties(
  propertyId: string,
  propertyTypeId: string,
  limit: number = 3,
): Promise<PropertyWithDetails[]> {
  try {
    const { data } = await supabase
      .from('properties')
      .select('*, property_type:property_types(*), images:property_images(*), project:projects(*)')
      .eq('property_type_id', propertyTypeId)
      .eq('status', 'active')
      .neq('id', propertyId)
      .limit(limit);

    return (data as PropertyWithDetails[]) || [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const property = await getPropertyBySlug(slug, locale);

  if (!property) {
    return { title: 'Property Not Found | THE A 5995' };
  }

  const title = getLocalizedField(property, 'seo_title', locale) ||
    getLocalizedField(property, 'title', locale);
  const description = getLocalizedField(property, 'seo_description', locale) ||
    getLocalizedField(property, 'description', locale).slice(0, 160);

  const primaryImage = property.images?.find((img) => img.is_primary) || property.images?.[0];

  return {
    title: `${title} | THE A 5995`,
    description,
    openGraph: {
      title,
      description,
      images: primaryImage ? [{ url: primaryImage.url }] : [],
      type: 'website',
    },
  };
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'property' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const property = await getPropertyBySlug(slug, locale);

  if (!property) {
    notFound();
  }

  const title = getLocalizedField(property, 'title', locale);
  const description = getLocalizedField(property, 'description', locale);
  const price = formatPrice(property.price, locale);
  const isSale = property.transaction_type === 'sale';
  const typeName = property.property_type
    ? getLocalizedField(property.property_type, 'name', locale)
    : '';

  // Prepare gallery images
  const galleryImages = (property.images || [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      url: img.url,
      alt: getLocalizedField(img, 'alt', locale) || title,
    }));

  // Fetch similar properties
  const similarProperties = await getSimilarProperties(
    property.id,
    property.property_type_id,
  );

  // JSON-LD structured data
  const primaryImage = property.images?.find((img) => img.is_primary) || property.images?.[0];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: title,
    description: description.slice(0, 300),
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thea5995.com'}/${locale}/properties/${slug}`,
    image: primaryImage?.url,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'THB',
      availability: property.status === 'active'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/SoldOut',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.district,
      addressRegion: property.province,
      addressCountry: 'TH',
    },
    ...(property.latitude && property.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: property.latitude,
            longitude: property.longitude,
          },
        }
      : {}),
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: property.building_size
      ? {
          '@type': 'QuantitativeValue',
          value: property.building_size,
          unitCode: 'MTK',
        }
      : undefined,
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-luxury-50">
        {/* Back navigation */}
        <div className="bg-white border-b border-luxury-200 pt-20">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 text-luxury-500 transition-colors hover:text-primary-700"
              >
                <ArrowLeft className="h-4 w-4" />
                {tCommon('back')}
              </Link>
              {property.project && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-luxury-400" />
                  <Link
                    href={`/projects/${getLocalizedField(property.project, 'slug', locale)}`}
                    className="inline-flex items-center gap-1.5 text-secondary-500 transition-colors hover:text-secondary-600"
                  >
                    <FolderKanban className="h-3.5 w-3.5" />
                    {getLocalizedField(property.project, 'name', locale)}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left column - Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <PropertyGallery images={galleryImages} propertyTitle={title} />

              {/* Property Info */}
              <div className="rounded-xl bg-white border border-luxury-200 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          isSale
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {isSale ? t('forSale') : t('forRent')}
                      </span>
                      {typeName && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-luxury-100 px-3 py-1 text-xs font-medium text-luxury-700">
                          <Tag className="h-3 w-3" />
                          {typeName}
                        </span>
                      )}
                      {property.featured && (
                        <span className="inline-flex items-center rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold text-secondary-700">
                          {t('featured')}
                        </span>
                      )}
                    </div>
                    <h1 className="font-heading text-2xl font-bold text-primary-700 md:text-3xl">
                      {title}
                    </h1>
                    <div className="mt-2 flex items-center gap-1.5 text-luxury-500">
                      <MapPin className="h-4 w-4 text-secondary-400" />
                      <span>{property.address}, {property.district}, {property.province}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-heading text-3xl font-bold text-secondary-500">
                      {price}
                    </p>
                    {!isSale && (
                      <p className="text-sm text-luxury-500">{t('perMonth')}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="rounded-xl bg-white border border-luxury-200 p-6 shadow-sm">
                <h2 className="mb-4 font-heading text-xl font-semibold text-primary-700">
                  {t('propertyDetails')}
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {property.bedrooms !== null && (
                    <div className="flex flex-col items-center gap-2 rounded-lg bg-luxury-50 p-4">
                      <BedDouble className="h-6 w-6 text-secondary-400" />
                      <span className="text-2xl font-bold text-primary-700">
                        {property.bedrooms}
                      </span>
                      <span className="text-xs text-luxury-500">{t('bedrooms')}</span>
                    </div>
                  )}
                  {property.bathrooms !== null && (
                    <div className="flex flex-col items-center gap-2 rounded-lg bg-luxury-50 p-4">
                      <Bath className="h-6 w-6 text-secondary-400" />
                      <span className="text-2xl font-bold text-primary-700">
                        {property.bathrooms}
                      </span>
                      <span className="text-xs text-luxury-500">{t('bathrooms')}</span>
                    </div>
                  )}
                  {property.land_size !== null && (
                    <div className="flex flex-col items-center gap-2 rounded-lg bg-luxury-50 p-4">
                      <Ruler className="h-6 w-6 text-secondary-400" />
                      <span className="text-2xl font-bold text-primary-700">
                        {property.land_size}
                      </span>
                      <span className="text-xs text-luxury-500">
                        {t('landSize')} ({t('sqm')})
                      </span>
                    </div>
                  )}
                  {property.building_size !== null && (
                    <div className="flex flex-col items-center gap-2 rounded-lg bg-luxury-50 p-4">
                      <Maximize className="h-6 w-6 text-secondary-400" />
                      <span className="text-2xl font-bold text-primary-700">
                        {property.building_size}
                      </span>
                      <span className="text-xs text-luxury-500">
                        {t('buildingSize')} ({t('sqm')})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="rounded-xl bg-white border border-luxury-200 p-6 shadow-sm">
                <h2 className="mb-4 font-heading text-xl font-semibold text-primary-700">
                  {t('description')}
                </h2>
                <div className="prose prose-lg max-w-none text-luxury-600 leading-relaxed whitespace-pre-line">
                  {description}
                </div>
              </div>

              {/* Location */}
              <div className="rounded-xl bg-white border border-luxury-200 p-6 shadow-sm">
                <h2 className="mb-4 font-heading text-xl font-semibold text-primary-700">
                  {t('location')}
                </h2>
                <div className="mb-4 flex items-start gap-2 text-luxury-600">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-secondary-400" />
                  <span>{property.address}, {property.district}, {property.province}</span>
                </div>
                {/* Map placeholder */}
                <div className="flex h-64 items-center justify-center rounded-lg bg-luxury-100 border-2 border-dashed border-luxury-300">
                  <div className="text-center text-luxury-400">
                    <Map className="mx-auto mb-2 h-10 w-10" />
                    <p className="text-sm font-medium">Map Integration</p>
                    <p className="text-xs">
                      {property.latitude && property.longitude
                        ? `${property.latitude}, ${property.longitude}`
                        : 'Location coordinates not available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Sidebar */}
            <div className="space-y-6">
              {/* Inquiry Form */}
              <div className="sticky top-24">
                <InquiryForm propertyId={property.id} />
              </div>
            </div>
          </div>

          {/* Similar Properties */}
          {similarProperties.length > 0 && (
            <section className="mt-16">
              <h2 className="mb-8 font-heading text-2xl font-bold text-primary-700">
                {t('similarProperties')}
              </h2>
              <PropertyGrid properties={similarProperties} />
            </section>
          )}
        </div>
      </div>
    </>
  );
}
