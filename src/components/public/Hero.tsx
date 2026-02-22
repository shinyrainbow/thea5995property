// =============================================================================
// THE A 5995 - Hero Component (inspired by techproperty.co)
// =============================================================================

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  }

  return (
    <section className="relative flex min-h-[100svh] -mt-20 items-center justify-center overflow-hidden bg-primary-900">
      {/* Background image placeholder - gradient when no image */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-900/50 via-primary-900/70 to-primary-900/90" />

      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-32 text-center sm:px-6 lg:px-8">
        {/* Accent text */}
        <p
          className="mb-6 text-xs font-medium uppercase tracking-luxury text-secondary-400 animate-fade-in"
          style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
        >
          Exclusive Real Estate
        </p>

        {/* Headline */}
        <h1
          className="font-heading text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl animate-hero-text"
        >
          {t('headline')}
        </h1>

        {/* Divider */}
        <div
          className="mx-auto mt-8 h-px w-16 bg-secondary-500 animate-fade-in"
          style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
        />

        {/* Subtitle */}
        <p
          className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/70 animate-slide-up"
          style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
        >
          {t('subtitle')}
        </p>

        {/* Glassmorphism search bar */}
        <form
          onSubmit={handleSearch}
          className="mx-auto mt-12 flex max-w-2xl overflow-hidden rounded-lg border border-white/20 bg-white/10 p-2 backdrop-blur-sm animate-slide-up"
          style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full border-0 bg-transparent py-3.5 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none text-base"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-secondary-500 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary-600"
          >
            {t('exploreProperties')}
          </button>
        </form>

        {/* Stats */}
        <div
          className="mx-auto mt-16 flex max-w-lg items-center justify-center gap-12 animate-slide-up"
          style={{ animationDelay: '0.8s', animationFillMode: 'backwards' }}
        >
          {[
            { value: '500+', label: 'Properties' },
            { value: '10+', label: 'Years' },
            { value: '1,200+', label: 'Clients' },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/50">{stat.label}</p>
              {i < 2 && <div className="sr-only" />}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        type="button"
        onClick={scrollToContent}
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 transition-colors hover:text-white/70 animate-bounce"
        aria-label={t('scrollDown')}
      >
        <span className="text-[10px] font-medium uppercase tracking-luxury">{t('scrollDown')}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
    </section>
  );
}
