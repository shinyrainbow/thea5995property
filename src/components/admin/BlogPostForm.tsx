'use client';

// =============================================================================
// THE A 5995 - Blog Post Form Component (Canvas Block Editor)
// =============================================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { blogPostSchema, type BlogPostSchemaType } from '@/lib/validations';
import ImageUploader, { type UploadedImage } from '@/components/admin/ImageUploader';
import { cn } from '@/lib/utils';
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Type,
  Image as ImageIcon,
  GripVertical,
} from 'lucide-react';
import type { BlogPostWithContent, BlogContentType } from '@/types';

// ---------------------------------------------------------------------------
// Content Block Types
// ---------------------------------------------------------------------------

interface ContentBlock {
  id?: string;
  content_type: BlogContentType;
  content_en: string;
  content_th: string;
  content_zh: string;
  image_url: string;
  image_alt_en: string;
  image_alt_th: string;
  image_alt_zh: string;
  sort_order: number;
}

const emptyBlock = (sortOrder: number, type: BlogContentType = 'text'): ContentBlock => ({
  content_type: type,
  content_en: '',
  content_th: '',
  content_zh: '',
  image_url: '',
  image_alt_en: '',
  image_alt_th: '',
  image_alt_zh: '',
  sort_order: sortOrder,
});

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

  const isEditing = !!post;

  // Featured image state
  const [featuredImages, setFeaturedImages] = useState<UploadedImage[]>(
    post?.featured_image
      ? [{ url: post.featured_image, sort_order: 0, is_primary: true }]
      : [],
  );

  // Content blocks state
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    post?.content_blocks?.map((b) => ({
      id: b.id,
      content_type: b.content_type,
      content_en: b.content_en || '',
      content_th: b.content_th || '',
      content_zh: b.content_zh || '',
      image_url: b.image_url || '',
      image_alt_en: b.image_alt_en || '',
      image_alt_th: b.image_alt_th || '',
      image_alt_zh: b.image_alt_zh || '',
      sort_order: b.sort_order,
    })) ?? [],
  );

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

  // Update featured_image when images change
  const handleFeaturedImageChange = (imgs: UploadedImage[]) => {
    setFeaturedImages(imgs);
    setValue('featured_image', imgs[0]?.url || '');
  };

  // Block management
  const addBlock = (type: BlogContentType) => {
    setBlocks([...blocks, emptyBlock(blocks.length, type)]);
  };

  const removeBlock = (index: number) => {
    const updated = blocks.filter((_, i) => i !== index);
    updated.forEach((b, i) => (b.sort_order = i));
    setBlocks(updated);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const updated = [...blocks];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((b, i) => (b.sort_order = i));
    setBlocks(updated);
  };

  const updateBlock = (index: number, field: keyof ContentBlock, value: string) => {
    const updated = [...blocks];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[index] as any)[field] = value;
    setBlocks(updated);
  };

  // Handle image upload inside an image block
  const handleBlockImageChange = (index: number, imgs: UploadedImage[]) => {
    const updated = [...blocks];
    updated[index].image_url = imgs[0]?.url || '';
    setBlocks(updated);
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

      // Save content blocks
      if (postId) {
        const blocksResponse = await fetch(`/api/blog/${postId}/content`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blocks }),
        });

        if (!blocksResponse.ok) {
          console.error('Failed to save content blocks');
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

      {/* Content Canvas */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between pb-2 border-b border-luxury-100">
          <h3 className="text-sm font-semibold text-primary-700 uppercase tracking-wider">
            Content Blocks ({blocks.length})
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => addBlock('text')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-700 text-white rounded-lg text-sm hover:bg-primary-800 transition-colors"
            >
              <Type className="w-3.5 h-3.5" />
              Text
            </button>
            <button
              type="button"
              onClick={() => addBlock('image')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-400 text-white rounded-lg text-sm hover:bg-secondary-500 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Image
            </button>
          </div>
        </div>

        {blocks.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-luxury-300 rounded-xl">
            <Plus className="w-10 h-10 mx-auto text-luxury-300 mb-2" />
            <p className="text-luxury-500 text-sm">No content yet</p>
            <p className="text-luxury-400 text-xs mt-1">
              Add text or image blocks to build your blog post
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => addBlock('text')}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary-700 text-white rounded-lg text-sm hover:bg-primary-800 transition-colors"
              >
                <Type className="w-4 h-4" />
                Add Text Block
              </button>
              <button
                type="button"
                onClick={() => addBlock('image')}
                className="flex items-center gap-1.5 px-4 py-2 bg-secondary-400 text-white rounded-lg text-sm hover:bg-secondary-500 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                Add Image Block
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <div
                key={index}
                className="border border-luxury-200 rounded-xl overflow-hidden"
              >
                {/* Block Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-luxury-50 border-b border-luxury-200">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-luxury-400" />
                    {block.content_type === 'text' ? (
                      <Type className="w-4 h-4 text-primary-600" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-secondary-500" />
                    )}
                    <span className="text-sm font-medium text-primary-700">
                      {block.content_type === 'text' ? 'Text' : 'Image'} Block
                    </span>
                    <span className="text-xs text-luxury-400">#{index + 1}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-luxury-400 hover:text-primary-700 disabled:opacity-30 transition-colors"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 'down')}
                      disabled={index === blocks.length - 1}
                      className="p-1 text-luxury-400 hover:text-primary-700 disabled:opacity-30 transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(index)}
                      className="p-1 text-luxury-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Block Content */}
                <div className="p-4">
                  {block.content_type === 'text' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-luxury-500 mb-1 block">EN</label>
                        <textarea
                          value={block.content_en}
                          onChange={(e) => updateBlock(index, 'content_en', e.target.value)}
                          rows={5}
                          className={cn(inputClass, 'resize-y')}
                          placeholder="English content..."
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-luxury-500 mb-1 block">TH</label>
                        <textarea
                          value={block.content_th}
                          onChange={(e) => updateBlock(index, 'content_th', e.target.value)}
                          rows={5}
                          className={cn(inputClass, 'resize-y')}
                          placeholder="Thai content..."
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-luxury-500 mb-1 block">ZH</label>
                        <textarea
                          value={block.content_zh}
                          onChange={(e) => updateBlock(index, 'content_zh', e.target.value)}
                          rows={5}
                          className={cn(inputClass, 'resize-y')}
                          placeholder="Chinese content..."
                        />
                      </div>
                    </div>
                  )}

                  {block.content_type === 'image' && (
                    <div className="space-y-4">
                      <ImageUploader
                        images={block.image_url ? [{ url: block.image_url, sort_order: 0, is_primary: true }] : []}
                        onChange={(imgs) => handleBlockImageChange(index, imgs)}
                        folder="blog"
                        maxImages={1}
                      />
                      {block.image_url && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-medium text-luxury-500 mb-1 block">Alt (EN)</label>
                            <input
                              value={block.image_alt_en}
                              onChange={(e) => updateBlock(index, 'image_alt_en', e.target.value)}
                              className={inputClass}
                              placeholder="Image alt text (EN)"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-luxury-500 mb-1 block">Alt (TH)</label>
                            <input
                              value={block.image_alt_th}
                              onChange={(e) => updateBlock(index, 'image_alt_th', e.target.value)}
                              className={inputClass}
                              placeholder="Alt text (TH)"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-luxury-500 mb-1 block">Alt (ZH)</label>
                            <input
                              value={block.image_alt_zh}
                              onChange={(e) => updateBlock(index, 'image_alt_zh', e.target.value)}
                              className={inputClass}
                              placeholder="Alt text (ZH)"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add block buttons at the bottom */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => addBlock('text')}
                className="flex items-center gap-1.5 px-4 py-2 border border-luxury-200 text-primary-700 rounded-lg text-sm hover:bg-luxury-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Text
              </button>
              <button
                type="button"
                onClick={() => addBlock('image')}
                className="flex items-center gap-1.5 px-4 py-2 border border-luxury-200 text-primary-700 rounded-lg text-sm hover:bg-luxury-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Image
              </button>
            </div>
          </div>
        )}
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
