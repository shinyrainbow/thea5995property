// =============================================================================
// THE A 5995 - Footer Component
// =============================================================================

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  ArrowRight,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Footer() {
  const t = useTranslations('footer');
  const common = useTranslations('common');
  const pt = useTranslations('propertyTypes');
  const newsletter = useTranslations('newsletter');

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      // Reset after 4 seconds
      setTimeout(() => setSubscribed(false), 4000);
    }
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-700 text-white">
      {/* Newsletter bar */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <div>
              <h3 className="font-heading text-xl font-semibold">
                {newsletter('title')}
              </h3>
              <p className="mt-1 text-sm text-luxury-300">
                {newsletter('description')}
              </p>
            </div>
            <form
              onSubmit={handleSubscribe}
              className="flex w-full max-w-md gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={newsletter('placeholder')}
                required
                className={cn(
                  'flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white',
                  'placeholder:text-luxury-300',
                  'focus:border-secondary-400 focus:outline-none focus:ring-2 focus:ring-secondary-400/30',
                )}
              />
              <button
                type="submit"
                className={cn(
                  'rounded-lg bg-secondary-400 px-5 py-2.5 text-sm font-semibold text-primary-700',
                  'transition-colors hover:bg-secondary-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700',
                )}
              >
                {subscribed ? (
                  <span className="flex items-center gap-1.5">
                    <Check className="h-4 w-4" />
                    {newsletter('success')}
                  </span>
                ) : (
                  newsletter('subscribe')
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Quick Links */}
          <div>
            <h4 className="mb-4 font-heading text-lg font-semibold text-secondary-400">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '/', label: common('home') },
                { href: '/properties', label: common('properties') },
                { href: '/about', label: common('about') },
                { href: '/contact', label: common('contact') },
                { href: '/blog', label: common('blog') },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1.5 text-sm text-luxury-200 transition-colors hover:text-secondary-400"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Property Types */}
          <div>
            <h4 className="mb-4 font-heading text-lg font-semibold text-secondary-400">
              {common('properties')}
            </h4>
            <ul className="space-y-2.5">
              {(['condo', 'house', 'townhouse', 'villa', 'apartment', 'land'] as const).map(
                (type) => (
                  <li key={type}>
                    <Link
                      href={`/properties?property_type=${type}`}
                      className="group flex items-center gap-1.5 text-sm text-luxury-200 transition-colors hover:text-secondary-400"
                    >
                      <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
                      {pt(type)}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="mb-4 font-heading text-lg font-semibold text-secondary-400">
              {t('contactInfo')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-luxury-200">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary-400" />
                <span>{t('address')}</span>
              </li>
              <li>
                <a
                  href={`tel:${t('phone').replace(/\s/g, '')}`}
                  className="flex items-center gap-3 text-sm text-luxury-200 transition-colors hover:text-secondary-400"
                >
                  <Phone className="h-4 w-4 shrink-0 text-secondary-400" />
                  {t('phone')}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${t('email')}`}
                  className="flex items-center gap-3 text-sm text-luxury-200 transition-colors hover:text-secondary-400"
                >
                  <Mail className="h-4 w-4 shrink-0 text-secondary-400" />
                  {t('email')}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Follow Us */}
          <div>
            <h4 className="mb-4 font-heading text-lg font-semibold text-secondary-400">
              {t('followUs')}
            </h4>
            <p className="mb-4 text-sm text-luxury-200">
              {t('aboutDescription')}
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    'bg-white/10 text-luxury-200 transition-all',
                    'hover:bg-secondary-400 hover:text-primary-700',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-sm text-luxury-300">
            <Image
              src="/logo.png"
              alt="The A 5995 Property"
              width={100}
              height={34}
              className="h-8 w-auto brightness-0 invert"
            />
            <span>&copy; {currentYear} . {t('allRightsReserved')}</span>
          </div>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-luxury-300 transition-colors hover:text-secondary-400"
            >
              {t('privacyPolicy')}
            </Link>
            <Link
              href="/terms"
              className="text-sm text-luxury-300 transition-colors hover:text-secondary-400"
            >
              {t('termsOfService')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
