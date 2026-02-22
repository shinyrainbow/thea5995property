// =============================================================================
// THE A 5995 - Utility Functions
// =============================================================================

import type { Locale } from '@/types';

// ---------------------------------------------------------------------------
// className merger (clsx-style)
// ---------------------------------------------------------------------------

type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | Record<string, boolean | undefined | null>
  | ClassValue[];

/**
 * Merge CSS class names, filtering out falsy values.
 *
 * @example
 * cn('px-4', isActive && 'bg-blue-500', undefined, 'text-white')
 * // => 'px-4 bg-blue-500 text-white'
 */
export function cn(...classes: ClassValue[]): string {
  const result: string[] = [];

  for (const cls of classes) {
    if (!cls) continue;
    if (typeof cls === 'string') {
      result.push(cls);
    } else if (typeof cls === 'number') {
      result.push(String(cls));
    } else if (Array.isArray(cls)) {
      const inner = cn(...cls);
      if (inner) result.push(inner);
    } else if (typeof cls === 'object') {
      for (const [key, val] of Object.entries(cls)) {
        if (val) result.push(key);
      }
    }
  }

  return result.join(' ');
}

// ---------------------------------------------------------------------------
// Price formatting
// ---------------------------------------------------------------------------

/**
 * Format a price as Thai Baht with locale-appropriate number formatting.
 *
 * @param price  - The numeric price value.
 * @param locale - The locale code ('en', 'th', or 'zh').
 * @returns Formatted price string (e.g. "฿12,500,000").
 */
export function formatPrice(price: number, locale: string): string {
  const localeMap: Record<string, string> = {
    en: 'en-US',
    th: 'th-TH',
    zh: 'zh-CN',
  };

  const intlLocale = localeMap[locale] ?? 'en-US';

  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

/**
 * Format an ISO date string into a human-readable form for the given locale.
 *
 * @param date   - An ISO 8601 date string (e.g. from Supabase timestamps).
 * @param locale - The locale code ('en', 'th', or 'zh').
 * @returns Formatted date string.
 */
export function formatDate(date: string, locale: string): string {
  const localeMap: Record<string, string> = {
    en: 'en-US',
    th: 'th-TH',
    zh: 'zh-CN',
  };

  const intlLocale = localeMap[locale] ?? 'en-US';

  return new Intl.DateTimeFormat(intlLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

// ---------------------------------------------------------------------------
// Slug generation
// ---------------------------------------------------------------------------

/**
 * Generate a URL-safe slug from arbitrary text.
 *
 * Handles Latin characters, strips diacritics, lowercases, and replaces
 * non-alphanumeric runs with hyphens.
 *
 * For Thai / Chinese text where transliteration is impractical, this will
 * fall back to a timestamp-based slug. In production you may want to use
 * a transliteration library for these languages.
 *
 * @param text - The source text.
 * @returns A URL-safe slug string.
 */
export function generateSlug(text: string): string {
  const slug = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric (except spaces/hyphens)
    .replace(/[\s_]+/g, '-') // spaces / underscores to hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens

  // If the resulting slug is empty (e.g. pure Thai/Chinese input), generate
  // a fallback based on a timestamp to guarantee uniqueness.
  if (slug.length === 0) {
    return `property-${Date.now()}`;
  }

  return slug;
}

// ---------------------------------------------------------------------------
// Localized field accessor
// ---------------------------------------------------------------------------

/**
 * Retrieve a locale-suffixed field from an object.
 *
 * Given an object with fields like `title_en`, `title_th`, `title_zh`, this
 * helper returns the value matching the current locale, falling back to `en`.
 *
 * @param obj    - The source object (e.g. a Property row).
 * @param field  - The base field name without the locale suffix (e.g. 'title').
 * @param locale - The current locale code.
 * @returns The localized string value, or an empty string if not found.
 *
 * @example
 * getLocalizedField(property, 'title', 'th') // returns property.title_th
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLocalizedField(
  obj: any,
  field: string,
  locale: string,
): string {
  const key = `${field}_${locale}`;
  const value = obj?.[key];

  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  // Fallback to English
  const fallbackKey = `${field}_en`;
  const fallback = obj?.[fallbackKey];

  return typeof fallback === 'string' ? fallback : '';
}

// ---------------------------------------------------------------------------
// Text truncation
// ---------------------------------------------------------------------------

/**
 * Truncate text to a maximum length, appending an ellipsis if truncated.
 *
 * @param text      - The source text.
 * @param maxLength - Maximum number of characters (default: 150).
 * @returns The (possibly truncated) text.
 */
export function truncateText(text: string, maxLength = 150): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

// ---------------------------------------------------------------------------
// Supported locales
// ---------------------------------------------------------------------------

export const LOCALES: Locale[] = ['en', 'th', 'zh'];
export const DEFAULT_LOCALE: Locale = 'en';

// ---------------------------------------------------------------------------
// Property type slug mapping
// ---------------------------------------------------------------------------

/**
 * Comprehensive slug mapping for the 11 property types, across all three
 * supported languages.
 *
 * Structure: `PROPERTY_TYPE_SLUGS[slugKey]` where the value contains all
 * three locale slugs and display names.
 */
export const PROPERTY_TYPE_SLUGS: Record<
  string,
  {
    slug_en: string;
    slug_th: string;
    slug_zh: string;
    name_en: string;
    name_th: string;
    name_zh: string;
    icon: string;
  }
> = {
  condo: {
    slug_en: 'condo',
    slug_th: 'คอนโด',
    slug_zh: '公寓',
    name_en: 'Condo',
    name_th: 'คอนโดมิเนียม',
    name_zh: '公寓',
    icon: 'Building2',
  },
  townhouse: {
    slug_en: 'townhouse',
    slug_th: 'ทาวน์เฮาส์',
    slug_zh: '联排别墅',
    name_en: 'Townhouse',
    name_th: 'ทาวน์เฮาส์',
    name_zh: '联排别墅',
    icon: 'Hotel',
  },
  house: {
    slug_en: 'house',
    slug_th: 'บ้าน',
    slug_zh: '房屋',
    name_en: 'House',
    name_th: 'บ้านเดี่ยว',
    name_zh: '房屋',
    icon: 'Home',
  },
  land: {
    slug_en: 'land',
    slug_th: 'ที่ดิน',
    slug_zh: '土地',
    name_en: 'Land',
    name_th: 'ที่ดิน',
    name_zh: '土地',
    icon: 'Map',
  },
  villa: {
    slug_en: 'villa',
    slug_th: 'วิลล่า',
    slug_zh: '别墅',
    name_en: 'Villa',
    name_th: 'วิลล่า',
    name_zh: '别墅',
    icon: 'Castle',
  },
  apartment: {
    slug_en: 'apartment',
    slug_th: 'อพาร์ทเมนท์',
    slug_zh: '公寓楼',
    name_en: 'Apartment',
    name_th: 'อพาร์ทเมนท์',
    name_zh: '公寓楼',
    icon: 'Building',
  },
  office: {
    slug_en: 'office',
    slug_th: 'สำนักงาน',
    slug_zh: '办公室',
    name_en: 'Office',
    name_th: 'สำนักงาน',
    name_zh: '办公室',
    icon: 'Briefcase',
  },
  store: {
    slug_en: 'store',
    slug_th: 'ร้านค้า',
    slug_zh: '商铺',
    name_en: 'Store',
    name_th: 'ร้านค้า',
    name_zh: '商铺',
    icon: 'Store',
  },
  factory: {
    slug_en: 'factory',
    slug_th: 'โรงงาน',
    slug_zh: '工厂',
    name_en: 'Factory',
    name_th: 'โรงงาน',
    name_zh: '工厂',
    icon: 'Factory',
  },
  hotel: {
    slug_en: 'hotel',
    slug_th: 'โรงแรม',
    slug_zh: '酒店',
    name_en: 'Hotel',
    name_th: 'โรงแรม',
    name_zh: '酒店',
    icon: 'BedDouble',
  },
  building: {
    slug_en: 'building',
    slug_th: 'อาคาร',
    slug_zh: '大楼',
    name_en: 'Building',
    name_th: 'อาคาร',
    name_zh: '大楼',
    icon: 'Landmark',
  },
} as const;

// ---------------------------------------------------------------------------
// Province list (common Thai provinces for real estate)
// ---------------------------------------------------------------------------

export const THAI_PROVINCES = [
  'Bangkok',
  'Chiang Mai',
  'Chiang Rai',
  'Chonburi',
  'Hua Hin',
  'Kanchanaburi',
  'Khon Kaen',
  'Krabi',
  'Nakhon Ratchasima',
  'Nonthaburi',
  'Pathum Thani',
  'Pattaya',
  'Phang Nga',
  'Phuket',
  'Prachuap Khiri Khan',
  'Rayong',
  'Samut Prakan',
  'Samut Sakhon',
  'Surat Thani',
  'Udon Thani',
] as const;
