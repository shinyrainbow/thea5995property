'use client';

// =============================================================================
// THE A 5995 - Edit Blog Post Page
// =============================================================================

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BlogPostForm from '@/components/admin/BlogPostForm';
import type { BlogPostWithContent } from '@/types';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function EditBlogPostPage() {
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<BlogPostWithContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/blog/${id}`);
        if (!response.ok) {
          setError('Blog post not found');
          return;
        }
        const data = await response.json();
        setPost(data.data);
      } catch (err) {
        setError('Failed to load blog post');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-secondary-400 animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-3" />
        <p className="text-red-600 font-medium">{error || 'Blog post not found'}</p>
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-2 mt-4 text-secondary-500 hover:text-secondary-600 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog Posts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/blog"
          className="p-2 text-luxury-500 hover:text-primary-700 hover:bg-luxury-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary-700">
            Edit Blog Post
          </h1>
          <p className="text-luxury-500 mt-1">{post.title_en}</p>
        </div>
      </div>

      <BlogPostForm post={post} />
    </div>
  );
}
