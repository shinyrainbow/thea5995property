// =============================================================================
// THE A 5995 - Property Filter Component
// =============================================================================

'use client';

import { useState, useCallback, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
} from 'lucide-react';
import { cn, PROPERTY_TYPE_SLUGS, THAI_PROVINCES_DATA, getLocalizedField, getLocalizedProvince } from '@/lib/utils';
import Input from '@/components/ui/Input';
import NumberInput from '@/components/ui/NumberInput';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PropertyFilter() {
  const t = useTranslations('search');
  const propT = useTranslations('property');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // ---- Local state from search params ----
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [propertyType, setPropertyType] = useState(
    searchParams.get('property_type') || '',
  );
  const [transactionType, setTransactionType] = useState(
    searchParams.get('transaction_type') || '',
  );
  const [minPrice, setMinPrice] = useState<number | null>(
    searchParams.get('min_price') ? Number(searchParams.get('min_price')) : null,
  );
  const [maxPrice, setMaxPrice] = useState<number | null>(
    searchParams.get('max_price') ? Number(searchParams.get('max_price')) : null,
  );
  const [bedrooms, setBedrooms] = useState(
    searchParams.get('bedrooms') || '',
  );
  const [province, setProvince] = useState(
    searchParams.get('province') || '',
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get('sort_by') || 'newest',
  );

  // ---- Apply filters to URL ----
  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();

    if (search.trim()) params.set('search', search.trim());
    if (propertyType) params.set('property_type', propertyType);
    if (transactionType) params.set('transaction_type', transactionType);
    if (minPrice) params.set('min_price', String(minPrice));
    if (maxPrice) params.set('max_price', String(maxPrice));
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (province) params.set('province', province);
    if (sortBy && sortBy !== 'newest') params.set('sort_by', sortBy);

    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.push(url);
    });
  }, [
    search,
    propertyType,
    transactionType,
    minPrice,
    maxPrice,
    bedrooms,
    province,
    sortBy,
    pathname,
    router,
  ]);

  // ---- Reset all filters ----
  const resetFilters = useCallback(() => {
    setSearch('');
    setPropertyType('');
    setTransactionType('');
    setMinPrice(null);
    setMaxPrice(null);
    setBedrooms('');
    setProvince('');
    setSortBy('newest');

    startTransition(() => {
      router.push(pathname);
    });
  }, [pathname, router]);

  // ---- Detect if any filter is active ----
  const hasActiveFilters =
    search || propertyType || transactionType || minPrice || maxPrice || bedrooms || province;

  // ---- Property type options ----
  const propertyTypeOptions = [
    { value: '', label: t('anyType') },
    ...Object.entries(PROPERTY_TYPE_SLUGS).map(([key, val]) => ({
      value: key,
      label: getLocalizedField(val, 'name', locale),
    })),
  ];

  // ---- Province options ----
  const provinceOptions = [
    { value: '', label: t('anyLocation') },
    ...THAI_PROVINCES_DATA.map((p) => ({ value: p.value, label: getLocalizedProvince(p.value, locale) })),
  ];

  // ---- Bedrooms options ----
  const bedroomOptions = [
    { value: '', label: t('anyType') },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
    { value: '5', label: '5+' },
  ];

  // ---- Sort options ----
  const sortOptions = [
    { value: 'newest', label: t('newest') },
    { value: 'price_asc', label: t('priceLowToHigh') },
    { value: 'price_desc', label: t('priceHighToLow') },
  ];

  return (
    <div className="rounded-xl border border-luxury-200 bg-white p-4 shadow-sm sm:p-6">
      {/* Top row: Search + toggle */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Search input */}
        <div className="flex-1">
          <Input
            type="text"
            placeholder={t('searchProperties')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startAdornment={<Search className="h-4 w-4" />}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyFilters();
            }}
          />
        </div>

        {/* Transaction type toggle */}
        <div className="flex rounded-lg border border-luxury-200 p-1">
          {([
            { value: '', label: t('anyType') },
            { value: 'sale', label: propT('forSale') },
            { value: 'rent', label: propT('forRent') },
          ] as const).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTransactionType(option.value)}
              className={cn(
                'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                transactionType === option.value
                  ? 'bg-primary-700 text-white'
                  : 'text-luxury-600 hover:bg-luxury-50',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Filter toggle (mobile) */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg border border-luxury-200 px-4 py-2.5 text-sm font-medium transition-colors sm:hidden',
            expanded
              ? 'bg-primary-700 text-white'
              : 'text-primary-700 hover:bg-luxury-50',
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t('filters')}
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 transition-transform',
              expanded && 'rotate-180',
            )}
          />
        </button>
      </div>

      {/* Expanded filters */}
      <div
        className={cn(
          'mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
          // Always visible on sm+, toggled on mobile
          'hidden sm:grid',
          expanded && '!grid',
        )}
      >
        {/* Property Type */}
        <Select
          label={t('propertyType')}
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          options={propertyTypeOptions}
        />

        {/* Province */}
        <Select
          label={t('location')}
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          options={provinceOptions}
        />

        {/* Price range */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-primary-700">
            {t('priceRange')}
          </label>
          <div className="flex gap-2">
            <NumberInput
              value={minPrice}
              onChange={setMinPrice}
              placeholder={t('minPrice')}
              className="w-full rounded-lg border border-luxury-200 bg-white px-4 py-2.5 text-sm text-primary-700 placeholder:text-luxury-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-primary-400 focus:ring-primary-100"
            />
            <NumberInput
              value={maxPrice}
              onChange={setMaxPrice}
              placeholder={t('maxPrice')}
              className="w-full rounded-lg border border-luxury-200 bg-white px-4 py-2.5 text-sm text-primary-700 placeholder:text-luxury-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-primary-400 focus:ring-primary-100"
            />
          </div>
        </div>

        {/* Bedrooms */}
        <Select
          label={propT('bedrooms')}
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
          options={bedroomOptions}
        />
      </div>

      {/* Sort + Action buttons */}
      <div className="mt-4 flex flex-col items-start gap-3 border-t border-luxury-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-48">
          <Select
            label={t('sortBy')}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={sortOptions}
          />
        </div>

        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              icon={<X className="h-3.5 w-3.5" />}
            >
              {t('clearFilters')}
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={applyFilters}
            loading={isPending}
            icon={<Search className="h-3.5 w-3.5" />}
          >
            {t('apply')}
          </Button>
        </div>
      </div>
    </div>
  );
}
