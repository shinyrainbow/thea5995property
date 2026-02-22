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
      <section className="relative bg-primary-700 py-20 md:py-28">
        <div className="absolute inset-0 bg-[url('/images/about-hero.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-luxury-200 md:text-xl">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* About / Story Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Image placeholder */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-luxury-100">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-700/10 to-secondary-400/10">
                <Globe className="h-24 w-24 text-luxury-300" />
              </div>
            </div>

            {/* Text content */}
            <div>
              <h2 className="font-heading text-3xl font-bold text-primary-700 md:text-4xl">
                {t('storyTitle')}
              </h2>
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
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary-400 text-white">
            <Target className="h-8 w-8" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-primary-700 md:text-4xl">
            {t('missionTitle')}
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-luxury-600">
            {t('missionText')}
          </p>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold text-primary-700 md:text-4xl">
              {t('whyChooseUs')}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-xl border border-luxury-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-secondary-400 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-luxury-50 text-primary-700 transition-colors group-hover:bg-secondary-400 group-hover:text-white">
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
      <section className="bg-primary-700 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Handshake className="mx-auto mb-6 h-12 w-12 text-secondary-400" />
          <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
            {t('ctaTitle')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-luxury-200">
            {t('ctaText')}
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-secondary-400 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-secondary-500"
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
