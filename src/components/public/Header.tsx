// =============================================================================
// THE A 5995 - Header Component
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import LanguageSwitcher from './LanguageSwitcher';

// ---------------------------------------------------------------------------
// Nav link type
// ---------------------------------------------------------------------------

interface NavLink {
  href: string;
  labelKey: 'home' | 'properties' | 'forSale' | 'forRent' | 'about' | 'contact' | 'blog';
  namespace: 'common' | 'nav';
}

const navLinks: NavLink[] = [
  { href: '/', labelKey: 'home', namespace: 'common' },
  { href: '/properties', labelKey: 'properties', namespace: 'common' },
  { href: '/properties?transaction_type=sale', labelKey: 'forSale', namespace: 'nav' },
  { href: '/properties?transaction_type=rent', labelKey: 'forRent', namespace: 'nav' },
  { href: '/about', labelKey: 'about', namespace: 'common' },
  { href: '/contact', labelKey: 'contact', namespace: 'common' },
  { href: '/blog', labelKey: 'blog', namespace: 'common' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Header() {
  const common = useTranslations('common');
  const nav = useTranslations('nav');
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ---- Track scroll for sticky effect ----
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ---- Close mobile menu on path change ----
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // ---- Close mobile menu on escape ----
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    }
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [mobileMenuOpen]);

  function getLabel(link: NavLink): string {
    if (link.namespace === 'nav') {
      return nav(link.labelKey as 'forSale' | 'forRent');
    }
    return common(link.labelKey as 'home' | 'properties' | 'about' | 'contact' | 'blog');
  }

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    const cleanHref = href.split('?')[0];
    return pathname.startsWith(cleanHref);
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-white shadow-lg shadow-primary-900/5 backdrop-blur-md'
          : 'bg-white/90 backdrop-blur-sm',
      )}
    >
      {/* Gold accent line */}
      <div className="h-0.5 bg-gradient-to-r from-secondary-400 via-secondary-300 to-secondary-400" />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
        >
          <Image
            src="/logo.png"
            alt="The A 5995 Property"
            width={140}
            height={48}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
                isActive(link.href)
                  ? 'bg-primary-700 text-white shadow-sm'
                  : 'text-primary-700 hover:bg-luxury-100 hover:text-primary-800',
              )}
            >
              {getLabel(link)}
            </Link>
          ))}
        </nav>

        {/* Right side: Language switcher + Mobile menu button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              'rounded-lg p-2 text-primary-700 transition-colors lg:hidden',
              'hover:bg-luxury-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
            )}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-0 z-30 bg-primary-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu panel */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-luxury-100 px-4 py-3">
          <Image
            src="/logo.png"
            alt="The A 5995 Property"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-2 text-primary-700 hover:bg-luxury-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-lg px-4 py-3 text-base font-medium transition-colors',
                isActive(link.href)
                  ? 'bg-primary-700 text-white'
                  : 'text-primary-700 hover:bg-luxury-100',
              )}
            >
              {getLabel(link)}
            </Link>
          ))}
        </nav>

        <div className="border-t border-luxury-100 px-4 py-4">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
