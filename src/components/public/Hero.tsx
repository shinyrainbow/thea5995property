// =============================================================================
// THE A 5995 - Hero Component
// =============================================================================

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Hero() {
  const t = useTranslations('hero');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/properties');
    }
  }

  function scrollToContent() {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/images/hero-bg.jpg')",
        }}
      >
        {/* Navy overlay */}
        <div className="absolute inset-0 bg-primary-700/75" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-32 text-center sm:px-6 lg:px-8">
        {/* Headline */}
        <h1
          className={cn(
            'font-heading text-4xl font-bold leading-tight text-white',
            'sm:text-5xl md:text-6xl lg:text-7xl',
            'animate-hero-text',
          )}
        >
          {t('headline')}
        </h1>

        {/* Subtitle */}
        <p
          className={cn(
            'mx-auto mt-6 max-w-2xl text-lg text-luxury-200 sm:text-xl',
            'animate-slide-up',
          )}
          style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
        >
          {t('subtitle')}
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className={cn(
            'mx-auto mt-10 flex max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl',
            'animate-slide-up',
          )}
          style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-luxury-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className={cn(
                'w-full border-0 bg-transparent py-4 pl-12 pr-4 text-primary-700',
                'placeholder:text-luxury-400',
                'focus:outline-none focus:ring-0',
                'text-base sm:text-lg',
              )}
            />
          </div>
          <button
            type="submit"
            className={cn(
              'm-2 rounded-lg bg-primary-700 px-6 py-3 font-semibold text-white',
              'transition-colors hover:bg-primary-600',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2',
              'sm:px-8',
            )}
          >
            {t('exploreProperties')}
          </button>
        </form>

        {/* Explore button (alternative CTA) */}
        <div
          className="mt-8 animate-slide-up"
          style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}
        >
          <Button
            variant="outline"
            size="lg"
            href="/properties"
            className="border-white/40 text-white hover:bg-white/10 hover:text-white"
          >
            {t('exploreProperties')}
          </Button>
        </div>
      </div>

      {/* Scroll down indicator */}
      <button
        type="button"
        onClick={scrollToContent}
        className={cn(
          'absolute bottom-8 left-1/2 -translate-x-1/2 z-10',
          'flex flex-col items-center gap-2 text-white/70 transition-colors hover:text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg p-2',
          'animate-bounce',
        )}
        aria-label={t('scrollDown')}
      >
        <span className="text-xs font-medium tracking-luxury uppercase">
          {t('scrollDown')}
        </span>
        <ChevronDown className="h-5 w-5" />
      </button>
    </section>
  );
}
