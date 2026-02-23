// =============================================================================
// THE A 5995 - Projects Listing Page
// =============================================================================

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { supabase } from '@/lib/supabase';
import ProjectGrid from '@/components/public/ProjectGrid';
import type { ProjectWithDetails } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return {
    title: t('projectsTitle'),
    description: t('projectsDescription'),
  };
}

export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const resolvedSearchParams = await searchParams;
  const t = await getTranslations({ locale, namespace: 'project' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const page = Number(resolvedSearchParams.page) || 1;
  const perPage = 12;
  const search = (resolvedSearchParams.search as string) || '';
  const propertyTypeFilter = (resolvedSearchParams.property_type as string) || '';
  const province = (resolvedSearchParams.province as string) || '';
  const sortBy = (resolvedSearchParams.sort_by as string) || 'newest';

  let projects: ProjectWithDetails[] = [];
  let totalCount = 0;

  try {
    let query = supabase
      .from('projects')
      .select('*, property_type:property_types(*), images:project_images(*)', { count: 'exact' })
      .eq('status', 'active');

    if (search) {
      query = query.or(`name_en.ilike.%${search}%,name_th.ilike.%${search}%,name_zh.ilike.%${search}%,district.ilike.%${search}%,province.ilike.%${search}%`);
    }
    if (propertyTypeFilter) query = query.eq('property_type_id', propertyTypeFilter);
    if (province) query = query.eq('province', province);

    switch (sortBy) {
      case 'oldest': query = query.order('created_at', { ascending: true }); break;
      case 'name_asc': query = query.order('name_en', { ascending: true }); break;
      case 'name_desc': query = query.order('name_en', { ascending: false }); break;
      default: query = query.order('created_at', { ascending: false }); break;
    }

    const from = (page - 1) * perPage;
    query = query.range(from, from + perPage - 1);

    const { data, count } = await query;
    projects = (data as ProjectWithDetails[]) || [];
    totalCount = count || 0;
  } catch {
    projects = [];
    totalCount = 0;
  }

  const totalPages = Math.ceil(totalCount / perPage);

  function buildPageUrl(pageNum: number): string {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (propertyTypeFilter) params.set('property_type', propertyTypeFilter);
    if (province) params.set('province', province);
    if (sortBy && sortBy !== 'newest') params.set('sort_by', sortBy);
    if (pageNum > 1) params.set('page', String(pageNum));
    const qs = params.toString();
    return qs ? `/projects?${qs}` : '/projects';
  }

  return (
    <div className="min-h-screen bg-luxury-50">
      {/* Header */}
      <section className="relative overflow-hidden bg-primary-900 -mt-20 pt-32 pb-20 md:pt-36 md:pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/50 via-primary-900/70 to-primary-900/90" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-luxury text-secondary-400">
            {t('projectsFound', { count: String(totalCount) })}
          </p>
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {t('allProjects')}
          </h1>
          <div className="mt-4 h-px w-12 bg-secondary-500" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ProjectGrid projects={projects} />

        {totalPages > 1 && (
          <nav className="mt-16 flex items-center justify-center gap-2" aria-label="Pagination">
            {page > 1 ? (
              <Link href={buildPageUrl(page - 1)} className="flex h-10 w-10 items-center justify-center border border-luxury-200 bg-white text-primary-900 transition-colors hover:bg-luxury-50" aria-label={tCommon('previous')}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            ) : (
              <span className="flex h-10 w-10 items-center justify-center border border-luxury-200 bg-luxury-100 text-luxury-400 cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" />
              </span>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => {
                const elements: React.ReactNode[] = [];
                if (idx > 0 && p - arr[idx - 1] > 1) {
                  elements.push(<span key={`e-${p}`} className="flex h-10 w-10 items-center justify-center text-luxury-500">...</span>);
                }
                elements.push(
                  <Link key={p} href={buildPageUrl(p)} className={`flex h-10 w-10 items-center justify-center text-sm font-medium transition-colors ${p === page ? 'bg-primary-900 text-white' : 'border border-luxury-200 bg-white text-primary-900 hover:bg-luxury-50'}`}>
                    {p}
                  </Link>,
                );
                return elements;
              })}

            {page < totalPages ? (
              <Link href={buildPageUrl(page + 1)} className="flex h-10 w-10 items-center justify-center border border-luxury-200 bg-white text-primary-900 transition-colors hover:bg-luxury-50" aria-label={tCommon('next')}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="flex h-10 w-10 items-center justify-center border border-luxury-200 bg-luxury-100 text-luxury-400 cursor-not-allowed">
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </nav>
        )}

        {totalPages > 1 && (
          <p className="mt-4 text-center text-sm text-luxury-500">{tCommon('page')} {page} {tCommon('of')} {totalPages}</p>
        )}
      </div>
    </div>
  );
}
