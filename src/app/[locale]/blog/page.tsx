// =============================================================================
// THE A 5995 - Blog Listing Page (techproperty.co style)
// =============================================================================

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { createServerClient } from '@/lib/supabase';
const supabase = createServerClient();
import { getLocalizedField, formatDate } from '@/lib/utils';
import type { BlogPost, Locale } from '@/types';
import { Calendar, ArrowRight, ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'th' }, { locale: 'zh' }];
}

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
    const { data, count } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(from, from + perPage - 1);
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
      {/* Hero */}
      <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden bg-primary-900">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/50 via-primary-900/70 to-primary-900/90" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-4 text-xs font-medium uppercase tracking-luxury text-secondary-400">
            {t('title')}
          </p>
          <h1 className="font-heading text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {t('heroTitle')}
          </h1>
          <div className="mx-auto mt-6 h-px w-12 bg-secondary-500" />
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-24 md:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => {
                  const title = getLocalizedField(post, 'title', locale);
                  const excerpt = getLocalizedField(post, 'excerpt', locale);
                  const slug = getLocalizedField(post, 'slug', locale);

                  return (
                    <article key={post.id} className="group flex flex-col overflow-hidden border border-luxury-200 bg-white transition-all duration-500 hover:border-primary-900/30 hover:shadow-lg">
                      <div className="relative h-64 overflow-hidden bg-primary-900">
                        {post.featured_image ? (
                          <img src={post.featured_image} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Newspaper className="h-12 w-12 text-white/10" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <div className="mb-3 flex items-center gap-1.5 text-xs text-luxury-500">
                          <Calendar className="h-3.5 w-3.5" />
                          <time dateTime={post.created_at}>{formatDate(post.created_at, locale)}</time>
                        </div>
                        <h2 className="mb-2 line-clamp-2 font-heading text-lg font-semibold text-primary-900 transition-colors group-hover:text-secondary-500">
                          {title}
                        </h2>
                        {excerpt && (
                          <p className="mb-4 line-clamp-3 flex-1 text-sm text-luxury-600 leading-relaxed">{excerpt}</p>
                        )}
                        <Link href={`/blog/${slug}`} className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary-900 transition-colors hover:text-secondary-500">
                          {t('readMore')}
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <nav className="mt-16 flex items-center justify-center gap-2" aria-label="Blog pagination">
                  {page > 1 ? (
                    <Link href={buildPageUrl(page - 1)} className="flex h-10 w-10 items-center justify-center border border-luxury-200 bg-white text-primary-900 hover:bg-luxury-50" aria-label={tCommon('previous')}>
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center border border-luxury-200 bg-luxury-100 text-luxury-400 cursor-not-allowed"><ChevronLeft className="h-4 w-4" /></span>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                    .map((p, idx, arr) => {
                      const elements: React.ReactNode[] = [];
                      if (idx > 0 && p - arr[idx - 1] > 1) elements.push(<span key={`e-${p}`} className="flex h-10 w-10 items-center justify-center text-luxury-500">...</span>);
                      elements.push(
                        <Link key={p} href={buildPageUrl(p)} className={`flex h-10 w-10 items-center justify-center text-sm font-medium transition-colors ${p === page ? 'bg-primary-900 text-white' : 'border border-luxury-200 bg-white text-primary-900 hover:bg-luxury-50'}`}>{p}</Link>,
                      );
                      return elements;
                    })}
                  {page < totalPages ? (
                    <Link href={buildPageUrl(page + 1)} className="flex h-10 w-10 items-center justify-center border border-luxury-200 bg-white text-primary-900 hover:bg-luxury-50" aria-label={tCommon('next')}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center border border-luxury-200 bg-luxury-100 text-luxury-400 cursor-not-allowed"><ChevronRight className="h-4 w-4" /></span>
                  )}
                </nav>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Newspaper className="mb-6 h-12 w-12 text-luxury-300" />
              <h2 className="mb-3 font-heading text-2xl font-bold text-primary-900">{t('noPosts')}</h2>
              <Link href="/" className="mt-8 inline-flex items-center gap-2 bg-primary-900 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-800">
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
