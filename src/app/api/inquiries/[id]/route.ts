// =============================================================================
// THE A 5995 - Single Inquiry API Route
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// PUT /api/inquiries/[id] - Update inquiry status (admin only)
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const validStatuses = ['new', 'read', 'replied', 'archived'];
    if (!body.status || !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: new, read, replied, archived' },
        { status: 400 },
      );
    }

    const supabase = createServerClient();

    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .update({ status: body.status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Inquiry update error:', error);
      return NextResponse.json(
        { error: 'Failed to update inquiry' },
        { status: 500 },
      );
    }

    if (!inquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: inquiry });
  } catch (error) {
    console.error('Inquiry PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/inquiries/[id] - Delete an inquiry (admin only)
// ---------------------------------------------------------------------------

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createServerClient();

    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Inquiry delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete inquiry' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: 'Inquiry deleted' });
  } catch (error) {
    console.error('Inquiry DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
