// =============================================================================
// THE A 5995 - Header Component (techproperty.co style)
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import LanguageSwitcher from './LanguageSwitcher';

interface NavLink {
  href: string;
  labelKey: 'home' | 'properties' | 'projects' | 'about' | 'contact' | 'blog';
  namespace: 'common';
}

const navLinks: NavLink[] = [
  { href: '/', labelKey: 'home', namespace: 'common' },
  { href: '/properties', labelKey: 'properties', namespace: 'common' },
  { href: '/projects', labelKey: 'projects', namespace: 'common' },
  { href: '/about', labelKey: 'about', namespace: 'common' },
  { href: '/contact', labelKey: 'contact', namespace: 'common' },
  { href: '/blog', labelKey: 'blog', namespace: 'common' },
];

export default function Header() {
  const common = useTranslations('common');
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHomePage = pathname === '/';
  const [scrolled, setScrolled] = useState(!isHomePage);

  useEffect(() => {
    if (!isHomePage) { setScrolled(true); return; }
    function handleScroll() { setScrolled(window.scrollY > 10); }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) { if (e.key === 'Escape') setMobileMenuOpen(false); }
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => { document.removeEventListener('keydown', handleEscape); document.body.style.overflow = ''; };
    }
  }, [mobileMenuOpen]);

  function getLabel(link: NavLink): string {
    return common(link.labelKey);
  }

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href.split('?')[0]);
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-500',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center relative h-12 sm:h-14">
          <Image
            src="/logo-image.png"
            alt="The A 5995 Property"
            width={56}
            height={56}
            className={cn(
              'h-12 w-auto sm:h-14 transition-opacity duration-500 absolute',
              scrolled ? 'opacity-100' : 'opacity-0',
            )}
            priority
          />
          <Image
            src="/logo-white.png"
            alt="The A 5995 Property"
            width={56}
            height={56}
            className={cn(
              'h-12 w-auto sm:h-14 transition-opacity duration-500',
              scrolled ? 'opacity-0' : 'opacity-100',
            )}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors duration-300',
                scrolled
                  ? isActive(link.href)
                    ? 'text-secondary-500'
                    : 'text-primary-900 hover:text-secondary-500'
                  : isActive(link.href)
                    ? 'text-secondary-400'
                    : 'text-white/80 hover:text-white',
              )}
            >
              {getLabel(link)}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher variant={scrolled ? 'dark' : 'light'} />
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              'rounded-lg p-2 transition-colors lg:hidden',
              scrolled ? 'text-primary-900 hover:bg-luxury-100' : 'text-white hover:bg-white/10',
            )}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-0 z-30 bg-primary-900/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Mobile panel */}
      <div className={cn(
        'fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 lg:hidden',
        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
      )}>
        <div className="flex items-center justify-between border-b border-luxury-100 px-4 py-4">
          <Image src="/logo-image.png" alt="The A 5995 Property" width={48} height={48} className="h-10 w-auto" />
          <button type="button" onClick={() => setMobileMenuOpen(false)} className="rounded-lg p-2 text-primary-900 hover:bg-luxury-100" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-4 py-6" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-3 text-base font-medium transition-colors',
                isActive(link.href) ? 'text-secondary-500' : 'text-primary-900 hover:text-secondary-500',
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
