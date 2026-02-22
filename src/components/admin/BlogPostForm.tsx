'use client';

// =============================================================================
// THE A 5995 - Blog Post Form Component
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
  GripVertical,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Type,
  Image as ImageIcon,
  Quote,
  Heading,
  LayoutGrid,
  Eye,
  EyeOff,
  Globe,
  Search,
} from 'lucide-react';
import type { BlogPostWithContent, BlogContent, BlogContentType } from '@/types';

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

const blockTypeLabels: Record<BlogContentType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  text: { label: 'Text', icon: Type },
  image: { label: 'Image', icon: ImageIcon },
  gallery: { label: 'Gallery', icon: LayoutGrid },
  quote: { label: 'Quote', icon: Quote },
  heading: { label: 'Heading', icon: Heading },
};

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
// Tabs
// ---------------------------------------------------------------------------

type FormTab = 'content_en' | 'content_th' | 'content_zh' | 'blocks' | 'seo';

interface Tab {
  key: FormTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const formTabs: Tab[] = [
  { key: 'content_en', label: 'English', icon: Globe },
  { key: 'content_th', label: 'Thai', icon: Globe },
  { key: 'content_zh', label: 'Chinese', icon: Globe },
  { key: 'blocks', label: 'Content Blocks', icon: LayoutGrid },
  { key: 'seo', label: 'SEO', icon: Search },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface BlogPostFormProps {
  post?: BlogPostWithContent;
}

export default function BlogPostForm({ post }: BlogPostFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FormTab>('content_en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [blockTypeToAdd, setBlockTypeToAdd] = useState<BlogContentType>('text');

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
  const addBlock = () => {
    setBlocks([...blocks, emptyBlock(blocks.length, blockTypeToAdd)]);
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

  const onSubmit = async (data: BlogPostSchemaType) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Save the blog post
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
      if (postId && blocks.length > 0) {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Status toggle */}
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

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 text-sm text-luxury-500 hover:text-primary-700 transition-colors"
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-luxury-200 overflow-hidden">
        <div className="border-b border-luxury-200 overflow-x-auto">
          <div className="flex min-w-max">
            {formTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap',
                    activeTab === tab.key
                      ? 'border-secondary-400 text-secondary-500 bg-secondary-50/50'
                      : 'border-transparent text-luxury-500 hover:text-primary-700 hover:bg-luxury-50',
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* English Content */}
          {activeTab === 'content_en' && (
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Title (English) *</label>
                <input
                  {...register('title_en')}
                  className={inputClass}
                  placeholder="Enter blog post title"
                />
                {errors.title_en && <p className={errorMsgClass}>{errors.title_en.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Excerpt (English)</label>
                <textarea
                  {...register('excerpt_en')}
                  rows={3}
                  className={cn(inputClass, 'resize-y')}
                  placeholder="Brief summary of the post..."
                />
              </div>
              <div>
                <label className={labelClass}>Featured Image</label>
                <ImageUploader
                  images={featuredImages}
                  onChange={handleFeaturedImageChange}
                  folder="blog"
                  maxImages={1}
                />
              </div>
            </div>
          )}

          {/* Thai Content */}
          {activeTab === 'content_th' && (
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Title (Thai) *</label>
                <input
                  {...register('title_th')}
                  className={inputClass}
                  placeholder="Enter Thai title"
                />
                {errors.title_th && <p className={errorMsgClass}>{errors.title_th.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Excerpt (Thai)</label>
                <textarea
                  {...register('excerpt_th')}
                  rows={3}
                  className={cn(inputClass, 'resize-y')}
                  placeholder="Enter Thai excerpt"
                />
              </div>
            </div>
          )}

          {/* Chinese Content */}
          {activeTab === 'content_zh' && (
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Title (Chinese) *</label>
                <input
                  {...register('title_zh')}
                  className={inputClass}
                  placeholder="Enter Chinese title"
                />
                {errors.title_zh && <p className={errorMsgClass}>{errors.title_zh.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Excerpt (Chinese)</label>
                <textarea
                  {...register('excerpt_zh')}
                  rows={3}
                  className={cn(inputClass, 'resize-y')}
                  placeholder="Enter Chinese excerpt"
                />
              </div>
            </div>
          )}

          {/* Content Blocks */}
          {activeTab === 'blocks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-primary-700">
                  Content Blocks ({blocks.length})
                </h3>
                <div className="flex items-center gap-2">
                  <select
                    value={blockTypeToAdd}
                    onChange={(e) => setBlockTypeToAdd(e.target.value as BlogContentType)}
                    className="px-3 py-1.5 border border-luxury-200 rounded-lg text-sm text-primary-700 focus:outline-none focus:ring-2 focus:ring-secondary-400"
                  >
                    {Object.entries(blockTypeLabels).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addBlock}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary-700 text-white rounded-lg text-sm hover:bg-primary-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Block
                  </button>
                </div>
              </div>

              {blocks.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-luxury-300 rounded-xl">
                  <LayoutGrid className="w-10 h-10 mx-auto text-luxury-300 mb-2" />
                  <p className="text-luxury-500 text-sm">No content blocks yet</p>
                  <p className="text-luxury-400 text-xs mt-1">
                    Add blocks to build your blog post content
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {blocks.map((block, index) => {
                    const TypeInfo = blockTypeLabels[block.content_type];
                    const TypeIcon = TypeInfo.icon;

                    return (
                      <div
                        key={index}
                        className="border border-luxury-200 rounded-xl overflow-hidden"
                      >
                        {/* Block Header */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-luxury-50 border-b border-luxury-200">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-luxury-400 cursor-grab" />
                            <TypeIcon className="w-4 h-4 text-secondary-500" />
                            <span className="text-sm font-medium text-primary-700">
                              {TypeInfo.label} Block
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
                        <div className="p-4 space-y-4">
                          {/* Type selector */}
                          <div>
                            <label className="text-xs font-medium text-luxury-500">Block Type</label>
                            <select
                              value={block.content_type}
                              onChange={(e) =>
                                updateBlock(index, 'content_type', e.target.value)
                              }
                              className="ml-2 px-2 py-1 border border-luxury-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-secondary-400"
                            >
                              {Object.entries(blockTypeLabels).map(([key, val]) => (
                                <option key={key} value={key}>
                                  {val.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Content fields based on block type */}
                          {(block.content_type === 'text' ||
                            block.content_type === 'quote' ||
                            block.content_type === 'heading') && (
                            <div className="grid grid-cols-1 gap-3">
                              <div>
                                <label className="text-xs font-medium text-luxury-500">
                                  Content (EN)
                                </label>
                                {block.content_type === 'heading' ? (
                                  <input
                                    value={block.content_en}
                                    onChange={(e) =>
                                      updateBlock(index, 'content_en', e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="English content"
                                  />
                                ) : (
                                  <textarea
                                    value={block.content_en}
                                    onChange={(e) =>
                                      updateBlock(index, 'content_en', e.target.value)
                                    }
                                    rows={block.content_type === 'quote' ? 3 : 4}
                                    className={cn(
                                      inputClass,
                                      'resize-y',
                                      block.content_type === 'quote' && 'italic border-l-4 border-l-secondary-400',
                                    )}
                                    placeholder="English content"
                                  />
                                )}
                              </div>
                              <div>
                                <label className="text-xs font-medium text-luxury-500">
                                  Content (TH)
                                </label>
                                {block.content_type === 'heading' ? (
                                  <input
                                    value={block.content_th}
                                    onChange={(e) =>
                                      updateBlock(index, 'content_th', e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="Thai content"
                                  />
                                ) : (
                                  <textarea
                                    value={block.content_th}
                                    onChange={(e) =>
                                      updateBlock(index, 'content_th', e.target.value)
                                    }
                                    rows={block.content_type === 'quote' ? 3 : 4}
                                    className={cn(inputClass, 'resize-y')}
                                    placeholder="Thai content"
                                  />
                                )}
                              </div>
                              <div>
                                <label className="text-xs font-medium text-luxury-500">
                                  Content (ZH)
                                </label>
                                {block.content_type === 'heading' ? (
                                  <input
                                    value={block.content_zh}
                                    onChange={(e) =>
                                      updateBlock(index, 'content_zh', e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="Chinese content"
                                  />
                                ) : (
                                  <textarea
                                    value={block.content_zh}
                                    onChange={(e) =>
                                      updateBlock(index, 'content_zh', e.target.value)
                                    }
                                    rows={block.content_type === 'quote' ? 3 : 4}
                                    className={cn(inputClass, 'resize-y')}
                                    placeholder="Chinese content"
                                  />
                                )}
                              </div>
                            </div>
                          )}

                          {(block.content_type === 'image' || block.content_type === 'gallery') && (
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-luxury-500">
                                  Image URL
                                </label>
                                <input
                                  value={block.image_url}
                                  onChange={(e) =>
                                    updateBlock(index, 'image_url', e.target.value)
                                  }
                                  className={inputClass}
                                  placeholder="https://..."
                                />
                              </div>
                              {block.image_url && (
                                <div className="w-40 h-28 bg-luxury-100 rounded-lg overflow-hidden">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={block.image_url}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="text-xs font-medium text-luxury-500">
                                    Alt (EN)
                                  </label>
                                  <input
                                    value={block.image_alt_en}
                                    onChange={(e) =>
                                      updateBlock(index, 'image_alt_en', e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="Alt text (EN)"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-luxury-500">
                                    Alt (TH)
                                  </label>
                                  <input
                                    value={block.image_alt_th}
                                    onChange={(e) =>
                                      updateBlock(index, 'image_alt_th', e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="Alt text (TH)"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-luxury-500">
                                    Alt (ZH)
                                  </label>
                                  <input
                                    value={block.image_alt_zh}
                                    onChange={(e) =>
                                      updateBlock(index, 'image_alt_zh', e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="Alt text (ZH)"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="space-y-5">
                <h4 className="text-sm font-semibold text-primary-700 uppercase tracking-wider">
                  English SEO
                </h4>
                <div>
                  <label className={labelClass}>Meta Title (EN)</label>
                  <input
                    {...register('seo_title_en')}
                    className={inputClass}
                    placeholder="SEO title for English"
                  />
                </div>
                <div>
                  <label className={labelClass}>Meta Description (EN)</label>
                  <textarea
                    {...register('seo_description_en')}
                    rows={3}
                    className={cn(inputClass, 'resize-y')}
                    placeholder="SEO description for English"
                  />
                </div>
              </div>

              <hr className="border-luxury-200" />

              <div className="space-y-5">
                <h4 className="text-sm font-semibold text-primary-700 uppercase tracking-wider">
                  Thai SEO
                </h4>
                <div>
                  <label className={labelClass}>Meta Title (TH)</label>
                  <input
                    {...register('seo_title_th')}
                    className={inputClass}
                    placeholder="SEO title for Thai"
                  />
                </div>
                <div>
                  <label className={labelClass}>Meta Description (TH)</label>
                  <textarea
                    {...register('seo_description_th')}
                    rows={3}
                    className={cn(inputClass, 'resize-y')}
                    placeholder="SEO description for Thai"
                  />
                </div>
              </div>

              <hr className="border-luxury-200" />

              <div className="space-y-5">
                <h4 className="text-sm font-semibold text-primary-700 uppercase tracking-wider">
                  Chinese SEO
                </h4>
                <div>
                  <label className={labelClass}>Meta Title (ZH)</label>
                  <input
                    {...register('seo_title_zh')}
                    className={inputClass}
                    placeholder="SEO title for Chinese"
                  />
                </div>
                <div>
                  <label className={labelClass}>Meta Description (ZH)</label>
                  <textarea
                    {...register('seo_description_zh')}
                    rows={3}
                    className={cn(inputClass, 'resize-y')}
                    placeholder="SEO description for Chinese"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="bg-white rounded-xl border border-luxury-200 p-6">
          <h3 className="text-lg font-heading font-semibold text-primary-700 mb-4">
            Preview (English)
          </h3>
          <div className="prose max-w-none">
            <h1 className="font-heading">{watch('title_en') || 'Untitled'}</h1>
            {watch('excerpt_en') && (
              <p className="text-luxury-500 italic">{watch('excerpt_en')}</p>
            )}
            {featuredImages[0] && (
              <div className="rounded-lg overflow-hidden my-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredImages[0].url}
                  alt="Featured"
                  className="w-full max-h-80 object-cover"
                />
              </div>
            )}
            {blocks.map((block, index) => (
              <div key={index} className="my-4">
                {block.content_type === 'heading' && (
                  <h2 className="font-heading text-xl font-semibold">
                    {block.content_en || 'Heading'}
                  </h2>
                )}
                {block.content_type === 'text' && (
                  <p className="whitespace-pre-wrap">{block.content_en}</p>
                )}
                {block.content_type === 'quote' && (
                  <blockquote className="border-l-4 border-secondary-400 pl-4 italic text-luxury-600">
                    {block.content_en}
                  </blockquote>
                )}
                {block.content_type === 'image' && block.image_url && (
                  <div className="rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={block.image_url}
                      alt={block.image_alt_en || 'Blog image'}
                      className="w-full object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
