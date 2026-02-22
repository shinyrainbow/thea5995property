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
      <section className="relative bg-primary-700 py-20 md:py-28">
        <div className="absolute inset-0 bg-[url('/images/contact-hero.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-luxury-200 md:text-xl">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Contact Info */}
            <div>
              <h2 className="mb-8 font-heading text-2xl font-bold text-primary-700 md:text-3xl">
                {t('infoTitle')}
              </h2>

              <div className="space-y-6">
                {contactDetails.map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-xl border border-luxury-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary-400/10 text-secondary-500">
                      {detail.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-luxury-500">{detail.label}</p>
                      {detail.href ? (
                        <a
                          href={detail.href}
                          className="mt-0.5 text-primary-700 font-medium transition-colors hover:text-secondary-400"
                        >
                          {detail.value}
                        </a>
                      ) : (
                        <p className="mt-0.5 text-primary-700 font-medium">{detail.value}</p>
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
                <div className="flex h-64 items-center justify-center rounded-xl bg-luxury-100 border-2 border-dashed border-luxury-300">
                  <div className="text-center text-luxury-400">
                    <Map className="mx-auto mb-2 h-10 w-10" />
                    <p className="text-sm font-medium">Google Maps Integration</p>
                    <p className="text-xs">Map will be displayed here</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="mb-8 font-heading text-2xl font-bold text-primary-700 md:text-3xl">
                {t('formTitle')}
              </h2>
              <InquiryForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
