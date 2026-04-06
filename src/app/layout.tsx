import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AD_CONFIG } from '@/lib/adConfig';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://engineeringcalculatorhub.com'),
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
    url: 'https://engineeringcalculatorhub.com',
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
  alternates: { canonical: 'https://engineeringcalculatorhub.com' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..800;1,9..40,300..800&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
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
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
