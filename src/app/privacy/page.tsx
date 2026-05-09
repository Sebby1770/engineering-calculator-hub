import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Engineering Calculator Hub.',
  alternates: { canonical: absoluteUrl('/privacy') },
};

const sections = [
  {
    title: 'Information we collect',
    body: 'The calculators run in your browser and do not require an account. If analytics, ads, or payments are enabled, those providers may process technical data needed to deliver their services.',
  },
  {
    title: 'Local storage',
    body: 'Favorites and theme preferences may be stored on your device so the site can remember your choices between visits.',
  },
  {
    title: 'Payments',
    body: 'Stripe Checkout handles payments when support or paid features are enabled. Card details are submitted directly to Stripe and are not stored by this site.',
  },
  {
    title: 'Ads and analytics',
    body: 'Advertising and analytics integrations are optional and controlled by deployment environment variables. Provider privacy terms apply when those integrations are active.',
  },
  {
    title: 'Contact',
    body: 'For privacy questions, contact the site owner through the GitHub repository or the published contact channel for this project.',
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
        Privacy
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-surface-900 dark:text-white">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-surface-500 dark:text-surface-400">
        Last updated May 9, 2026
      </p>
      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl font-semibold text-surface-900 dark:text-white">
              {section.title}
            </h2>
            <p className="mt-2 text-surface-600 dark:text-surface-400 leading-relaxed">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
