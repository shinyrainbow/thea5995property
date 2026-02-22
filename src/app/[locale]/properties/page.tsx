// =============================================================================
// THE A 5995 - Properties Listing Page
// =============================================================================

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { supabase } from '@/lib/supabase';
import PropertyGrid from '@/components/public/PropertyGrid';
import PropertyFilter from '@/components/public/PropertyFilter';
import type { PropertyWithDetails } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('propertiesTitle'),
    description: t('propertiesDescription'),
  };
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function PropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const resolvedSearchParams = await searchParams;
  const t = await getTranslations({ locale, namespace: 'search' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  // Parse search params
  const page = Number(resolvedSearchParams.page) || 1;
  const perPage = 12;
  const search = (resolvedSearchParams.search as string) || '';
  const propertyTypeFilter = (resolvedSearchParams.property_type as string) || '';
  const transactionType = (resolvedSearchParams.transaction_type as string) || '';
  const province = (resolvedSearchParams.province as string) || '';
  const minPrice = (resolvedSearchParams.min_price as string) || '';
  const maxPrice = (resolvedSearchParams.max_price as string) || '';
  const bedrooms = (resolvedSearchParams.bedrooms as string) || '';
  const sortBy = (resolvedSearchParams.sort_by as string) || 'newest';

  let properties: PropertyWithDetails[] = [];
  let totalCount = 0;

  try {
    let query = supabase
      .from('properties')
      .select('*, property_type:property_types(*), images:property_images(*)', {
        count: 'exact',
      })
      .eq('status', 'active');

    // Apply filters
    if (search) {
      query = query.or(
        `title_en.ilike.%${search}%,title_th.ilike.%${search}%,title_zh.ilike.%${search}%,district.ilike.%${search}%,province.ilike.%${search}%`,
      );
    }
    if (transactionType) {
      query = query.eq('transaction_type', transactionType);
    }
    if (province) {
      query = query.eq('province', province);
    }
    if (minPrice) {
      query = query.gte('price', Number(minPrice));
    }
    if (maxPrice) {
      query = query.lte('price', Number(maxPrice));
    }
    if (bedrooms) {
      query = query.gte('bedrooms', Number(bedrooms));
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      default: // newest
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, count } = await query;
    properties = (data as PropertyWithDetails[]) || [];
    totalCount = count || 0;
  } catch {
    // Supabase not connected - fallback to empty
    properties = [];
    totalCount = 0;
  }

  const totalPages = Math.ceil(totalCount / perPage);

  // Build pagination URL helper
  function buildPageUrl(pageNum: number): string {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (propertyTypeFilter) params.set('property_type', propertyTypeFilter);
    if (transactionType) params.set('transaction_type', transactionType);
    if (province) params.set('province', province);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (sortBy && sortBy !== 'newest') params.set('sort_by', sortBy);
    if (pageNum > 1) params.set('page', String(pageNum));

    const qs = params.toString();
    return qs ? `/properties?${qs}` : '/properties';
  }

  return (
    <div className="min-h-screen bg-luxury-50">
      {/* Page Header */}
      <div className="bg-primary-700 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
            {tCommon('properties')}
          </h1>
          <p className="mt-2 text-luxury-200">
            {t('resultsFound', { count: String(totalCount) })}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-8">
          <PropertyFilter />
        </div>

        {/* Property Grid */}
        <PropertyGrid properties={properties} />

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="mt-12 flex items-center justify-center gap-2"
            aria-label="Pagination"
          >
            {/* Previous */}
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

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                // Show first, last, and pages near current
                return p === 1 || p === totalPages || Math.abs(p - page) <= 2;
              })
              .map((p, idx, arr) => {
                // Add ellipsis
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

            {/* Next */}
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

        {/* Page info */}
        {totalPages > 1 && (
          <p className="mt-4 text-center text-sm text-luxury-500">
            {tCommon('page')} {page} {tCommon('of')} {totalPages}
          </p>
        )}
      </div>
    </div>
  );
}
