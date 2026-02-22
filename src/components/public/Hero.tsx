// =============================================================================
// THE A 5995 - Hero Component
// =============================================================================

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Search, ChevronDown, MapPin, Home, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-700 to-primary-800" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern" />

      {/* Decorative shapes */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-secondary-400/8 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-secondary-400/5 blur-3xl" />
      <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-primary-400/10 blur-2xl" />

      {/* Decorative icons */}
      <div className="absolute top-20 left-[10%] text-white/[0.04]">
        <Home className="h-32 w-32" />
      </div>
      <div className="absolute bottom-20 right-[10%] text-white/[0.04]">
        <Building2 className="h-40 w-40" />
      </div>

      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary-400 to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-32 text-center sm:px-6 lg:px-8">
        {/* Badge */}
        <div
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-secondary-400/30 bg-secondary-400/10 px-5 py-2 animate-fade-in"
        >
          <MapPin className="h-4 w-4 text-secondary-400" />
          <span className="text-sm font-medium text-secondary-300 tracking-wide">
            Thailand&apos;s Premier Real Estate
          </span>
        </div>

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

        {/* Gold divider */}
        <div className="mx-auto mt-6 flex items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}>
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-secondary-400" />
          <div className="h-1.5 w-1.5 rounded-full bg-secondary-400" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-secondary-400" />
        </div>

        {/* Subtitle */}
        <p
          className={cn(
            'mx-auto mt-6 max-w-2xl text-lg text-primary-200/90 sm:text-xl leading-relaxed',
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
            'mx-auto mt-10 flex max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/20',
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
              'm-2 rounded-xl bg-primary-700 px-6 py-3 font-semibold text-white',
              'transition-all duration-200 hover:bg-primary-600 hover:shadow-lg',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2',
              'sm:px-8',
            )}
          >
            {t('exploreProperties')}
          </button>
        </form>

        {/* Quick stats */}
        <div
          className="mx-auto mt-12 flex max-w-lg items-center justify-center gap-8 sm:gap-12 animate-slide-up"
          style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}
        >
          {[
            { value: '500+', label: 'Properties' },
            { value: '10+', label: 'Years' },
            { value: '1,200+', label: 'Clients' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
              <p className="mt-0.5 text-xs font-medium text-primary-300 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll down indicator */}
      <button
        type="button"
        onClick={scrollToContent}
        className={cn(
          'absolute bottom-8 left-1/2 -translate-x-1/2 z-10',
          'flex flex-col items-center gap-2 text-white/60 transition-colors hover:text-white',
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

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-luxury-50 to-transparent" />
    </section>
  );
}
