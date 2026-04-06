'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { CalculatorConfig } from '@/types';
import { getRelatedCalculators } from '@/data/calculators';
import { categories } from '@/data/categories';
import CopyButton from '@/components/ui/CopyButton';
import ShareButton from '@/components/ui/ShareButton';
import FavoriteButton from '@/components/ui/FavoriteButton';
import CalculatorCard from '@/components/ui/CalculatorCard';
import { AdBanner, AdSidebar, AdInContent, AdBetweenCards } from '@/components/ads';

interface CalculatorLayoutProps {
  config: CalculatorConfig;
  result?: string;
  children: ReactNode;
}

export default function CalculatorLayout({ config, result, children }: CalculatorLayoutProps) {
  const { meta, formula, formulaExplanation, exampleUsage, faqs, relatedSlugs } = config;
  const related = getRelatedCalculators(relatedSlugs);
  const cat = categories.find((c) => c.id === meta.category);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-surface-500 dark:text-surface-400">
          <li><Link href="/" className="hover:text-brand-500 transition-colors">Home</Link></li>
          <li><span className="mx-1">/</span></li>
          <li><Link href={`/#${meta.category}`} className="hover:text-brand-500 transition-colors">{cat?.name}</Link></li>
          <li><span className="mx-1">/</span></li>
          <li className="text-surface-900 dark:text-white font-medium truncate">{meta.shortTitle}</li>
        </ol>
      </nav>

      {/* Top banner ad */}
      <AdBanner className="mb-6" />

      {/* Main content with sidebar */}
      <div className="flex gap-8">
        {/* Main column */}
        <div className="flex-1 min-w-0">
          {/* Title & actions */}
          <div className="mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-2">
              {meta.shortTitle} Calculator
            </h1>
            <p className="text-surface-600 dark:text-surface-400 leading-relaxed max-w-2xl">
              {meta.description}
            </p>
            <div className="flex items-center gap-2 mt-3">
              {result && <CopyButton text={result} />}
              <ShareButton title={meta.title} />
              <FavoriteButton slug={meta.slug} />
            </div>
          </div>

          {/* Calculator UI */}
          <div className="rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-5 sm:p-6 mb-8 shadow-sm">
            {children}
          </div>

          {/* In-content ad */}
          <AdInContent className="mb-8" />

          {/* Formula */}
          <section className="mb-8">
            <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white mb-3">
              Formula
            </h2>
            <div className="rounded-lg bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 p-4 mb-3">
              <code className="font-mono text-lg text-brand-600 dark:text-brand-400 font-semibold">
                {formula}
              </code>
            </div>
            <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
              {formulaExplanation}
            </p>
          </section>

          {/* Example */}
          <section className="mb-8">
            <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white mb-3">
              Example Usage
            </h2>
            <div className="rounded-lg bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800 p-4">
              <p className="text-surface-700 dark:text-surface-300 leading-relaxed">
                {exampleUsage}
              </p>
            </div>
          </section>

          {/* FAQ */}
          {faqs.length > 0 && (
            <section className="mb-8">
              <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900"
                  >
                    <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-surface-900 dark:text-white font-medium">
                      {faq.question}
                      <svg
                        className="w-5 h-5 text-surface-400 shrink-0 ml-2 group-open:rotate-180 transition-transform"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-4 text-surface-600 dark:text-surface-400 leading-relaxed border-t border-surface-100 dark:border-surface-800 pt-3">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Related calculators */}
          {related.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white mb-4">
                Related Calculators
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {related.slice(0, 2).map((r) => (
                  <CalculatorCard key={r.meta.slug} meta={r.meta} />
                ))}
              </div>
              {related.length > 2 && (
                <>
                  <AdBetweenCards className="my-4" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {related.slice(2).map((r) => (
                      <CalculatorCard key={r.meta.slug} meta={r.meta} />
                    ))}
                  </div>
                </>
              )}
            </section>
          )}
        </div>

        {/* Sidebar ad — desktop only */}
        <aside className="hidden xl:block w-[300px] shrink-0">
          <AdSidebar />
        </aside>
      </div>
    </div>
  );
}
