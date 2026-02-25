// =============================================================================
// THE A 5995 - Property Type Page
// =============================================================================

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { createServerClient } from '@/lib/supabase';
const supabase = createServerClient();
import { getLocalizedField, PROPERTY_TYPE_SLUGS } from '@/lib/utils';
import PropertyGrid from '@/components/public/PropertyGrid';
import type { PropertyWithDetails, Locale } from '@/types';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// ---------------------------------------------------------------------------
// Resolve property type from slug (check all locales)
// ---------------------------------------------------------------------------

function resolvePropertyType(slug: string): {
  key: string;
  type: (typeof PROPERTY_TYPE_SLUGS)[string];
} | null {
  for (const [key, val] of Object.entries(PROPERTY_TYPE_SLUGS)) {
    if (
      val.slug_en === slug ||
      val.slug_th === slug ||
      val.slug_zh === slug
    ) {
      return { key, type: val };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Known static page paths - to avoid conflicting with this catch-all
// ---------------------------------------------------------------------------

const RESERVED_PATHS = ['about', 'contact', 'blog', 'properties', 'admin', 'privacy', 'terms'];

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; propertyType: string }>;
}): Promise<Metadata> {
  const { locale, propertyType: slug } = await params;

  if (RESERVED_PATHS.includes(slug)) {
    return {};
  }

  const resolved = resolvePropertyType(decodeURIComponent(slug));

  if (!resolved) {
    return { title: 'Not Found | THE A 5995' };
  }

  const name = getLocalizedField(resolved.type, 'name', locale);

  return {
    title: `${name} | THE A 5995`,
    description: `Browse luxury ${name.toLowerCase()} properties for sale and rent in Thailand.`,
  };
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function PropertyTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; propertyType: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, propertyType: slug } = await params;
  const resolvedSearchParams = await searchParams;

  // Skip if this is a reserved path (let other routes handle it)
  if (RESERVED_PATHS.includes(slug)) {
    notFound();
  }

  setRequestLocale(locale);

  const decodedSlug = decodeURIComponent(slug);
  const resolved = resolvePropertyType(decodedSlug);

  if (!resolved) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'search' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const page = Number(resolvedSearchParams.page) || 1;
  const perPage = 12;

  const typeName = getLocalizedField(resolved.type, 'name', locale);

  // Fetch properties of this type
  let properties: PropertyWithDetails[] = [];
  let totalCount = 0;

  try {
    // First, find the property type ID from the database
    let propertyTypeId: string | null = null;
    const { data: typeData } = await supabase
      .from('property_types')
      .select('id')
      .eq('slug_en', resolved.type.slug_en)
      .single();

    if (typeData) {
      propertyTypeId = typeData.id;
    }

    if (propertyTypeId) {
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      const { data, count } = await supabase
        .from('properties')
        .select('*, property_type:property_types(*), images:property_images(*)', {
          count: 'exact',
        })
        .eq('property_type_id', propertyTypeId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(from, to);

      properties = (data as PropertyWithDetails[]) || [];
      totalCount = count || 0;
    }
  } catch {
    properties = [];
    totalCount = 0;
  }

  const totalPages = Math.ceil(totalCount / perPage);

  function buildPageUrl(pageNum: number): string {
    const typeSlug = getLocalizedField(resolved!.type, 'slug', locale);
    if (pageNum <= 1) return `/${typeSlug}`;
    return `/${typeSlug}?page=${pageNum}`;
  }

  return (
    <div className="min-h-screen bg-luxury-50">
      {/* Page Header */}
      <div className="flex min-h-[50vh] items-center bg-primary-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
            {typeName}
          </h1>
          <p className="mt-2 text-luxury-200">
            {t('resultsFound', { count: String(totalCount) })}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Property Grid */}
        <PropertyGrid properties={properties} />

        {/* CTA when no properties */}
        {properties.length === 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
            >
              {tCommon('viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="mt-12 flex items-center justify-center gap-2"
            aria-label="Pagination"
          >
            {page > 1 ? (
              <Link
                href={buildPageUrl(page - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-luxury-200 bg-white text-primary-700 transition-colors hover:bg-luxury-50"
                aria-label={tCommon('previous')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-luxury-200 bg-luxury-100 text-luxury-400 cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" />
              </span>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => {
                const elements: React.ReactNode[] = [];
                if (idx > 0 && p - arr[idx - 1] > 1) {
                  elements.push(
                    <span
                      key={`ellipsis-${p}`}
                      className="flex h-10 w-10 items-center justify-center text-luxury-500"
                    >
                      ...
                    </span>,
                  );
                }
                elements.push(
                  <Link
                    key={p}
                    href={buildPageUrl(p)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-primary-700 text-white'
                        : 'border border-luxury-200 bg-white text-primary-700 hover:bg-luxury-50'
                    }`}
                  >
                    {p}
                  </Link>,
                );
                return elements;
              })}

            {page < totalPages ? (
              <Link
                href={buildPageUrl(page + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-luxury-200 bg-white text-primary-700 transition-colors hover:bg-luxury-50"
                aria-label={tCommon('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-luxury-200 bg-luxury-100 text-luxury-400 cursor-not-allowed">
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </nav>
        )}

        {totalPages > 1 && (
          <p className="mt-4 text-center text-sm text-luxury-500">
            {tCommon('page')} {page} {tCommon('of')} {totalPages}
          </p>
        )}
      </div>
    </div>
  );
}
