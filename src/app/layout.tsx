// =============================================================================
// THE A 5995 - Root Layout
// =============================================================================
// This is a minimal root layout. The actual HTML structure with <html> and
// <body> is rendered in the [locale]/layout.tsx so that the lang attribute
// can be set dynamically based on the active locale.
// =============================================================================

import type { Metadata } from 'next';
import { Playfair_Display, Inter, Kanit } from 'next/font/google';
import './globals.css';

// ---------------------------------------------------------------------------
// Font Configuration
// ---------------------------------------------------------------------------

export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const kanit = Kanit({
  subsets: ['thai', 'latin'],
  variable: '--font-thai',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: {
    default: 'THE A 5995 | Luxury Real Estate in Thailand',
    template: '%s | THE A 5995',
  },
  description:
    'Discover exceptional luxury properties across Thailand. Premium real estate for sale and rent in Bangkok, Phuket, Chiang Mai, and beyond.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://thea5995.com'),
  openGraph: {
    type: 'website',
    siteName: 'THE A 5995',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ---------------------------------------------------------------------------
// Root Layout Component
// ---------------------------------------------------------------------------

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
