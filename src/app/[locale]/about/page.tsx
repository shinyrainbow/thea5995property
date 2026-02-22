// =============================================================================
// THE A 5995 - About Page
// =============================================================================

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import {
  MapPin,
  Users,
  Shield,
  ArrowRight,
  Target,
  Globe,
  Handshake,
  Award,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'th' }, { locale: 'zh' }];
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });

  return {
    title: `${t('title')} | THE A 5995`,
    description: t('metaDescription'),
  };
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'about' });

  const features = [
    {
      icon: <MapPin className="h-8 w-8" />,
      title: t('feature1Title'),
      text: t('feature1Text'),
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: t('feature2Title'),
      text: t('feature2Text'),
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: t('feature3Title'),
      text: t('feature3Text'),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-primary-800 py-24 md:py-32">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-secondary-400/8 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-secondary-400/5 blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary-400 to-transparent" />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary-400/30 bg-secondary-400/10 px-4 py-1.5">
            <Award className="h-4 w-4 text-secondary-400" />
            <span className="text-sm font-medium text-secondary-300">Est. 2015</span>
          </div>
          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            {t('heroTitle')}
          </h1>
          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-secondary-400" />
            <div className="h-1.5 w-1.5 rounded-full bg-secondary-400" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-secondary-400" />
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-200/90 md:text-xl leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* About / Story Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Image placeholder with pattern */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900">
              <div className="absolute inset-0 bg-grid-pattern" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Globe className="mx-auto h-20 w-20 text-secondary-400/50" />
                  <p className="mt-4 text-sm font-medium text-white/40 uppercase tracking-wider">THE A 5995</p>
                </div>
              </div>
              {/* Decorative corner */}
              <div className="absolute top-4 left-4 h-12 w-12 border-t-2 border-l-2 border-secondary-400/40 rounded-tl-lg" />
              <div className="absolute bottom-4 right-4 h-12 w-12 border-b-2 border-r-2 border-secondary-400/40 rounded-br-lg" />
            </div>

            {/* Text content */}
            <div>
              <h2 className="font-heading text-3xl font-bold text-primary-700 md:text-4xl">
                {t('storyTitle')}
              </h2>
              <div className="mt-4 h-1 w-16 bg-secondary-400 rounded-full" />
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-luxury-600">
                <p>{t('storyText1')}</p>
                <p>{t('storyText2')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-luxury-50 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary-400 to-secondary-500 text-white shadow-lg shadow-secondary-400/25">
            <Target className="h-8 w-8" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-primary-700 md:text-4xl">
            {t('missionTitle')}
          </h2>
          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-secondary-400" />
            <div className="h-1.5 w-1.5 rounded-full bg-secondary-400" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-secondary-400" />
          </div>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-luxury-600">
            {t('missionText')}
          </p>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold text-primary-700 md:text-4xl">
              {t('whyChooseUs')}
            </h2>
            <div className="mx-auto mt-4 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-secondary-400" />
              <div className="h-1.5 w-1.5 rounded-full bg-secondary-400" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-secondary-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-luxury-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-secondary-400/50 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-luxury-50 to-luxury-100 text-primary-700 transition-all duration-300 group-hover:from-secondary-400 group-hover:to-secondary-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-secondary-400/25">
                  {feature.icon}
                </div>
                <h3 className="mb-3 font-heading text-xl font-semibold text-primary-700">
                  {feature.title}
                </h3>
                <p className="text-luxury-600 leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-primary-800 py-20 md:py-28">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-secondary-400/8 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Handshake className="mx-auto mb-6 h-12 w-12 text-secondary-400" />
          <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
            {t('ctaTitle')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-200/90">
            {t('ctaText')}
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-secondary-400 px-8 py-3.5 text-sm font-semibold text-primary-900 transition-all duration-200 hover:bg-secondary-300 hover:shadow-lg hover:shadow-secondary-400/25"
            >
              {t('ctaButton')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
