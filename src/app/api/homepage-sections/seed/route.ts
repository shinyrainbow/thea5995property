// =============================================================================
// THE A 5995 - Seed Homepage Sections
// =============================================================================

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';

const DEFAULT_SECTIONS = [
  { section_type: 'hero', title_en: 'Hero Banner', title_th: 'แบนเนอร์หลัก', title_zh: '主横幅', is_active: true, sort_order: 0 },
  { section_type: 'featured_properties', title_en: 'Featured Properties', title_th: 'อสังหาริมทรัพย์แนะนำ', title_zh: '精选房产', is_active: true, sort_order: 1 },
  { section_type: 'about', title_en: 'About Section', title_th: 'เกี่ยวกับเรา', title_zh: '关于我们', is_active: true, sort_order: 2 },
  { section_type: 'services', title_en: 'Services', title_th: 'บริการ', title_zh: '服务', is_active: false, sort_order: 3 },
  { section_type: 'testimonials', title_en: 'Testimonials', title_th: 'รีวิวลูกค้า', title_zh: '客户评价', is_active: false, sort_order: 4 },
  { section_type: 'cta', title_en: 'Call to Action', title_th: 'คำกระตุ้นการทำงาน', title_zh: '行动号召', is_active: true, sort_order: 5 },
  { section_type: 'stats', title_en: 'Statistics', title_th: 'สถิติ', title_zh: '统计数据', is_active: false, sort_order: 6 },
  { section_type: 'partners', title_en: 'Partners', title_th: 'พันธมิตร', title_zh: '合作伙伴', is_active: false, sort_order: 7 },
];

export async function POST() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    // Check if sections already exist
    const { data: existing } = await supabase
      .from('homepage_sections')
      .select('id')
      .limit(1);

    if (existing && existing.length > 0) {
      // Already seeded, just return existing
      const { data } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('sort_order', { ascending: true });

      return NextResponse.json({ success: true, data });
    }

    // Insert defaults
    const { data, error } = await supabase
      .from('homepage_sections')
      .insert(DEFAULT_SECTIONS)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Failed to seed homepage sections:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to seed homepage sections' },
      { status: 500 },
    );
  }
}
