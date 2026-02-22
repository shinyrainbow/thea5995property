'use client';

// =============================================================================
// THE A 5995 - Inquiry Table Component
// =============================================================================

import { useState } from 'react';
import { formatDate, cn } from '@/lib/utils';
import {
  Eye,
  Mail,
  MailOpen,
  MessageSquare,
  Archive,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Phone,
  ExternalLink,
} from 'lucide-react';

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

interface InquiryTableProps {
  inquiries: InquiryWithProperty[];
  total: number;
  page: number;
  totalPages: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export default function InquiryTable({
  inquiries,
  total,
  page,
  totalPages,
  perPage,
  onPageChange,
  onStatusChange,
  onDelete,
  isLoading,
}: InquiryTableProps) {
  const [viewingInquiry, setViewingInquiry] = useState<InquiryWithProperty | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const statusColors: Record<string, string> = {
    new: 'bg-red-100 text-red-700',
    read: 'bg-blue-100 text-blue-700',
    replied: 'bg-green-100 text-green-700',
    archived: 'bg-gray-100 text-gray-700',
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    await onStatusChange(id, newStatus);
    setUpdatingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-luxury-200 p-12 text-center">
        <Loader2 className="w-8 h-8 mx-auto text-secondary-400 animate-spin mb-2" />
        <p className="text-luxury-500 text-sm">Loading inquiries...</p>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-luxury-200 p-12 text-center">
        <MessageSquare className="w-12 h-12 mx-auto text-luxury-300 mb-3" />
        <p className="text-luxury-500">No inquiries found</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-luxury-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-luxury-200 bg-luxury-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-luxury-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-luxury-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-luxury-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-luxury-500 uppercase tracking-wider">
                  Status
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
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-luxury-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-primary-700 text-sm">{inquiry.name}</p>
                    {inquiry.phone && (
                      <p className="text-xs text-luxury-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {inquiry.phone}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-luxury-600">{inquiry.email}</td>
                  <td className="px-4 py-3 text-sm text-luxury-600">
                    {inquiry.property ? (
                      <span className="text-secondary-500 truncate max-w-[200px] block">
                        {inquiry.property.title_en}
                      </span>
                    ) : (
                      <span className="text-luxury-400">General</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        statusColors[inquiry.status] || statusColors.new,
                      )}
                    >
                      {inquiry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-luxury-500">
                    {formatDate(inquiry.created_at, 'en')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewingInquiry(inquiry)}
                        className="p-2 text-luxury-500 hover:text-primary-700 hover:bg-luxury-100 rounded-lg transition-colors"
                        title="View message"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {inquiry.status === 'new' && (
                        <button
                          onClick={() => handleStatusUpdate(inquiry.id, 'read')}
                          disabled={updatingId === inquiry.id}
                          className="p-2 text-luxury-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          {updatingId === inquiry.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <MailOpen className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      {(inquiry.status === 'new' || inquiry.status === 'read') && (
                        <button
                          onClick={() => handleStatusUpdate(inquiry.id, 'replied')}
                          disabled={updatingId === inquiry.id}
                          className="p-2 text-luxury-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Mark as replied"
                        >
                          {updatingId === inquiry.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Mail className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusUpdate(inquiry.id, 'archived')}
                        disabled={updatingId === inquiry.id || inquiry.status === 'archived'}
                        className="p-2 text-luxury-500 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(inquiry.id)}
                        disabled={deletingId === inquiry.id}
                        className="p-2 text-luxury-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        {deletingId === inquiry.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-luxury-200 bg-luxury-50">
            <p className="text-xs text-luxury-500">
              Showing {(page - 1) * perPage + 1} to{' '}
              {Math.min(page * perPage, total)} of {total} results
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(Math.max(1, page - 1))}
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
                      onClick={() => onPageChange(p)}
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
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-luxury-500 hover:bg-luxury-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Message Modal */}
      {viewingInquiry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-luxury-200">
              <h3 className="text-lg font-heading font-semibold text-primary-700">
                Inquiry Details
              </h3>
              <button
                onClick={() => setViewingInquiry(null)}
                className="p-2 text-luxury-400 hover:text-primary-700 hover:bg-luxury-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-luxury-500 mb-1">Name</p>
                  <p className="text-sm font-medium text-primary-700">{viewingInquiry.name}</p>
                </div>
                <div>
                  <p className="text-xs text-luxury-500 mb-1">Status</p>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      statusColors[viewingInquiry.status] || statusColors.new,
                    )}
                  >
                    {viewingInquiry.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-luxury-500 mb-1">Email</p>
                  <a
                    href={`mailto:${viewingInquiry.email}`}
                    className="text-sm text-secondary-500 hover:text-secondary-600 flex items-center gap-1"
                  >
                    {viewingInquiry.email}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div>
                  <p className="text-xs text-luxury-500 mb-1">Phone</p>
                  <p className="text-sm text-primary-700">{viewingInquiry.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-luxury-500 mb-1">Date</p>
                  <p className="text-sm text-primary-700">
                    {formatDate(viewingInquiry.created_at, 'en')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-luxury-500 mb-1">Language</p>
                  <p className="text-sm text-primary-700 uppercase">{viewingInquiry.locale}</p>
                </div>
              </div>

              {viewingInquiry.property && (
                <div>
                  <p className="text-xs text-luxury-500 mb-1">Property</p>
                  <p className="text-sm font-medium text-secondary-500">
                    {viewingInquiry.property.title_en}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-luxury-500 mb-1">Message</p>
                <div className="p-4 bg-luxury-50 rounded-lg text-sm text-primary-700 whitespace-pre-wrap">
                  {viewingInquiry.message}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                {viewingInquiry.status === 'new' && (
                  <button
                    onClick={async () => {
                      await handleStatusUpdate(viewingInquiry.id, 'read');
                      setViewingInquiry({ ...viewingInquiry, status: 'read' });
                    }}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors flex items-center gap-2"
                  >
                    <MailOpen className="w-4 h-4" />
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={async () => {
                    await handleStatusUpdate(viewingInquiry.id, 'replied');
                    setViewingInquiry({ ...viewingInquiry, status: 'replied' });
                  }}
                  className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Mark as Replied
                </button>
                <a
                  href={`mailto:${viewingInquiry.email}?subject=RE: THE A 5995 Inquiry`}
                  className="px-4 py-2 bg-primary-700 text-white rounded-lg text-sm hover:bg-primary-800 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Reply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
