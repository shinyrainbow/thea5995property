// =============================================================================
// THE A 5995 - Homepage
// =============================================================================

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { createServerClient } from '@/lib/supabase';
import { getLocalizedField, PROPERTY_TYPE_SLUGS } from '@/lib/utils';
import type { PropertyWithDetails, PropertyType } from '@/types';
import Image from 'next/image';
import Hero from '@/components/public/Hero';
import PropertyGrid from '@/components/public/PropertyGrid';
import StatsSection from '@/components/public/StatsSection';
import { ArrowRight } from 'lucide-react';

// Default images for each property type (slug_en -> image path)
const propertyTypeImages: Record<string, string> = {
  condo: '/images/property-types/condo.jpg',
  townhouse: '/images/property-types/townhouse.jpg',
  house: '/images/property-types/house.jpg',
  land: '/images/property-types/land.jpg',
  villa: '/images/property-types/villa.jpg',
  apartment: '/images/property-types/apartment.jpg',
  office: '/images/property-types/office.jpg',
  store: '/images/property-types/store.jpg',
  factory: '/images/property-types/factory.jpg',
  hotel: '/images/property-types/hotel.jpg',
  building: '/images/property-types/building.jpg',
};

// Bento grid layout: first item is large, rest are uniform 1x1
const bentoLayout = [
  'sm:col-span-2 sm:row-span-2',  // 0: featured large
];

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'th' }, { locale: 'zh' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });
  return {
    title: `THE A 5995 | ${t('headline')}`,
    description: t('subtitle'),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'home' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const supabase = createServerClient();

  // Fetch featured properties
  let properties: PropertyWithDetails[] = [];
  try {
    const { data } = await supabase
      .from('properties')
      .select('*, property_type:property_types(*), images:property_images(*)')
      .eq('featured', true)
      .eq('status', 'active')
      .limit(6);
    properties = (data as PropertyWithDetails[]) || [];
  } catch {
    properties = [];
  }

  // Fetch property types
  let propertyTypes: PropertyType[] = [];
  try {
    const { data } = await supabase.from('property_types').select('*');
    propertyTypes = (data as PropertyType[]) || [];
  } catch {
    propertyTypes = [];
  }

  if (propertyTypes.length === 0) {
    propertyTypes = Object.entries(PROPERTY_TYPE_SLUGS).map(([key, val]) => ({
      id: key,
      slug_en: val.slug_en,
      slug_th: val.slug_th,
      slug_zh: val.slug_zh,
      name_en: val.name_en,
      name_th: val.name_th,
      name_zh: val.name_zh,
      icon: val.icon,
      has_projects: ['condo', 'townhouse', 'apartment'].includes(key),
    }));
  }

  return (
    <>
      <Hero />

      {/* Property Types - Bento Grid */}
      <section className="py-24 md:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-luxury text-secondary-500">
              Collection
            </p>
            <h2 className="font-heading text-3xl font-bold text-primary-900 md:text-4xl lg:text-5xl">
              {t('propertyTypes')}
            </h2>
            <div className="mx-auto mt-6 h-px w-12 bg-secondary-500" />
            <p className="mx-auto mt-6 max-w-2xl text-lg text-luxury-500 leading-relaxed">
              {t('propertyTypesSubtitle')}
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[180px] gap-4 grid-flow-dense">
            {propertyTypes.map((type, index) => {
              const name = getLocalizedField(type, 'name', locale);
              const slug = getLocalizedField(type, 'slug', locale);
              const imageSrc = propertyTypeImages[type.slug_en] || '/images/property-types/house.jpg';
              const layoutClass = bentoLayout[index] || 'sm:col-span-1 sm:row-span-1';

              return (
                <Link
                  key={type.id}
                  href={`/properties?property_type=${type.id}`}
                  className={`group relative overflow-hidden rounded-2xl ${layoutClass}`}
                >
                  {/* Background Image */}
                  <Image
                    src={imageSrc}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-500 group-hover:from-black/80" />

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <h3 className="font-heading text-lg font-bold text-white sm:text-xl lg:text-2xl drop-shadow-lg">
                      {name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-white/70 opacity-0 translate-y-3 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                      {tCommon('viewAll')}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 md:py-32 bg-luxury-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-luxury text-secondary-500">
              Featured
            </p>
            <h2 className="font-heading text-3xl font-bold text-primary-900 md:text-4xl lg:text-5xl">
              {t('featuredProperties')}
            </h2>
            <div className="mx-auto mt-6 h-px w-12 bg-secondary-500" />
            <p className="mx-auto mt-6 max-w-2xl text-lg text-luxury-500 leading-relaxed">
              {t('featuredSubtitle')}
            </p>
          </div>

          <PropertyGrid properties={properties} />

          {properties.length > 0 && (
            <div className="mt-16 text-center">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 border border-primary-900 px-8 py-3.5 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-900 hover:text-white"
              >
                {t('viewAllProperties')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <StatsSection />

      {/* CTA */}
      <section className="py-24 md:py-32 bg-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-4 text-xs font-medium uppercase tracking-luxury text-secondary-500">
            Get Started
          </p>
          <h2 className="font-heading text-3xl font-bold text-primary-900 md:text-4xl lg:text-5xl">
            {t('ctaTitle')}
          </h2>
          <div className="mx-auto mt-6 h-px w-12 bg-secondary-500" />
          <p className="mx-auto mt-6 max-w-2xl text-lg text-luxury-500 leading-relaxed">
            {t('ctaSubtitle')}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 bg-primary-900 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
            >
              {tCommon('properties')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-primary-900 px-8 py-3.5 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-900 hover:text-white"
            >
              {t('ctaButton')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
