// =============================================================================
// THE A 5995 - NextAuth v5 Configuration
// =============================================================================

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { createServerClient } from '@/lib/supabase';

import type { AdminRole } from '@/types';

// ---------------------------------------------------------------------------
// Extend the default NextAuth types to include our custom fields
// ---------------------------------------------------------------------------

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: AdminRole;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
  }
}

// ---------------------------------------------------------------------------
// NextAuth initialization
// ---------------------------------------------------------------------------

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Use JWT strategy (no database adapter for sessions)
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },

  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (
          !email ||
          !password ||
          typeof email !== 'string' ||
          typeof password !== 'string'
        ) {
          return null;
        }

        try {
          const supabase = createServerClient();

          // Query the admin_users table (includes hashed password)
          const { data: user, error } = await supabase
            .from('admin_users')
            .select('id, email, name, role, password_hash')
            .eq('email', email.toLowerCase().trim())
            .single();

          if (error || !user) {
            return null;
          }

          // Verify password against bcrypt hash
          const isValid = await bcrypt.compare(password, user.password_hash);

          if (!isValid) {
            return null;
          }

          // Return the user object (without the password hash)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as AdminRole,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    /**
     * JWT callback - runs when a JWT is created or updated.
     * Persist custom fields (id, role) into the token.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.email = user.email as string;
        token.name = user.name as string;
        token.role = user.role as AdminRole;
      }
      return token;
    },

    /**
     * Session callback - runs when a session is checked.
     * Expose custom fields from the JWT to the client session.
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
      }
      return session;
    },

    /**
     * Authorized callback - used by middleware to check auth.
     * We handle admin protection manually in middleware.ts so
     * we simply return true here to allow the request through.
     */
    authorized({ auth: session }) {
      return !!session;
    },
  },
});
