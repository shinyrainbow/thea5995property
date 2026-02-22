// =============================================================================
// THE A 5995 - next-intl Request Configuration
// =============================================================================

import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Resolve the locale from the request (set by middleware from the URL segment)
  let locale = await requestLocale;

  // Validate that the resolved locale is one we support; fall back to default
  if (!locale || !routing.locales.includes(locale as typeof routing.locales[number])) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
