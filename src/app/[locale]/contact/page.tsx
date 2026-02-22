// =============================================================================
// THE A 5995 - Contact Page
// =============================================================================

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import InquiryForm from '@/components/public/InquiryForm';
import { MapPin, Phone, Mail, Clock, Map } from 'lucide-react';

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
  const t = await getTranslations({ locale, namespace: 'contact' });

  return {
    title: `${t('title')} | THE A 5995`,
    description: t('metaDescription'),
  };
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'contact' });

  const contactDetails = [
    {
      icon: <MapPin className="h-6 w-6" />,
      label: t('address'),
      value: t('addressValue'),
      href: null,
    },
    {
      icon: <Phone className="h-6 w-6" />,
      label: t('phone'),
      value: t('phoneValue'),
      href: `tel:${t('phoneValue').replace(/\s/g, '')}`,
    },
    {
      icon: <Mail className="h-6 w-6" />,
      label: t('email'),
      value: t('emailValue'),
      href: `mailto:${t('emailValue')}`,
    },
    {
      icon: <Clock className="h-6 w-6" />,
      label: t('hours'),
      value: t('hoursValue'),
      href: null,
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
            <Phone className="h-4 w-4 text-secondary-400" />
            <span className="text-sm font-medium text-secondary-300">{t('title')}</span>
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

      {/* Contact Content */}
      <section className="py-16 md:py-24 bg-luxury-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Contact Info */}
            <div>
              <h2 className="mb-2 font-heading text-2xl font-bold text-primary-700 md:text-3xl">
                {t('infoTitle')}
              </h2>
              <div className="mb-8 h-1 w-16 bg-secondary-400 rounded-full" />

              <div className="space-y-4">
                {contactDetails.map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-xl border border-luxury-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-secondary-400/50"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-400/20 to-secondary-400/5 text-secondary-500">
                      {detail.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-luxury-500 uppercase tracking-wide">{detail.label}</p>
                      {detail.href ? (
                        <a
                          href={detail.href}
                          className="mt-1 block text-primary-700 font-semibold transition-colors hover:text-secondary-500"
                        >
                          {detail.value}
                        </a>
                      ) : (
                        <p className="mt-1 text-primary-700 font-semibold">{detail.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Placeholder */}
              <div className="mt-8">
                <h3 className="mb-4 font-heading text-xl font-semibold text-primary-700">
                  {t('mapTitle')}
                </h3>
                <div className="flex h-72 items-center justify-center rounded-xl bg-white border border-luxury-200 shadow-sm overflow-hidden">
                  <div className="text-center text-luxury-400">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-luxury-100">
                      <Map className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-semibold text-primary-700">Google Maps</p>
                    <p className="mt-1 text-xs text-luxury-500">Add your Google Maps API key to enable</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="mb-2 font-heading text-2xl font-bold text-primary-700 md:text-3xl">
                {t('formTitle')}
              </h2>
              <div className="mb-8 h-1 w-16 bg-secondary-400 rounded-full" />
              <div className="rounded-xl border border-luxury-200 bg-white p-6 shadow-sm sm:p-8">
                <InquiryForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
