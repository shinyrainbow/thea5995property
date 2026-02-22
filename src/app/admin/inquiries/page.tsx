'use client';

// =============================================================================
// THE A 5995 - Admin Inquiries Page
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import InquiryTable from '@/components/admin/InquiryTable';
import { Search, MessageSquare } from 'lucide-react';

interface InquiryWithProperty {
  id: string;
  property_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  locale: string;
  created_at: string;
  property?: {
    id: string;
    title_en: string;
    slug_en: string;
  };
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryWithProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const perPage = 20;

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: perPage.toString(),
      });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/inquiries?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInquiries(data.data || []);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        // Update local state
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === id ? { ...inq, status } : inq)),
        );
      }
    } catch (error) {
      console.error('Failed to update inquiry status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchInquiries();
      }
    } catch (error) {
      console.error('Failed to delete inquiry:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInquiries();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-primary-700 flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-secondary-400" />
          Inquiries
        </h1>
        <p className="text-luxury-500 mt-1">{total} inquiries total</p>
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
              placeholder="Search by name or email..."
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
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <InquiryTable
        inquiries={inquiries}
        total={total}
        page={page}
        totalPages={totalPages}
        perPage={perPage}
        onPageChange={setPage}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
}
