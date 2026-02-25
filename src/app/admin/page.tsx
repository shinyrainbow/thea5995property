// =============================================================================
// THE A 5995 - Admin Dashboard Page
// =============================================================================

import { createServerClient } from '@/lib/supabase';
import DashboardContent from '@/components/admin/DashboardContent';

async function getDashboardData() {
  try {
    const supabase = createServerClient();

    // Fetch counts in parallel
    const [
      propertiesResult,
      activeResult,
      inquiriesResult,
      newInquiriesResult,
      recentInquiriesResult,
      recentPropertiesResult,
    ] = await Promise.all([
      supabase.from('properties').select('id', { count: 'exact', head: true }),
      supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase.from('inquiries').select('id', { count: 'exact', head: true }),
      supabase
        .from('inquiries')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),
      supabase
        .from('inquiries')
        .select('*, property:properties(id, title_en)')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('properties')
        .select('id, title_en, price, status, transaction_type, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    return {
      totalProperties: propertiesResult.count ?? 0,
      activeListings: activeResult.count ?? 0,
      totalInquiries: inquiriesResult.count ?? 0,
      newInquiries: newInquiriesResult.count ?? 0,
      recentInquiries: recentInquiriesResult.data ?? [],
      recentProperties: recentPropertiesResult.data ?? [],
    };
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return {
      totalProperties: 0,
      activeListings: 0,
      totalInquiries: 0,
      newInquiries: 0,
      recentInquiries: [],
      recentProperties: [],
    };
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  return (
    <DashboardContent
      totalProperties={data.totalProperties}
      activeListings={data.activeListings}
      totalInquiries={data.totalInquiries}
      newInquiries={data.newInquiries}
      recentInquiries={data.recentInquiries}
      recentProperties={data.recentProperties}
    />
  );
}
