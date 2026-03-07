import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { changePasswordSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    // Verify the user is authenticated
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid input';
      return NextResponse.json(
        { error: firstError },
        { status: 400 },
      );
    }

    const { currentPassword, newPassword } = parsed.data;
    const supabase = createServerClient();

    // Fetch the current password hash
    const { data: user, error: fetchError } = await supabase
      .from('admin_users')
      .select('password_hash')
      .eq('id', session.user.id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 },
      );
    }

    // Hash the new password and update
    const newHash = await bcrypt.hash(newPassword, 12);
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ password_hash: newHash })
      .eq('id', session.user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: 'Password changed successfully' });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
