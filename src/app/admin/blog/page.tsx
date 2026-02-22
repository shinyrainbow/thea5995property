'use client';

// =============================================================================
// THE A 5995 - Admin Blog Post List Page
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatDate, cn } from '@/lib/utils';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
} from 'lucide-react';

interface BlogPostListItem {
  id: string;
  title_en: string;
  status: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    name: string;
  };
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const perPage = 10;

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: perPage.toString(),
      });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/blog?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.data || []);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setDeleteId(null);
        fetchPosts();
      }
    } catch (error) {
      console.error('Failed to delete blog post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary-700 flex items-center gap-2">
            <FileText className="w-7 h-7 text-secondary-400" />
            Blog Posts
          </h1>
          <p className="text-luxury-500 mt-1">{total} posts total</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Blog Post
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-luxury-200 p-4 flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blog posts..."
              className="w-full pl-10 pr-4 py-2 border border-luxury-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-luxury-100 text-primary-700 rounded-lg text-sm hover:bg-luxury-200 transition-colors"
          >
            Search
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-luxury-200 rounded-lg text-sm text-primary-700 focus:outline-none focus:ring-2 focus:ring-secondary-400"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-luxury-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto text-secondary-400 animate-spin mb-2" />
            <p className="text-luxury-500 text-sm">Loading blog posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-luxury-300 mb-3" />
            <p className="text-luxury-500">No blog posts found</p>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-2 mt-4 text-secondary-500 hover:text-secondary-600 text-sm"
            >
              <Plus className="w-4 h-4" />
              Write your first post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-luxury-200 bg-luxury-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-luxury-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-luxury-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-luxury-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-luxury-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-luxury-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-luxury-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-primary-700 text-sm line-clamp-1">
                        {post.title_en}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          post.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700',
                        )}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-luxury-600">
                      {post.author?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-xs text-luxury-500">
                      {formatDate(post.created_at, 'en')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="p-2 text-luxury-500 hover:text-primary-700 hover:bg-luxury-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(post.id)}
                          className="p-2 text-luxury-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-luxury-200 bg-luxury-50">
            <p className="text-xs text-luxury-500">
              Showing {(page - 1) * perPage + 1} to{' '}
              {Math.min(page * perPage, total)} of {total} results
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-luxury-500 hover:bg-luxury-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-luxury-400">...</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={cn(
                        'px-3 py-1 rounded-lg text-sm transition-colors',
                        p === page
                          ? 'bg-primary-700 text-white'
                          : 'text-luxury-600 hover:bg-luxury-200',
                      )}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-luxury-500 hover:bg-luxury-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-heading font-semibold text-primary-700 mb-2">
              Delete Blog Post
            </h3>
            <p className="text-luxury-500 text-sm mb-6">
              Are you sure you want to delete this blog post? This action cannot be undone.
              All associated content blocks will also be deleted.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-luxury-200 rounded-lg text-sm text-luxury-600 hover:bg-luxury-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:bg-red-400 transition-colors flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
