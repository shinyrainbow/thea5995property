'use client';

// =============================================================================
// THE A 5995 - Dashboard Stats Component
// =============================================================================

import { Building2, Home, MessageSquare, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'red';
  change?: string;
}

interface DashboardStatsProps {
  totalProperties: number;
  activeListings: number;
  totalInquiries: number;
  newInquiries: number;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-100',
  },
  green: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  yellow: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    border: 'border-amber-100',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-100',
  },
};

export default function DashboardStats({
  totalProperties,
  activeListings,
  totalInquiries,
  newInquiries,
}: DashboardStatsProps) {
  const stats: StatCard[] = [
    {
      label: 'Total Properties',
      value: totalProperties,
      icon: Building2,
      color: 'blue',
    },
    {
      label: 'Active Listings',
      value: activeListings,
      icon: Home,
      color: 'green',
    },
    {
      label: 'Total Inquiries',
      value: totalInquiries,
      icon: MessageSquare,
      color: 'yellow',
    },
    {
      label: 'New Inquiries',
      value: newInquiries,
      icon: AlertCircle,
      color: 'red',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const colors = colorClasses[stat.color];
        return (
          <div
            key={stat.label}
            className={cn(
              'bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow',
              colors.border,
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-luxury-500">{stat.label}</p>
                <p className="text-3xl font-bold text-primary-700 mt-1">
                  {typeof stat.value === 'number'
                    ? stat.value.toLocaleString()
                    : stat.value}
                </p>
              </div>
              <div className={cn('p-3 rounded-xl', colors.bg)}>
                <Icon className={cn('w-6 h-6', colors.icon)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
