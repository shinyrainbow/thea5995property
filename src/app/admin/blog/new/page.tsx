'use client';

// =============================================================================
// THE A 5995 - Create Blog Post Page
// =============================================================================

import BlogPostForm from '@/components/admin/BlogPostForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateBlogPostPage() {
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
            New Blog Post
          </h1>
          <p className="text-luxury-500 mt-1">
            Create a new blog post with multilingual content
          </p>
        </div>
      </div>

      <BlogPostForm />
    </div>
  );
}
