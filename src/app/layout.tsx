import type { Metadata } from 'next';
import { DM_Sans, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AD_CONFIG } from '@/lib/adConfig';
import { getSiteUrl } from '@/lib/site';
import './globals.css';

const siteUrl = getSiteUrl();
const displayFont = DM_Sans({ subsets: ['latin'], variable: '--font-display' });
const bodyFont = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' });
const monoFont = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Engineering Calculator Hub – Free Online Engineering Calculators',
    template: '%s | Engineering Calculator Hub',
  },
  description:
    'Free online engineering calculators for electrical engineering, physics, mathematics, and unit conversions. Fast, accurate, and easy to use tools for students and professionals.',
  keywords: [
    'engineering calculator',
    'ohms law calculator',
    'voltage divider',
    'scientific calculator',
    'resistor calculator',
    'unit converter',
    'electrical engineering tools',
  ],
  authors: [{ name: 'Engineering Calculator Hub' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Engineering Calculator Hub',
    title: 'Engineering Calculator Hub – Free Online Engineering Calculators',
    description:
      'Free online engineering calculators for electrical engineering, physics, math, and conversions.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Engineering Calculator Hub',
    description: 'Free online engineering calculators for students and professionals.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <head>
        {/* AdSense — only loaded when enabled */}
        {AD_CONFIG.enabled && AD_CONFIG.provider === 'adsense' && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CONFIG.adsense.publisherId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="font-body bg-white dark:bg-surface-950 text-surface-900 dark:text-surface-100 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
