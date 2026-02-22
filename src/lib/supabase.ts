// =============================================================================
// THE A 5995 - Supabase Client Configuration
// =============================================================================

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Environment variables
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ---------------------------------------------------------------------------
// Browser client (uses the public anon key, respects RLS)
// ---------------------------------------------------------------------------

/**
 * Supabase client for use in **browser / client components**.
 *
 * Uses the anonymous (public) key so all requests are scoped to the
 * Row-Level Security policies defined in the database.
 */
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// ---------------------------------------------------------------------------
// Server client (uses the service role key, bypasses RLS)
// ---------------------------------------------------------------------------

/**
 * Create a Supabase client for use in **server-side contexts** such as
 * Server Components, Route Handlers, Server Actions, and middleware.
 *
 * Uses the service-role key which bypasses Row-Level Security. This must
 * **never** be exposed to the browser.
 */
export function createServerClient() {
  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// ---------------------------------------------------------------------------
// Convenience re-export
// ---------------------------------------------------------------------------

export { createSupabaseClient };
