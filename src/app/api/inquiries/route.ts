// =============================================================================
// THE A 5995 - Inquiries API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { inquirySchema } from '@/lib/validations';
import type { PaginatedResponse, Inquiry } from '@/types';

// ---------------------------------------------------------------------------
// GET /api/inquiries - List inquiries (admin only, with pagination)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = Math.min(parseInt(searchParams.get('perPage') || '20', 10), 100);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const supabase = createServerClient();

    let query = supabase
      .from('inquiries')
      .select('*, property:properties(id, title_en, slug_en)', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,message.ilike.%${search}%`,
      );
    }

    query = query.order('created_at', { ascending: false });

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Inquiries query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch inquiries' },
        { status: 500 },
      );
    }

    const total = count ?? 0;
    const response: PaginatedResponse<Inquiry> = {
      data: (data as unknown as Inquiry[]) ?? [],
      total,
      page,
      per_page: perPage,
      total_pages: Math.ceil(total / perPage),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Inquiries GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/inquiries - Create a new inquiry (public)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const validation = inquirySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const data = validation.data;
    const supabase = createServerClient();

    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert({
        property_id: data.property_id || null,
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        message: data.message,
        locale: data.locale,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      console.error('Inquiry insert error:', error);
      return NextResponse.json(
        { error: 'Failed to submit inquiry' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, data: inquiry },
      { status: 201 },
    );
  } catch (error) {
    console.error('Inquiries POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
