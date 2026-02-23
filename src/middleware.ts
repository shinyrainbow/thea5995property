// =============================================================================
// THE A 5995 - Combined Middleware
// =============================================================================
// Handles:
//  1. next-intl locale routing (prefix detection, redirects, rewrites)
//  2. Admin route protection (redirect unauthenticated users to /admin/login)
// =============================================================================

import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

// ---------------------------------------------------------------------------
// next-intl middleware instance
// ---------------------------------------------------------------------------

const intlMiddleware = createMiddleware(routing);

// ---------------------------------------------------------------------------
// Auth session cookie name used by NextAuth v5
// ---------------------------------------------------------------------------

const AUTH_COOKIE_NAME = 'authjs.session-token';
const SECURE_AUTH_COOKIE_NAME = '__Secure-authjs.session-token';

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

/**
 * Strip the locale prefix from a pathname so we can match against route
 * patterns regardless of the active locale.
 */
function stripLocalePrefix(pathname: string): string {
  const localePattern = /^\/(en|th|zh)(\/|$)/;
  return pathname.replace(localePattern, '/');
}

/**
 * Check whether a pathname (with locale stripped) falls under the admin
 * section but is NOT the login page itself.
 */
function isProtectedAdminRoute(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname);
  // The login page is public
  if (stripped === '/admin/login') return false;
  // Everything else under /admin is protected
  return stripped.startsWith('/admin');
}

// ---------------------------------------------------------------------------
// Combined middleware
// ---------------------------------------------------------------------------

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ------------------------------------------------------------------
  // 1. Admin routes — skip intl middleware entirely
  // ------------------------------------------------------------------
  if (pathname.startsWith('/admin')) {
    // Protect all admin routes except the login page
    if (isProtectedAdminRoute(pathname)) {
      const sessionToken =
        request.cookies.get(SECURE_AUTH_COOKIE_NAME)?.value ??
        request.cookies.get(AUTH_COOKIE_NAME)?.value;

      if (!sessionToken) {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Let Next.js handle admin routes directly (no locale rewriting)
    return NextResponse.next();
  }

  // ------------------------------------------------------------------
  // 2. Public routes — next-intl locale routing
  // ------------------------------------------------------------------
  return intlMiddleware(request);
}

// ---------------------------------------------------------------------------
// Matcher configuration
// ---------------------------------------------------------------------------
// Apply middleware to all routes except:
//  - API routes (handled by Route Handlers / NextAuth)
//  - Static files and Next.js internals
//  - Public assets
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    // Match all pathnames except for:
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - Static files with extensions (e.g. /favicon.ico, /image.png)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
