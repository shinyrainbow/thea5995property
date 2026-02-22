// =============================================================================
// THE A 5995 - Homepage
// =============================================================================

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { supabase } from '@/lib/supabase';
import { getLocalizedField, PROPERTY_TYPE_SLUGS } from '@/lib/utils';
import type { PropertyWithDetails, PropertyType } from '@/types';
import Hero from '@/components/public/Hero';
import PropertyGrid from '@/components/public/PropertyGrid';
import StatsSection from '@/components/public/StatsSection';
import {
  ArrowRight,
  Home,
  Building2,
  Map,
  Castle,
  Hotel,
  Building,
  Briefcase,
  Store,
  Factory,
  BedDouble,
  Landmark,
  Sparkles,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Icon mapping for property types
// ---------------------------------------------------------------------------

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home className="h-7 w-7" />,
  Building2: <Building2 className="h-7 w-7" />,
  Map: <Map className="h-7 w-7" />,
  Castle: <Castle className="h-7 w-7" />,
  Hotel: <Hotel className="h-7 w-7" />,
  Building: <Building className="h-7 w-7" />,
  Briefcase: <Briefcase className="h-7 w-7" />,
  Store: <Store className="h-7 w-7" />,
  Factory: <Factory className="h-7 w-7" />,
  BedDouble: <BedDouble className="h-7 w-7" />,
  Landmark: <Landmark className="h-7 w-7" />,
};

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'th' }, { locale: 'zh' }];
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'home' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

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

  // If no property types from DB, use static ones
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
    }));
  }

  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Featured Properties Section */}
      <section className="py-16 md:py-24 bg-luxury-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary-400/30 bg-secondary-400/10 px-4 py-1.5">
              <Sparkles className="h-4 w-4 text-secondary-500" />
              <span className="text-sm font-medium text-secondary-600">Featured</span>
            </div>
            <h2 className="font-heading text-3xl font-bold text-primary-700 md:text-4xl">
              {t('featuredProperties')}
            </h2>
            <div className="mx-auto mt-4 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-secondary-400" />
              <div className="h-1.5 w-1.5 rounded-full bg-secondary-400" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-secondary-400" />
            </div>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-luxury-500">
              {t('featuredSubtitle')}
            </p>
          </div>

          <PropertyGrid properties={properties} />

          {properties.length > 0 && (
            <div className="mt-12 text-center">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-600 hover:shadow-lg"
              >
                {t('viewAllProperties')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Property Types Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold text-primary-700 md:text-4xl">
              {t('propertyTypes')}
            </h2>
            <div className="mx-auto mt-4 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-secondary-400" />
              <div className="h-1.5 w-1.5 rounded-full bg-secondary-400" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-secondary-400" />
            </div>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-luxury-500">
              {t('propertyTypesSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {propertyTypes.map((type) => {
              const name = getLocalizedField(type, 'name', locale);
              const slug = getLocalizedField(type, 'slug', locale);
              const icon = iconMap[type.icon] || <Building2 className="h-7 w-7" />;

              return (
                <Link
                  key={type.id}
                  href={`/${slug}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-luxury-200 bg-white p-6 text-center transition-all duration-300 hover:border-secondary-400/50 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-luxury-50 to-luxury-100 text-primary-700 transition-all duration-300 group-hover:from-secondary-400 group-hover:to-secondary-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-secondary-400/25">
                    {icon}
                  </div>
                  <span className="text-sm font-semibold text-primary-700 group-hover:text-secondary-500 transition-colors">
                    {name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-luxury-50">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-primary-700 md:text-4xl">
            {t('ctaTitle')}
          </h2>
          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-secondary-400" />
            <div className="h-1.5 w-1.5 rounded-full bg-secondary-400" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-secondary-400" />
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-luxury-500">
            {t('ctaSubtitle')}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-600 hover:shadow-lg"
            >
              {tCommon('properties')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-secondary-400 px-8 py-3.5 text-sm font-semibold text-secondary-600 transition-all duration-200 hover:bg-secondary-400 hover:text-white"
            >
              {t('ctaButton')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
