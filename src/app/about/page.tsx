import type { Metadata } from 'next';
import Link from 'next/link';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About Engineering Calculator Hub',
  description:
    'Learn about Engineering Calculator Hub, a collection of fast, free calculators for engineering, physics, math, and conversions.',
  alternates: { canonical: absoluteUrl('/about') },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <section>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            About
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-surface-900 dark:text-white">
            Engineering tools that stay quick and clear
          </h1>
          <p className="mt-4 text-surface-600 dark:text-surface-400 leading-relaxed">
            Engineering Calculator Hub is built for students, engineers, makers, and anyone who needs
            dependable answers without digging through spreadsheets or bloated tools.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            ['Fast', 'Pages are optimized for quick loading and instant calculator feedback.'],
            ['Useful', 'Each calculator includes formulas, examples, and practical reference notes.'],
            ['Accessible', 'The tools are free to use and designed for phones, tablets, and desktops.'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-lg border border-surface-200 dark:border-surface-800 p-5">
              <h2 className="font-display font-semibold text-surface-900 dark:text-white">{title}</h2>
              <p className="mt-2 text-sm text-surface-600 dark:text-surface-400">{body}</p>
            </div>
          ))}
        </section>

        <section className="rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6">
          <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white">
            Start calculating
          </h2>
          <p className="mt-2 text-surface-600 dark:text-surface-400">
            Browse the full library of electrical, physics, math, signal, and conversion calculators.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            View calculators
          </Link>
        </section>
      </div>
    </main>
  );
}
