import Link from 'next/link';
import { calculators } from '@/data/calculators';
import { categories } from '@/data/categories';
import { AdFooter } from '@/components/ads';
import SupportCheckoutButton from '@/components/billing/SupportCheckoutButton';
import type { Category } from '@/types';

const FOOTER_CATEGORY_IDS: Category[] = ['mechanical', 'civil', 'thermofluids', 'mathematics'];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-forge-700/25 bg-paper-100/50 dark:border-cyan-400/15 dark:bg-surface-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <AdFooter className="mb-10" />

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-forge-400 to-cyan-700 text-white ring-1 ring-forge-300/70">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="12" cy="12" r="3.2" />
                  <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                  <path d="M6.4 6.4l2.1 2.1M15.5 15.5l2.1 2.1M17.6 6.4l-2.1 2.1M8.5 15.5l-2.1 2.1" />
                </svg>
              </div>
              <span className="font-display font-bold text-surface-900 dark:text-white">
                EngCalc<span className="text-forge-600 dark:text-forge-300">Hub</span>
              </span>
            </div>
            <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
              Multi-discipline SI formulas, design workflows, and review-ready project sheets for mechanical, civil, thermofluids, materials, and electrical work.
            </p>
            <div className="mt-4">
              <SupportCheckoutButton />
            </div>
          </div>

          {FOOTER_CATEGORY_IDS.flatMap((id) => {
            const cat = categories.find((item) => item.id === id);
            return cat ? [cat] : [];
          }).map((cat) => (
            <div key={cat.id}>
              <h3 className="font-display font-semibold text-sm text-surface-900 dark:text-white mb-3">
                {cat.name}
              </h3>
              <ul className="space-y-2">
                {calculators
                  .filter((c) => c.meta.category === cat.id)
                  .map((calc) => (
                    <li key={calc.meta.slug}>
                      <Link
                        href={`/${calc.meta.slug}`}
                        className="text-sm text-surface-500 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                      >
                        {calc.meta.shortTitle}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-400">
            © {new Date().getFullYear()} Engineering Calculator Hub. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-surface-400">
            <Link href="/privacy" className="hover:text-brand-500 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-brand-500 transition-colors">Terms</Link>
            <Link href="/workspace" className="hover:text-brand-500 transition-colors">Workspace</Link>
            <Link href="/pricing" className="hover:text-brand-500 transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-brand-500 transition-colors">About</Link>
            <Link href="/feedback" className="hover:text-brand-500 transition-colors">Feedback</Link>
            <a
              href="https://github.com/Sebby1770/engineering-calculator-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-500 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
