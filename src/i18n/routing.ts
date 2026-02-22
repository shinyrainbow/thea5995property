// =============================================================================
// THE A 5995 - next-intl Routing Configuration
// =============================================================================

import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

// ---------------------------------------------------------------------------
// Routing definition
// ---------------------------------------------------------------------------

export const routing = defineRouting({
  locales: ['en', 'th', 'zh'] as const,
  defaultLocale: 'en',
  localePrefix: 'as-needed', // Only prefix non-default locales in the URL
});

// ---------------------------------------------------------------------------
// Navigation helpers (typed to our routing config)
// ---------------------------------------------------------------------------

/**
 * Locale-aware navigation primitives.
 *
 * - `Link`       - Drop-in replacement for next/link with automatic locale prefix.
 * - `redirect`   - Server-side redirect that respects locale.
 * - `usePathname`- Returns the pathname without the locale prefix.
 * - `useRouter`  - Router with locale-aware push/replace/prefetch.
 * - `getPathname`- Compute a locale-prefixed pathname (useful in server contexts).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
