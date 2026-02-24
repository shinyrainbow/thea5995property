// =============================================================================
// THE A 5995 - About Page (techproperty.co style)
// =============================================================================

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { MapPin, Users, Shield, ArrowRight, Target, Globe, Handshake } from 'lucide-react';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'th' }, { locale: 'zh' }];
}

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

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });

  const features = [
    { icon: <MapPin className="h-7 w-7" />, title: t('feature1Title'), text: t('feature1Text') },
    { icon: <Users className="h-7 w-7" />, title: t('feature2Title'), text: t('feature2Text') },
    { icon: <Shield className="h-7 w-7" />, title: t('feature3Title'), text: t('feature3Text') },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-900 -mt-20 pt-36 pb-24 md:pt-44 md:pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/50 via-primary-900/70 to-primary-900/90" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-4 text-xs font-medium uppercase tracking-luxury text-secondary-400">
            Since 2015
          </p>
          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            {t('heroTitle')}
          </h1>
          <div className="mx-auto mt-6 h-px w-12 bg-secondary-500" />
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 md:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            {/* Image placeholder */}
            <div className="relative h-[480px] overflow-hidden rounded-lg bg-primary-900">
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Globe className="h-20 w-20 text-white/10" />
              </div>
            </div>

            {/* Text */}
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-luxury text-secondary-500">
                Our Story
              </p>
              <h2 className="font-heading text-3xl font-bold text-primary-900 md:text-4xl">
                {t('storyTitle')}
              </h2>
              <div className="mt-4 h-px w-12 bg-secondary-500" />
              <div className="mt-8 space-y-5 text-base leading-relaxed text-luxury-600">
                <p>{t('storyText1')}</p>
                <p>{t('storyText2')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 md:py-32 bg-luxury-50">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Target className="mx-auto mb-6 h-10 w-10 text-secondary-500" />
          <p className="mb-4 text-xs font-medium uppercase tracking-luxury text-secondary-500">
            Purpose
          </p>
          <h2 className="font-heading text-3xl font-bold text-primary-900 md:text-4xl">
            {t('missionTitle')}
          </h2>
          <div className="mx-auto mt-6 h-px w-12 bg-secondary-500" />
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-luxury-600">
            {t('missionText')}
          </p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 md:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-luxury text-secondary-500">
              Why Us
            </p>
            <h2 className="font-heading text-3xl font-bold text-primary-900 md:text-4xl">
              {t('whyChooseUs')}
            </h2>
            <div className="mx-auto mt-6 h-px w-12 bg-secondary-500" />
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="group border border-luxury-200 bg-white p-10 transition-all duration-500 hover:border-primary-900/30 hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-luxury-50 text-primary-900 transition-all duration-500 group-hover:bg-primary-900 group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="mb-3 font-heading text-xl font-semibold text-primary-900">
                  {feature.title}
                </h3>
                <p className="text-luxury-600 leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 md:py-32 bg-luxury-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-luxury text-secondary-500">
              Our Team
            </p>
            <h2 className="font-heading text-3xl font-bold text-primary-900 md:text-4xl">
              {t('teamTitle')}
            </h2>
            <div className="mx-auto mt-6 h-px w-12 bg-secondary-500" />
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 max-w-3xl mx-auto">
            {/* Person 1 */}
            <div className="group text-center">
              <div className="relative mx-auto mb-6 h-64 w-64 overflow-hidden rounded-full border-4 border-white shadow-lg transition-transform duration-500 group-hover:scale-105">
                <Image
                  src="/person1.jpeg"
                  alt="ณภัทค์สภรณ์ เพชรณรงค์ชัย"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-heading text-xl font-bold text-primary-900">
                ณภัทค์สภรณ์ เพชรณรงค์ชัย
              </h3>
              <p className="mt-1 text-sm font-medium uppercase tracking-wider text-secondary-500">
                CEO &amp; Founder
              </p>
            </div>

            {/* Person 2 */}
            <div className="group text-center">
              <div className="relative mx-auto mb-6 h-64 w-64 overflow-hidden rounded-full border-4 border-white shadow-lg transition-transform duration-500 group-hover:scale-105">
                <Image
                  src="/person2.jpeg"
                  alt="อัญนินทร์ เกียรติพัฒนภักดี"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-heading text-xl font-bold text-primary-900">
                อัญนินทร์ เกียรติพัฒนภักดี
              </h3>
              <p className="mt-1 text-sm font-medium uppercase tracking-wider text-secondary-500">
                ผู้อำนวยการฝ่ายการตลาด
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-primary-900 py-24 md:py-32">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Handshake className="mx-auto mb-6 h-10 w-10 text-secondary-400" />
          <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
            {t('ctaTitle')}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
            {t('ctaText')}
          </p>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-secondary-500 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-secondary-600"
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
