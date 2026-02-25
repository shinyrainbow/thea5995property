'use client';

// =============================================================================
// THE A 5995 - Dashboard Content (Client Component with translations)
// =============================================================================

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import DashboardStats from '@/components/admin/DashboardStats';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  Plus,
  ArrowRight,
  Building2,
  MessageSquare,
  FileText,
} from 'lucide-react';

interface DashboardContentProps {
  totalProperties: number;
  activeListings: number;
  totalInquiries: number;
  newInquiries: number;
  recentInquiries: Record<string, unknown>[];
  recentProperties: Record<string, unknown>[];
}

export default function DashboardContent({
  totalProperties,
  activeListings,
  totalInquiries,
  newInquiries,
  recentInquiries,
  recentProperties,
}: DashboardContentProps) {
  const t = useTranslations('admin');
  const locale = useLocale();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary-700">
            {t('dashboard')}
          </h1>
          <p className="text-luxury-500 mt-1">
            {t('dashboardWelcome')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats
        totalProperties={totalProperties}
        activeListings={activeListings}
        totalInquiries={totalInquiries}
        newInquiries={newInquiries}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/properties/new"
          className="flex items-center gap-3 p-4 bg-primary-700 text-white rounded-xl hover:bg-primary-800 transition-colors shadow-sm"
        >
          <div className="p-2 bg-white/10 rounded-lg">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium">{t('addProperty')}</p>
            <p className="text-primary-200 text-xs">{t('createNewListing')}</p>
          </div>
        </Link>

        <Link
          href="/admin/inquiries"
          className="flex items-center gap-3 p-4 bg-white border border-luxury-200 rounded-xl hover:border-secondary-400 transition-colors shadow-sm"
        >
          <div className="p-2 bg-amber-50 rounded-lg">
            <MessageSquare className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-primary-700">{t('viewInquiries')}</p>
            <p className="text-luxury-500 text-xs">{t('newMessagesCount', { count: newInquiries })}</p>
          </div>
        </Link>

        <Link
          href="/admin/blog/new"
          className="flex items-center gap-3 p-4 bg-white border border-luxury-200 rounded-xl hover:border-secondary-400 transition-colors shadow-sm"
        >
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-primary-700">{t('writeBlogPost')}</p>
            <p className="text-luxury-500 text-xs">{t('createNewContent')}</p>
          </div>
        </Link>
      </div>

      {/* Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <div className="bg-white rounded-xl border border-luxury-200 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-luxury-100">
            <h3 className="font-heading font-semibold text-primary-700 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-secondary-400" />
              {t('recentInquiries')}
            </h3>
            <Link
              href="/admin/inquiries"
              className="text-sm text-secondary-500 hover:text-secondary-600 flex items-center gap-1"
            >
              {t('viewAllLink')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-luxury-100">
            {recentInquiries.length === 0 ? (
              <div className="p-8 text-center text-luxury-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>{t('noInquiriesYet')}</p>
              </div>
            ) : (
              recentInquiries.map((inquiry) => (
                <div key={inquiry.id as string} className="p-4 hover:bg-luxury-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-primary-700 text-sm">
                        {inquiry.name as string}
                      </p>
                      <p className="text-xs text-luxury-500">{inquiry.email as string}</p>
                      {inquiry.property ? (
                        <p className="text-xs text-secondary-500 mt-1">
                          Re: {(inquiry.property as Record<string, string>).title_en}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          inquiry.status === 'new'
                            ? 'bg-red-100 text-red-700'
                            : inquiry.status === 'read'
                              ? 'bg-blue-100 text-blue-700'
                              : inquiry.status === 'replied'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {inquiry.status as string}
                      </span>
                      <span className="text-xs text-luxury-400">
                        {formatDate(inquiry.created_at as string, locale)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Properties */}
        <div className="bg-white rounded-xl border border-luxury-200 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-luxury-100">
            <h3 className="font-heading font-semibold text-primary-700 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-secondary-400" />
              {t('recentProperties')}
            </h3>
            <Link
              href="/admin/properties"
              className="text-sm text-secondary-500 hover:text-secondary-600 flex items-center gap-1"
            >
              {t('viewAllLink')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-luxury-100">
            {recentProperties.length === 0 ? (
              <div className="p-8 text-center text-luxury-400">
                <Building2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>{t('noPropertiesYet')}</p>
              </div>
            ) : (
              recentProperties.map((property) => (
                <Link
                  key={property.id as string}
                  href={`/admin/properties/${property.id}/edit`}
                  className="block p-4 hover:bg-luxury-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-primary-700 text-sm">
                        {property.title_en as string}
                      </p>
                      <p className="text-xs text-luxury-500 mt-0.5">
                        {formatPrice(property.price as number, locale)} &middot;{' '}
                        {property.transaction_type === 'sale' ? t('forSale') : t('forRent')}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        property.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : property.status === 'draft'
                            ? 'bg-gray-100 text-gray-700'
                            : property.status === 'sold'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {property.status as string}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
