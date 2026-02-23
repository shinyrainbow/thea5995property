// =============================================================================
// THE A 5995 - Homepage (inspired by techproperty.co)
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
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home className="h-6 w-6" />,
  Building2: <Building2 className="h-6 w-6" />,
  Map: <Map className="h-6 w-6" />,
  Castle: <Castle className="h-6 w-6" />,
  Hotel: <Hotel className="h-6 w-6" />,
  Building: <Building className="h-6 w-6" />,
  Briefcase: <Briefcase className="h-6 w-6" />,
  Store: <Store className="h-6 w-6" />,
  Factory: <Factory className="h-6 w-6" />,
  BedDouble: <BedDouble className="h-6 w-6" />,
  Landmark: <Landmark className="h-6 w-6" />,
};

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

      {/* Property Collection - grid with overlay cards like techproperty.co */}
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

          {/* Collection grid - tall image-overlay cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {propertyTypes.slice(0, 6).map((type) => {
              const name = getLocalizedField(type, 'name', locale);
              const slug = getLocalizedField(type, 'slug', locale);
              const icon = iconMap[type.icon] || <Building2 className="h-6 w-6" />;

              return (
                <Link
                  key={type.id}
                  href={`/${slug}`}
                  className="group relative h-[320px] overflow-hidden rounded-lg bg-primary-900"
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/40 to-transparent transition-opacity group-hover:from-primary-900/95" />

                  {/* Subtle pattern */}
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                      backgroundSize: '32px 32px',
                    }}
                  />

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-8">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-secondary-400 backdrop-blur-sm transition-colors group-hover:bg-secondary-500 group-hover:text-white">
                      {icon}
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-white">
                      {name}
                    </h3>
                    <p className="mt-2 flex items-center gap-2 text-sm font-medium text-white/60 opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                      Explore Collection
                      <ArrowRight className="h-4 w-4" />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Remaining types as smaller cards */}
          {propertyTypes.length > 6 && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {propertyTypes.slice(6).map((type) => {
                const name = getLocalizedField(type, 'name', locale);
                const slug = getLocalizedField(type, 'slug', locale);
                const icon = iconMap[type.icon] || <Building2 className="h-6 w-6" />;

                return (
                  <Link
                    key={type.id}
                    href={`/${slug}`}
                    className="group flex items-center gap-3 rounded-lg border border-luxury-200 bg-white p-4 transition-all duration-300 hover:border-primary-900/30 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-luxury-50 text-primary-900 transition-colors group-hover:bg-primary-900 group-hover:text-white">
                      {icon}
                    </div>
                    <span className="text-sm font-semibold text-primary-900">{name}</span>
                  </Link>
                );
              })}
            </div>
          )}
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
