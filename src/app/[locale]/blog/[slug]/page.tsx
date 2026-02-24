// =============================================================================
// THE A 5995 - Blog Detail Page
// =============================================================================

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { createServerClient } from '@/lib/supabase';
const supabase = createServerClient();
import { getLocalizedField, formatDate } from '@/lib/utils';
import type { BlogPostWithContent, BlogPost, BlogContent, Locale } from '@/types';
import {
  Calendar,
  User,
  ArrowLeft,
  ArrowRight,
  Share2,
  Quote,
  Newspaper,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Fetch blog post
// ---------------------------------------------------------------------------

async function getBlogPostBySlug(
  slug: string,
  locale: string,
): Promise<BlogPostWithContent | null> {
  try {
    // Try matching slug against the locale-specific slug column
    const slugColumn = `slug_${locale}`;
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, content_blocks:blog_contents(*), author:admin_users(id, name)')
      .eq(slugColumn, slug)
      .eq('status', 'published')
      .single();

    if (data) return data as BlogPostWithContent;

    // Fallback: try all slug columns
    for (const loc of ['en', 'th', 'zh']) {
      if (loc === locale) continue;
      const { data: fallbackData } = await supabase
        .from('blog_posts')
        .select('*, content_blocks:blog_contents(*), author:admin_users(id, name)')
        .eq(`slug_${loc}`, slug)
        .eq('status', 'published')
        .single();

      if (fallbackData) return fallbackData as BlogPostWithContent;
    }

    return null;
  } catch {
    return null;
  }
}

async function getRelatedPosts(
  postId: string,
  limit: number = 3,
): Promise<BlogPost[]> {
  try {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .neq('id', postId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return (data as BlogPost[]) || [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Content Block Renderer
// ---------------------------------------------------------------------------

function ContentBlock({
  block,
  locale,
}: {
  block: BlogContent;
  locale: string;
}) {
  const content = getLocalizedField(block, 'content', locale);
  const imageAlt = getLocalizedField(block, 'image_alt', locale);

  switch (block.content_type) {
    case 'heading':
      return (
        <h2 className="mt-10 mb-4 font-heading text-2xl font-bold text-primary-700 md:text-3xl">
          {content}
        </h2>
      );

    case 'text':
      return (
        <div className="prose prose-lg max-w-none text-luxury-600 leading-relaxed whitespace-pre-line mb-6">
          {content}
        </div>
      );

    case 'image':
      return (
        <figure className="my-8">
          <div className="overflow-hidden rounded-xl">
            <img
              src={block.image_url || ''}
              alt={imageAlt || 'Blog image'}
              className="w-full object-cover"
              loading="lazy"
            />
          </div>
          {imageAlt && (
            <figcaption className="mt-2 text-center text-sm text-luxury-500">
              {imageAlt}
            </figcaption>
          )}
        </figure>
      );

    case 'gallery':
      // Content field stores JSON array of image URLs
      let galleryUrls: string[] = [];
      try {
        galleryUrls = content ? JSON.parse(content) : [];
      } catch {
        galleryUrls = [];
      }

      return (
        <div className="my-8 grid grid-cols-2 gap-3 md:grid-cols-3">
          {galleryUrls.map((url: string, index: number) => (
            <div key={index} className="overflow-hidden rounded-lg">
              <img
                src={url}
                alt={`Gallery image ${index + 1}`}
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      );

    case 'quote':
      return (
        <blockquote className="my-8 border-l-4 border-secondary-400 bg-luxury-50 py-6 px-8 rounded-r-xl">
          <Quote className="mb-2 h-6 w-6 text-secondary-400" />
          <p className="font-heading text-xl italic text-primary-700 leading-relaxed">
            {content}
          </p>
        </blockquote>
      );

    default:
      return null;
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
  const post = await getBlogPostBySlug(slug, locale);

  if (!post) {
    return { title: 'Post Not Found | THE A 5995' };
  }

  const title =
    getLocalizedField(post, 'seo_title', locale) ||
    getLocalizedField(post, 'title', locale);
  const description =
    getLocalizedField(post, 'seo_description', locale) ||
    getLocalizedField(post, 'excerpt', locale) ||
    '';

  return {
    title: `${title} | THE A 5995`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      images: post.featured_image ? [{ url: post.featured_image }] : [],
    },
  };
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'blog' });

  const post = await getBlogPostBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  const title = getLocalizedField(post, 'title', locale);
  const excerpt = getLocalizedField(post, 'excerpt', locale);
  const authorName = post.author?.name || 'THE A 5995';

  // Sort content blocks by sort_order
  const contentBlocks = [...(post.content_blocks || [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  // Fetch related posts
  const relatedPosts = await getRelatedPosts(post.id);

  // Schema.org Article structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    image: post.featured_image,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'THE A 5995',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thea5995.com'}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thea5995.com'}/${locale}/blog/${slug}`,
    },
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen">
        {/* Featured Image Hero */}
        <section className="relative bg-primary-900 -mt-20">
          {post.featured_image ? (
            <div className="relative h-80 md:h-[28rem] pt-20">
              <img
                src={post.featured_image}
                alt={title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent" />
            </div>
          ) : (
            <div className="h-40 md:h-56 pt-20" />
          )}
        </section>

        {/* Article Content */}
        <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-luxury-500 transition-colors hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToBlog')}
          </Link>

          {/* Article header */}
          <header className="mb-10">
            <h1 className="font-heading text-3xl font-bold text-primary-700 leading-tight md:text-4xl lg:text-5xl">
              {title}
            </h1>

            {excerpt && (
              <p className="mt-4 text-xl text-luxury-500 leading-relaxed">
                {excerpt}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-luxury-200 pb-6">
              {/* Author */}
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-700 text-white">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-700">{authorName}</p>
                  <p className="text-xs text-luxury-500">
                    {t('by')} {authorName}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5 text-sm text-luxury-500">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.created_at}>
                  {t('publishedOn')} {formatDate(post.created_at, locale)}
                </time>
              </div>

              {/* Share button */}
              <button
                type="button"
                className="ml-auto flex items-center gap-1.5 rounded-lg border border-luxury-200 px-3 py-1.5 text-sm text-luxury-500 transition-colors hover:bg-luxury-50 hover:text-primary-700"
              >
                <Share2 className="h-3.5 w-3.5" />
                {t('shareArticle')}
              </button>
            </div>
          </header>

          {/* Content Blocks */}
          <div className="mb-16">
            {contentBlocks.length > 0 ? (
              contentBlocks.map((block) => (
                <ContentBlock key={block.id} block={block} locale={locale} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Newspaper className="mb-4 h-12 w-12 text-luxury-300" />
                <p className="text-luxury-500">Content coming soon.</p>
              </div>
            )}
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="border-t border-luxury-200 pt-12">
              <h2 className="mb-8 font-heading text-2xl font-bold text-primary-700">
                {t('relatedPosts')}
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {relatedPosts.map((relatedPost) => {
                  const relatedTitle = getLocalizedField(relatedPost, 'title', locale);
                  const relatedSlug = getLocalizedField(relatedPost, 'slug', locale);
                  const relatedExcerpt = getLocalizedField(relatedPost, 'excerpt', locale);

                  return (
                    <Link
                      key={relatedPost.id}
                      href={`/blog/${relatedSlug}`}
                      className="group flex flex-col overflow-hidden rounded-xl border border-luxury-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-luxury-100">
                        {relatedPost.featured_image ? (
                          <img
                            src={relatedPost.featured_image}
                            alt={relatedTitle}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-700/10 to-secondary-400/10">
                            <Newspaper className="h-8 w-8 text-luxury-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-2 flex items-center gap-1 text-xs text-luxury-500">
                          <Calendar className="h-3 w-3" />
                          <time dateTime={relatedPost.created_at}>
                            {formatDate(relatedPost.created_at, locale)}
                          </time>
                        </div>
                        <h3 className="mb-1 line-clamp-2 font-heading text-base font-semibold text-primary-700 group-hover:text-secondary-500">
                          {relatedTitle}
                        </h3>
                        {relatedExcerpt && (
                          <p className="line-clamp-2 text-xs text-luxury-500">
                            {relatedExcerpt}
                          </p>
                        )}
                        <span className="mt-auto pt-2 inline-flex items-center gap-1 text-xs font-semibold text-secondary-400">
                          {t('readMore')}
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </article>
      </div>
    </>
  );
}
