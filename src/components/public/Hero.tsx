// =============================================================================
// THE A 5995 - Hero Component (inspired by techproperty.co)
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Search, ChevronDown, MapPin, Home, Tag } from 'lucide-react';
import type { PropertyType } from '@/types';
import { THAI_PROVINCES } from '@/lib/utils';

export default function Hero() {
  const t = useTranslations('hero');
  const tTypes = useTranslations('propertyTypes');
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [propertyTypeId, setPropertyTypeId] = useState('');
  const [province, setProvince] = useState('');
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);

  useEffect(() => {
    fetch('/api/property-types')
      .then((res) => res.json())
      .then((data) => setPropertyTypes(data.data || []))
      .catch(() => {});
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (transactionType) params.set('transaction', transactionType);
    if (propertyTypeId) params.set('type', propertyTypeId);
    if (province) params.set('province', province);

    const query = params.toString();
    router.push(`/properties${query ? `?${query}` : ''}`);
  }

  function scrollToContent() {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  }

  const selectClass =
    'w-full appearance-none bg-transparent border-0 py-3 pl-10 pr-8 text-white placeholder:text-white/40 focus:outline-none text-sm cursor-pointer';

  return (
    <section className="relative flex min-h-[100svh] -mt-20 items-center justify-center overflow-hidden bg-primary-900">
      {/* Background image */}
      <Image
        src="/images/hero-bg.jpg"
        alt="Luxury property"
        fill
        className="object-cover"
        priority
        quality={85}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-primary-900/70" />

      {/* Subtle gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/40 to-primary-900/60" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-40 pb-32 text-center sm:px-6 lg:px-8">
        {/* Headline */}
        <h1
          className="font-heading text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl animate-hero-text"
        >
          {t('headline')}
        </h1>

        {/* Divider */}
        <div
          className="mx-auto mt-8 h-px w-16 bg-secondary-400 animate-fade-in"
          style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
        />

        {/* Subtitle */}
        <p
          className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/70 animate-slide-up"
          style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
        >
          {t('subtitle')}
        </p>

        {/* Search panel */}
        <form
          onSubmit={handleSearch}
          className="mx-auto mt-12 max-w-4xl rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm animate-slide-up"
          style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}
        >
          {/* Top row: filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
            {/* Transaction Type */}
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50 pointer-events-none" />
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className={selectClass}
              >
                <option value="" className="text-primary-900">{t('buyOrRent')}</option>
                <option value="sale" className="text-primary-900">{t('buy')}</option>
                <option value="rent" className="text-primary-900">{t('rent')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50 pointer-events-none" />
            </div>

            {/* Property Type */}
            <div className="relative">
              <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50 pointer-events-none" />
              <select
                value={propertyTypeId}
                onChange={(e) => setPropertyTypeId(e.target.value)}
                className={selectClass}
              >
                <option value="" className="text-primary-900">{t('allTypes')}</option>
                {propertyTypes.map((pt) => (
                  <option key={pt.id} value={pt.id} className="text-primary-900">
                    {tTypes(pt.slug_en)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50 pointer-events-none" />
            </div>

            {/* Province */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50 pointer-events-none" />
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className={selectClass}
              >
                <option value="" className="text-primary-900">{t('allLocations')}</option>
                {THAI_PROVINCES.map((p) => (
                  <option key={p} value={p} className="text-primary-900">
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50 pointer-events-none" />
            </div>
          </div>

          {/* Bottom row: search input + button */}
          <div className="flex overflow-hidden rounded-lg border border-white/10 bg-white/5">
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
              className="rounded-md bg-secondary-400 px-8 py-3 text-sm font-semibold text-primary-900 transition-colors hover:bg-secondary-300 m-1"
            >
              {t('exploreProperties')}
            </button>
          </div>
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
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/50">{stat.label}</p>
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
