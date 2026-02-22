// =============================================================================
// THE A 5995 - Language Switcher Component
// =============================================================================

'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Locale } from '@/types';

// ---------------------------------------------------------------------------
// Language config
// ---------------------------------------------------------------------------

const languages: { code: Locale; flag: string; label: string }[] = [
  { code: 'en', flag: '\u{1F1FA}\u{1F1F8}', label: 'EN' },
  { code: 'th', flag: '\u{1F1F9}\u{1F1ED}', label: 'TH' },
  { code: 'zh', flag: '\u{1F1E8}\u{1F1F3}', label: 'ZH' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = languages.find((l) => l.code === locale) || languages[0];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open]);

  function switchLocale(newLocale: Locale) {
    setOpen(false);
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium',
          'text-primary-700 transition-colors duration-200',
          'hover:bg-luxury-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4" />
        <span>
          {current.flag} {current.label}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden',
            'rounded-lg border border-luxury-200 bg-white shadow-lg',
            'animate-fade-in',
          )}
          role="listbox"
          aria-label="Available languages"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={lang.code === locale}
              onClick={() => switchLocale(lang.code)}
              className={cn(
                'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                lang.code === locale
                  ? 'bg-primary-50 font-semibold text-primary-700'
                  : 'text-luxury-700 hover:bg-luxury-50',
              )}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.label}</span>
              {lang.code === locale && (
                <span className="ml-auto text-primary-500">&#10003;</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
