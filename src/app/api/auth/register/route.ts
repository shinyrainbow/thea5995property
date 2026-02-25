import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerClient } from '@/lib/supabase';
import { registerSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { name, email, password } = validation.data;
    const supabase = createServerClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 },
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert new admin user
    const { error } = await supabase.from('admin_users').insert({
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      name: name.trim(),
      role: 'admin',
    });

    if (error) {
      console.error('Register insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: 'Account created successfully' },
      { status: 201 },
    );
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
