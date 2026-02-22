// =============================================================================
// THE A 5995 - Property Types API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// GET /api/property-types - List all property types
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest) {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('property_types')
      .select('*')
      .order('name_en', { ascending: true });

    if (error) {
      console.error('Property types query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch property types' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (error) {
    console.error('Property types GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
