// =============================================================================
// THE A 5995 - Contact Page (techproperty.co style)
// =============================================================================

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import InquiryForm from '@/components/public/InquiryForm';
import { MapPin, Phone, Mail, Clock, Map } from 'lucide-react';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'th' }, { locale: 'zh' }];
}

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

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'contact' });

  const contactDetails = [
    { icon: <MapPin className="h-5 w-5" />, label: t('address'), value: t('addressValue'), href: null },
    { icon: <Phone className="h-5 w-5" />, label: t('phone'), value: t('phoneValue'), href: `tel:${t('phoneValue').replace(/\s/g, '')}` },
    { icon: <Mail className="h-5 w-5" />, label: t('email'), value: t('emailValue'), href: `mailto:${t('emailValue')}` },
    { icon: <Clock className="h-5 w-5" />, label: t('hours'), value: t('hoursValue'), href: null },
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
            {t('title')}
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

      {/* Content */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            {/* Contact Info */}
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-luxury text-secondary-500">
                Reach Out
              </p>
              <h2 className="font-heading text-2xl font-bold text-primary-900 md:text-3xl">
                {t('infoTitle')}
              </h2>
              <div className="mt-4 h-px w-12 bg-secondary-500" />

              <div className="mt-10 space-y-6">
                {contactDetails.map((detail, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-luxury-50 text-primary-900">
                      {detail.icon}
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-luxury-500">{detail.label}</p>
                      {detail.href ? (
                        <a href={detail.href} className="mt-1 block text-base font-semibold text-primary-900 transition-colors hover:text-secondary-500">
                          {detail.value}
                        </a>
                      ) : (
                        <p className="mt-1 text-base font-semibold text-primary-900">{detail.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map */}
              <div className="mt-12">
                <div className="flex h-72 items-center justify-center rounded-lg bg-luxury-50">
                  <div className="text-center text-luxury-400">
                    <Map className="mx-auto mb-2 h-8 w-8" />
                    <p className="text-sm font-medium text-primary-900">Google Maps</p>
                    <p className="mt-1 text-xs text-luxury-500">Add API key to enable</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-luxury text-secondary-500">
                Inquiry
              </p>
              <h2 className="font-heading text-2xl font-bold text-primary-900 md:text-3xl">
                {t('formTitle')}
              </h2>
              <div className="mt-4 h-px w-12 bg-secondary-500" />
              <div className="mt-10">
                <InquiryForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
