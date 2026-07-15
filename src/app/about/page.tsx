import type { Metadata } from 'next';
import Link from 'next/link';
import { absoluteUrl } from '@/lib/site';
import { calculators } from '@/data/calculators';
import { categories } from '@/data/categories';
import CategoryIcon from '@/components/ui/CategoryIcon';

export const metadata: Metadata = {
  title: 'About Engineering Calculator Hub',
  description:
    'Learn about Engineering Calculator Hub, a transparent calculation workspace for engineering design, documentation, and review.',
  alternates: { canonical: absoluteUrl('/about') },
};

const REPO_URL = 'https://github.com/Sebby1770/engineering-calculator-hub';

export default function AboutPage() {
  const populatedCategories = categories.filter((category) =>
    calculators.some((calc) => calc.meta.category === category.id)
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <section>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            About
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-surface-900 dark:text-white">
            Engineering calculations that stay transparent and connected
          </h1>
          <p className="mt-4 leading-relaxed text-surface-600 dark:text-surface-400">
            Engineering Calculator Hub is built for students, engineers, makers, and anyone who
            needs dependable answers without rebuilding the same spreadsheet. Today
            the library covers {calculators.length} calculators across{' '}
            {populatedCategories.length} categories — every one with its formula, a worked example,
            and FAQs. Results can be collected into a local-first project sheet with assumptions
            and exports for review.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            ['Fast', 'Every page is statically generated and the math runs instantly in your browser.'],
            ['Local-first', 'Calculations and project sheets stay on your device unless you explicitly use optional Pro cloud sync.'],
            ['Open', 'The entire site is open source under the MIT licence — read it, audit it, contribute.'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-lg border border-surface-200 p-5 dark:border-surface-800">
              <h2 className="font-display font-semibold text-surface-900 dark:text-white">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-surface-600 dark:text-surface-400">{body}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white">
            What&apos;s inside
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {populatedCategories.map((category) => {
              const count = calculators.filter((c) => c.meta.category === category.id).length;
              return (
                <Link
                  key={category.id}
                  href={`/?category=${category.id}`}
                  className="flex items-center gap-3 rounded-lg border border-surface-200 p-4 transition-colors hover:border-brand-300 dark:border-surface-800 dark:hover:border-brand-700"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${category.color} text-white`}
                  >
                    <CategoryIcon category={category.id} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-surface-900 dark:text-white">
                      {category.name}
                    </p>
                    <p className="text-sm text-surface-500 dark:text-surface-400">
                      {count} {count === 1 ? 'calculator' : 'calculators'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-surface-200 bg-surface-50 p-6 dark:border-surface-800 dark:bg-surface-900">
          <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white">
            Help it grow
          </h2>
          <p className="mt-2 leading-relaxed text-surface-600 dark:text-surface-400">
            Spotted a bug or missing a calculator you need? Send a note through the{' '}
            <Link className="text-brand-600 hover:underline dark:text-brand-400" href="/feedback">
              feedback form
            </Link>{' '}
            or open an issue on{' '}
            <a
              className="text-brand-600 hover:underline dark:text-brand-400"
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            . If the workflow saves you time, Pro adds secure cloud backup and device-to-device recovery.
          </p>
          <Link
            href="/workspace"
            className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Open the workspace
          </Link>
        </section>
      </div>
    </div>
  );
}
