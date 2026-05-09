import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for Engineering Calculator Hub.',
  alternates: { canonical: absoluteUrl('/terms') },
};

const sections = [
  {
    title: 'Use of calculators',
    body: 'The calculators are provided for education, estimation, and general engineering reference. Always verify important calculations before using results in production, safety-critical, legal, or financial decisions.',
  },
  {
    title: 'No professional advice',
    body: 'The site does not provide professional engineering certification, design approval, or compliance advice.',
  },
  {
    title: 'Payments',
    body: 'When paid features or support payments are enabled, transactions are handled through Stripe Checkout. Refunds and billing support are handled by the site owner according to the offer shown at checkout.',
  },
  {
    title: 'Availability',
    body: 'The site may change, add, remove, or update calculators and integrations at any time.',
  },
  {
    title: 'Limitation of liability',
    body: 'The site is provided as-is, without warranties. Use it at your own discretion and validate results independently.',
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
        Terms
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-surface-900 dark:text-white">
        Terms of Use
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
