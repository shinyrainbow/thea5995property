// =============================================================================
// THE A 5995 - Homepage Sections API
// =============================================================================

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';

// GET /api/homepage-sections — fetch all homepage sections ordered by sort_order
export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('Failed to fetch homepage sections:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch homepage sections' },
      { status: 500 },
    );
  }
}

// PUT /api/homepage-sections — update section visibility and order
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sections } = body as {
      sections: Array<{ id: number; is_active: boolean; sort_order: number }>;
    };

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 },
      );
    }

    const supabase = createServerClient();

    // Update each section
    for (const section of sections) {
      const { error } = await supabase
        .from('homepage_sections')
        .update({
          is_active: section.is_active,
          sort_order: section.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq('id', section.id);

      if (error) {
        console.error(`Failed to update section ${section.id}:`, error);
        throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to update homepage sections:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update homepage sections' },
      { status: 500 },
    );
  }
}
