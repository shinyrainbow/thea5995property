// =============================================================================
// THE A 5995 - Project Detail Page
// =============================================================================

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { supabase } from '@/lib/supabase';
import { getLocalizedField } from '@/lib/utils';
import PropertyGallery from '@/components/public/PropertyGallery';
import PropertyGrid from '@/components/public/PropertyGrid';
import Badge from '@/components/ui/Badge';
import type { ProjectWithDetails, PropertyWithDetails } from '@/types';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Calendar,
  Users,
  Wrench,
  Map,
  Tag,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

async function getProjectBySlug(
  slug: string,
  locale: string,
): Promise<ProjectWithDetails | null> {
  try {
    const slugColumn = `slug_${locale}`;
    const { data } = await supabase
      .from('projects')
      .select('*, property_type:property_types(*), images:project_images(*)')
      .eq(slugColumn, slug)
      .eq('status', 'active')
      .single();

    if (data) return data as ProjectWithDetails;

    // Fallback: try other locale slugs
    for (const loc of ['en', 'th', 'zh']) {
      if (loc === locale) continue;
      const { data: fallbackData } = await supabase
        .from('projects')
        .select('*, property_type:property_types(*), images:project_images(*)')
        .eq(`slug_${loc}`, slug)
        .eq('status', 'active')
        .single();

      if (fallbackData) return fallbackData as ProjectWithDetails;
    }

    return null;
  } catch {
    return null;
  }
}

async function getProjectUnits(projectId: string): Promise<PropertyWithDetails[]> {
  try {
    const { data } = await supabase
      .from('properties')
      .select('*, property_type:property_types(*), images:property_images(*)')
      .eq('project_id', projectId)
      .eq('status', 'active')
      .order('price', { ascending: true });

    return (data as PropertyWithDetails[]) || [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const statusVariant: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
  active: 'success',
  completed: 'info',
  under_construction: 'warning',
  draft: 'default',
};

const statusLabel: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  under_construction: 'Under Construction',
  draft: 'Draft',
};

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug, locale);

  if (!project) {
    return { title: 'Project Not Found | THE A 5995' };
  }

  const title = getLocalizedField(project, 'seo_title', locale) ||
    getLocalizedField(project, 'name', locale);
  const description = getLocalizedField(project, 'seo_description', locale) ||
    getLocalizedField(project, 'description', locale).slice(0, 160);

  const primaryImage = project.images?.find((img) => img.is_primary) || project.images?.[0];

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

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'project' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const project = await getProjectBySlug(slug, locale);

  if (!project) {
    notFound();
  }

  const name = getLocalizedField(project, 'name', locale);
  const description = getLocalizedField(project, 'description', locale);
  const typeName = project.property_type
    ? getLocalizedField(project.property_type, 'name', locale)
    : '';

  // Prepare gallery images
  const galleryImages = (project.images || [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      url: img.url,
      alt: getLocalizedField(img, 'alt', locale) || name,
    }));

  // Fetch units in this project
  const units = await getProjectUnits(project.id);

  // JSON-LD structured data
  const primaryImage = project.images?.find((img) => img.is_primary) || project.images?.[0];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name,
    description: description.slice(0, 300),
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thea5995.com'}/${locale}/projects/${slug}`,
    image: primaryImage?.url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: project.address,
      addressLocality: project.district,
      addressRegion: project.province,
      addressCountry: 'TH',
    },
    ...(project.latitude && project.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: project.latitude,
            longitude: project.longitude,
          },
        }
      : {}),
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
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm text-luxury-500 transition-colors hover:text-primary-700"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('backToProjects')}
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Gallery */}
          {galleryImages.length > 0 && (
            <div className="mb-8">
              <PropertyGallery images={galleryImages} propertyTitle={name} />
            </div>
          )}

          {/* Project Info Card */}
          <div className="mb-8 rounded-xl bg-white border border-luxury-200 p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge
                    variant={statusVariant[project.status] || 'default'}
                    dot
                  >
                    {statusLabel[project.status] || project.status}
                  </Badge>
                  {typeName && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-luxury-100 px-3 py-1 text-xs font-medium text-luxury-700">
                      <Tag className="h-3 w-3" />
                      {typeName}
                    </span>
                  )}
                </div>
                <h1 className="font-heading text-2xl font-bold text-primary-700 md:text-3xl">
                  {name}
                </h1>
                <div className="mt-2 flex items-center gap-1.5 text-luxury-500">
                  <MapPin className="h-4 w-4 text-secondary-400" />
                  <span>{project.address}, {project.district}, {project.province}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left column - Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Details Grid */}
              <div className="rounded-xl bg-white border border-luxury-200 p-6 shadow-sm">
                <h2 className="mb-4 font-heading text-xl font-semibold text-primary-700">
                  {t('projectDetails')}
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {project.developer_name && (
                    <div className="flex flex-col items-center gap-2 rounded-lg bg-luxury-50 p-4">
                      <Users className="h-6 w-6 text-secondary-400" />
                      <span className="text-sm font-bold text-primary-700 text-center">
                        {project.developer_name}
                      </span>
                      <span className="text-xs text-luxury-500">{t('developer')}</span>
                    </div>
                  )}
                  {project.total_units !== null && (
                    <div className="flex flex-col items-center gap-2 rounded-lg bg-luxury-50 p-4">
                      <Building2 className="h-6 w-6 text-secondary-400" />
                      <span className="text-2xl font-bold text-primary-700">
                        {project.total_units}
                      </span>
                      <span className="text-xs text-luxury-500">{t('totalUnits')}</span>
                    </div>
                  )}
                  {project.year_built !== null && (
                    <div className="flex flex-col items-center gap-2 rounded-lg bg-luxury-50 p-4">
                      <Calendar className="h-6 w-6 text-secondary-400" />
                      <span className="text-2xl font-bold text-primary-700">
                        {project.year_built}
                      </span>
                      <span className="text-xs text-luxury-500">{t('yearBuilt')}</span>
                    </div>
                  )}
                  {units.length > 0 && (
                    <div className="flex flex-col items-center gap-2 rounded-lg bg-luxury-50 p-4">
                      <Building2 className="h-6 w-6 text-secondary-400" />
                      <span className="text-2xl font-bold text-primary-700">
                        {units.length}
                      </span>
                      <span className="text-xs text-luxury-500">{t('availableUnits')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Facilities */}
              {project.facilities && project.facilities.length > 0 && (
                <div className="rounded-xl bg-white border border-luxury-200 p-6 shadow-sm">
                  <h2 className="mb-4 font-heading text-xl font-semibold text-primary-700">
                    {t('facilities')}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {project.facilities.map((facility, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-full bg-luxury-50 border border-luxury-200 px-3 py-1.5 text-sm text-luxury-700"
                      >
                        <Wrench className="h-3.5 w-3.5 text-secondary-400" />
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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
                  <span>{project.address}, {project.district}, {project.province}</span>
                </div>
                <div className="flex h-64 items-center justify-center rounded-lg bg-luxury-100 border-2 border-dashed border-luxury-300">
                  <div className="text-center text-luxury-400">
                    <Map className="mx-auto mb-2 h-10 w-10" />
                    <p className="text-sm font-medium">Map Integration</p>
                    <p className="text-xs">
                      {project.latitude && project.longitude
                        ? `${project.latitude}, ${project.longitude}`
                        : 'Location coordinates not available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Sidebar info */}
            <div className="space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Quick Info Card */}
                <div className="rounded-xl bg-white border border-luxury-200 p-6 shadow-sm">
                  <h3 className="mb-4 font-heading text-lg font-semibold text-primary-700">
                    {t('projectInfo')}
                  </h3>
                  <dl className="space-y-3">
                    {typeName && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-luxury-500">{t('type')}</dt>
                        <dd className="text-sm font-medium text-primary-700">{typeName}</dd>
                      </div>
                    )}
                    {project.developer_name && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-luxury-500">{t('developer')}</dt>
                        <dd className="text-sm font-medium text-primary-700">{project.developer_name}</dd>
                      </div>
                    )}
                    {project.total_units !== null && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-luxury-500">{t('totalUnits')}</dt>
                        <dd className="text-sm font-medium text-primary-700">{project.total_units}</dd>
                      </div>
                    )}
                    {project.year_built !== null && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-luxury-500">{t('yearBuilt')}</dt>
                        <dd className="text-sm font-medium text-primary-700">{project.year_built}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-sm text-luxury-500">{t('location')}</dt>
                      <dd className="text-sm font-medium text-primary-700 text-right">
                        {project.district}, {project.province}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-luxury-500">{t('status')}</dt>
                      <dd>
                        <Badge
                          variant={statusVariant[project.status] || 'default'}
                          dot
                        >
                          {statusLabel[project.status] || project.status}
                        </Badge>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Available Units */}
          {units.length > 0 && (
            <section className="mt-16">
              <h2 className="mb-8 font-heading text-2xl font-bold text-primary-700">
                {t('availableUnits')} ({units.length})
              </h2>
              <PropertyGrid properties={units} />
            </section>
          )}
        </div>
      </div>
    </>
  );
}
