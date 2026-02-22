// =============================================================================
// THE A 5995 - Locale Layout
// =============================================================================

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { playfairDisplay, inter } from '@/app/layout';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

// ---------------------------------------------------------------------------
// Static params generation for all supported locales
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'th' }, { locale: 'zh' }];
}

// ---------------------------------------------------------------------------
// Metadata generation per locale
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    en: 'THE A 5995 | Luxury Real Estate in Thailand',
    th: 'THE A 5995 | อสังหาริมทรัพย์หรูในประเทศไทย',
    zh: 'THE A 5995 | 泰国豪华房地产',
  };

  const descriptions: Record<string, string> = {
    en: 'Discover exceptional luxury properties across Thailand. Premium real estate for sale and rent.',
    th: 'ค้นพบอสังหาริมทรัพย์หรูทั่วประเทศไทย อสังหาริมทรัพย์ระดับพรีเมียมสำหรับขายและเช่า',
    zh: '发现泰国各地的卓越豪华房产。优质房地产出售和出租。',
  };

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    openGraph: {
      locale: locale === 'th' ? 'th_TH' : locale === 'zh' ? 'zh_CN' : 'en_US',
    },
  };
}

// ---------------------------------------------------------------------------
// Layout Component
// ---------------------------------------------------------------------------

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the locale is supported
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Load messages for the locale
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${playfairDisplay.variable} ${inter.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-20">
              {children}
            </main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
