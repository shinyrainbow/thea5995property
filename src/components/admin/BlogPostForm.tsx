'use client';

// =============================================================================
// THE A 5995 - Blog Post Form Component (Rich Text Editor with Language Tabs)
// =============================================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { blogPostSchema, type BlogPostSchemaType } from '@/lib/validations';
import ImageUploader, { type UploadedImage } from '@/components/admin/ImageUploader';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { cn } from '@/lib/utils';
import {
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { BlogPostWithContent } from '@/types';

// ---------------------------------------------------------------------------
// Language Tabs
// ---------------------------------------------------------------------------

const LANGS = [
  { key: 'en', label: 'EN', full: 'English' },
  { key: 'th', label: 'TH', full: 'ไทย' },
  { key: 'zh', label: 'ZH', full: '中文' },
] as const;

type LangKey = (typeof LANGS)[number]['key'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface BlogPostFormProps {
  post?: BlogPostWithContent;
}

export default function BlogPostForm({ post }: BlogPostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<LangKey>('en');

  const isEditing = !!post;

  // Featured image state
  const [featuredImages, setFeaturedImages] = useState<UploadedImage[]>(
    post?.featured_image
      ? [{ url: post.featured_image, sort_order: 0, is_primary: true }]
      : [],
  );

  // Rich text content state (HTML strings per language)
  const firstBlock = post?.content_blocks?.[0];
  const [contentEn, setContentEn] = useState(firstBlock?.content_en || '');
  const [contentTh, setContentTh] = useState(firstBlock?.content_th || '');
  const [contentZh, setContentZh] = useState(firstBlock?.content_zh || '');

  const contentMap: Record<LangKey, { value: string; onChange: (v: string) => void }> = {
    en: { value: contentEn, onChange: setContentEn },
    th: { value: contentTh, onChange: setContentTh },
    zh: { value: contentZh, onChange: setContentZh },
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BlogPostSchemaType>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: post
      ? {
          title_en: post.title_en,
          title_th: post.title_th,
          title_zh: post.title_zh,
          excerpt_en: post.excerpt_en || '',
          excerpt_th: post.excerpt_th || '',
          excerpt_zh: post.excerpt_zh || '',
          status: post.status,
          featured_image: post.featured_image || '',
          seo_title_en: post.seo_title_en || '',
          seo_title_th: post.seo_title_th || '',
          seo_title_zh: post.seo_title_zh || '',
          seo_description_en: post.seo_description_en || '',
          seo_description_th: post.seo_description_th || '',
          seo_description_zh: post.seo_description_zh || '',
        }
      : {
          status: 'draft',
        },
  });

  const status = watch('status');

  const handleFeaturedImageChange = (imgs: UploadedImage[]) => {
    setFeaturedImages(imgs);
    setValue('featured_image', imgs[0]?.url || '');
  };

  const onSubmit = async (data: BlogPostSchemaType) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url = isEditing ? `/api/blog/${post.id}` : '/api/blog';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save blog post');
      }

      const result = await response.json();
      const postId = result.data?.id || post?.id;

      // Save content as a single rich-text block
      if (postId) {
        const blocksResponse = await fetch(`/api/blog/${postId}/content`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blocks: [
              {
                content_type: 'text',
                content_en: contentEn,
                content_th: contentTh,
                content_zh: contentZh,
                image_url: '',
                image_alt_en: '',
                image_alt_th: '',
                image_alt_zh: '',
                sort_order: 0,
              },
            ],
          }),
        });

        if (!blocksResponse.ok) {
          console.error('Failed to save content');
        }
      }

      router.push('/admin/blog');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 border border-luxury-200 rounded-lg text-primary-700 placeholder:text-luxury-400 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all text-sm';
  const labelClass = 'block text-sm font-medium text-primary-600 mb-1.5';
  const errorMsgClass = 'mt-1 text-xs text-red-500';
  const sectionClass = 'bg-white rounded-xl border border-luxury-200 p-5 space-y-5';
  const sectionTitle = 'text-sm font-semibold text-primary-700 uppercase tracking-wider pb-2 border-b border-luxury-100';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Status */}
      <div className="bg-white rounded-xl border border-luxury-200 p-5 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-primary-600">Status:</label>
          <select
            {...register('status')}
            className="px-3 py-2 border border-luxury-200 rounded-lg text-sm text-primary-700 focus:outline-none focus:ring-2 focus:ring-secondary-400"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <span
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium',
              status === 'published'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700',
            )}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Title & Excerpt */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>Post Info</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>Title (English) *</label>
            <input
              {...register('title_en')}
              className={inputClass}
              placeholder="Blog post title"
            />
            {errors.title_en && <p className={errorMsgClass}>{errors.title_en.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Title (Thai) *</label>
            <input
              {...register('title_th')}
              className={inputClass}
              placeholder="Thai title"
            />
            {errors.title_th && <p className={errorMsgClass}>{errors.title_th.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Title (Chinese) *</label>
            <input
              {...register('title_zh')}
              className={inputClass}
              placeholder="Chinese title"
            />
            {errors.title_zh && <p className={errorMsgClass}>{errors.title_zh.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>Excerpt (EN)</label>
            <textarea
              {...register('excerpt_en')}
              rows={2}
              className={cn(inputClass, 'resize-y')}
              placeholder="Brief summary..."
            />
          </div>
          <div>
            <label className={labelClass}>Excerpt (TH)</label>
            <textarea
              {...register('excerpt_th')}
              rows={2}
              className={cn(inputClass, 'resize-y')}
              placeholder="Thai excerpt..."
            />
          </div>
          <div>
            <label className={labelClass}>Excerpt (ZH)</label>
            <textarea
              {...register('excerpt_zh')}
              rows={2}
              className={cn(inputClass, 'resize-y')}
              placeholder="Chinese excerpt..."
            />
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>Featured Image</h3>
        <ImageUploader
          images={featuredImages}
          onChange={handleFeaturedImageChange}
          folder="blog"
          maxImages={1}
        />
      </div>

      {/* Content Editor with Language Tabs */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between pb-2 border-b border-luxury-100">
          <h3 className="text-sm font-semibold text-primary-700 uppercase tracking-wider">
            Content
          </h3>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-luxury-200 p-1 w-fit">
          {LANGS.map((lang) => (
            <button
              key={lang.key}
              type="button"
              onClick={() => setActiveLang(lang.key)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeLang === lang.key
                  ? 'bg-primary-700 text-white'
                  : 'text-luxury-600 hover:bg-luxury-50',
              )}
            >
              {lang.label}
              <span className="ml-1.5 text-xs opacity-70">{lang.full}</span>
            </button>
          ))}
        </div>

        {/* Editor per language (render all, show active) */}
        {LANGS.map((lang) => (
          <div
            key={lang.key}
            className={activeLang === lang.key ? 'block' : 'hidden'}
          >
            <RichTextEditor
              value={contentMap[lang.key].value}
              onChange={contentMap[lang.key].onChange}
              placeholder={`Write ${lang.full} content...`}
            />
          </div>
        ))}
      </div>

      {/* SEO */}
      <div className={sectionClass}>
        <h3 className={sectionTitle}>SEO (Optional)</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>Meta Title (EN)</label>
            <input {...register('seo_title_en')} className={inputClass} placeholder="SEO title (EN)" />
          </div>
          <div>
            <label className={labelClass}>Meta Title (TH)</label>
            <input {...register('seo_title_th')} className={inputClass} placeholder="SEO title (TH)" />
          </div>
          <div>
            <label className={labelClass}>Meta Title (ZH)</label>
            <input {...register('seo_title_zh')} className={inputClass} placeholder="SEO title (ZH)" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>Meta Description (EN)</label>
            <textarea
              {...register('seo_description_en')}
              rows={2}
              className={cn(inputClass, 'resize-y')}
              placeholder="SEO description (EN)"
            />
          </div>
          <div>
            <label className={labelClass}>Meta Description (TH)</label>
            <textarea
              {...register('seo_description_th')}
              rows={2}
              className={cn(inputClass, 'resize-y')}
              placeholder="SEO description (TH)"
            />
          </div>
          <div>
            <label className={labelClass}>Meta Description (ZH)</label>
            <textarea
              {...register('seo_description_zh')}
              rows={2}
              className={cn(inputClass, 'resize-y')}
              placeholder="SEO description (ZH)"
            />
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/blog')}
          className="px-6 py-2.5 border border-luxury-200 rounded-lg text-sm font-medium text-luxury-600 hover:bg-luxury-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            setValue('status', 'draft');
            handleSubmit(onSubmit)();
          }}
          className="px-6 py-2.5 bg-luxury-200 text-primary-700 rounded-lg text-sm font-medium hover:bg-luxury-300 transition-colors"
        >
          Save as Draft
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-primary-700 text-white rounded-lg text-sm font-medium hover:bg-primary-800 disabled:bg-primary-400 transition-colors flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isEditing ? 'Update Post' : 'Create Post'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
