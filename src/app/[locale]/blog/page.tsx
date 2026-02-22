// =============================================================================
// THE A 5995 - Blog Listing Page
// =============================================================================

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { supabase } from '@/lib/supabase';
import { getLocalizedField, formatDate } from '@/lib/utils';
import type { BlogPost, Locale } from '@/types';
import { Calendar, ArrowRight, ChevronLeft, ChevronRight, Newspaper, BookOpen } from 'lucide-react';

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
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('blogTitle'),
    description: t('blogDescription'),
  };
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'blog' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const page = Number(resolvedSearchParams.page) || 1;
  const perPage = 9;

  let posts: BlogPost[] = [];
  let totalCount = 0;

  try {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, count } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(from, to);

    posts = (data as BlogPost[]) || [];
    totalCount = count || 0;
  } catch {
    posts = [];
    totalCount = 0;
  }

  const totalPages = Math.ceil(totalCount / perPage);

  function buildPageUrl(pageNum: number): string {
    if (pageNum <= 1) return '/blog';
    return `/blog?page=${pageNum}`;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-primary-800 py-20 md:py-28">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-secondary-400/8 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-secondary-400/5 blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary-400 to-transparent" />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary-400/30 bg-secondary-400/10 px-4 py-1.5">
            <BookOpen className="h-4 w-4 text-secondary-400" />
            <span className="text-sm font-medium text-secondary-300">{t('title')}</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {t('heroTitle')}
          </h1>
          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-secondary-400" />
            <div className="h-1.5 w-1.5 rounded-full bg-secondary-400" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-secondary-400" />
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-200/90 leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 md:py-24 bg-luxury-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => {
                  const title = getLocalizedField(post, 'title', locale);
                  const excerpt = getLocalizedField(post, 'excerpt', locale);
                  const slug = getLocalizedField(post, 'slug', locale);

                  return (
                    <article
                      key={post.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-luxury-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    >
                      {/* Featured Image */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-luxury-100">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900">
                            <div className="absolute inset-0 bg-grid-pattern" />
                            <Newspaper className="relative h-12 w-12 text-white/20" />
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="flex flex-1 flex-col p-6">
                        {/* Date */}
                        <div className="mb-3 flex items-center gap-1.5 text-xs text-luxury-500">
                          <Calendar className="h-3.5 w-3.5" />
                          <time dateTime={post.created_at}>
                            {formatDate(post.created_at, locale)}
                          </time>
                        </div>

                        {/* Title */}
                        <h2 className="mb-2 line-clamp-2 font-heading text-xl font-semibold text-primary-700 transition-colors group-hover:text-secondary-500">
                          {title}
                        </h2>

                        {/* Excerpt */}
                        {excerpt && (
                          <p className="mb-4 line-clamp-3 flex-1 text-sm text-luxury-600 leading-relaxed">
                            {excerpt}
                          </p>
                        )}

                        {/* Read More */}
                        <Link
                          href={`/blog/${slug}`}
                          className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-500 transition-colors hover:text-secondary-600"
                        >
                          {t('readMore')}
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  className="mt-12 flex items-center justify-center gap-2"
                  aria-label="Blog pagination"
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
                    .filter(
                      (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2,
                    )
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
            </>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 shadow-lg">
                <div className="absolute inset-0 bg-grid-pattern rounded-2xl" />
                <Newspaper className="relative h-12 w-12 text-secondary-400/60" />
              </div>
              <h2 className="mb-3 font-heading text-2xl font-bold text-primary-700">
                {t('noPosts')}
              </h2>
              <p className="mb-8 max-w-sm text-luxury-500">
                Our blog is coming soon with insights about Thailand&apos;s real estate market.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-600 hover:shadow-lg"
              >
                {tCommon('home')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
