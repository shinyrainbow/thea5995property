// =============================================================================
// THE A 5995 - Footer Component (techproperty.co style)
// =============================================================================

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      setTimeout(() => setSubscribed(false), 4000);
    }
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div>
              <h3 className="font-heading text-xl font-semibold">{newsletter('title')}</h3>
              <p className="mt-1 text-sm text-white/50">{newsletter('description')}</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={newsletter('placeholder')}
                required
                className="flex-1 border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-secondary-400 focus:outline-none focus:ring-1 focus:ring-secondary-400/50"
              />
              <button type="submit" className="bg-secondary-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary-600">
                {subscribed ? <span className="flex items-center gap-1.5"><Check className="h-4 w-4" />{newsletter('success')}</span> : newsletter('subscribe')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <Image src="/logo.png" alt="The A 5995 Property" width={56} height={56} className="h-14 w-auto brightness-0 invert mb-6" />
            <p className="text-sm text-white/50 leading-relaxed">{t('aboutDescription')}</p>
            <div className="mt-8 flex gap-3">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="flex h-10 w-10 items-center justify-center bg-white/5 text-white/40 transition-all hover:bg-secondary-500 hover:text-white">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-6 text-xs font-medium uppercase tracking-luxury text-secondary-400">{t('quickLinks')}</h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: common('home') },
                { href: '/properties', label: common('properties') },
                { href: '/about', label: common('about') },
                { href: '/contact', label: common('contact') },
                { href: '/blog', label: common('blog') },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/50 transition-colors hover:text-secondary-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="mb-6 text-xs font-medium uppercase tracking-luxury text-secondary-400">{common('properties')}</h4>
            <ul className="space-y-3">
              {(['condo', 'house', 'townhouse', 'villa', 'apartment', 'land'] as const).map((type) => (
                <li key={type}>
                  <Link href={`/properties?property_type=${type}`} className="text-sm text-white/50 transition-colors hover:text-secondary-400">
                    {pt(type)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-6 text-xs font-medium uppercase tracking-luxury text-secondary-400">{t('contactInfo')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/50">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary-400" />
                <span>{t('address')}</span>
              </li>
              <li>
                <a href={`tel:${t('phone').replace(/\s/g, '')}`} className="flex items-center gap-3 text-sm text-white/50 transition-colors hover:text-secondary-400">
                  <Phone className="h-4 w-4 shrink-0 text-secondary-400" />{t('phone')}
                </a>
              </li>
              <li>
                <a href={`mailto:${t('email')}`} className="flex items-center gap-3 text-sm text-white/50 transition-colors hover:text-secondary-400">
                  <Mail className="h-4 w-4 shrink-0 text-secondary-400" />{t('email')}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-white/30">&copy; {currentYear} THE A 5995. {t('allRightsReserved')}</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-white/30 transition-colors hover:text-secondary-400">{t('privacyPolicy')}</Link>
            <Link href="/terms" className="text-xs text-white/30 transition-colors hover:text-secondary-400">{t('termsOfService')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
