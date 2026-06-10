import Link from 'next/link';
import { calculators } from '@/data/calculators';
import { categories } from '@/data/categories';
import { AdFooter } from '@/components/ads';
import SupportCheckoutButton from '@/components/billing/SupportCheckoutButton';

export default function Footer() {
  return (
    <footer className="border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <AdFooter className="mb-10" />

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-display font-bold text-xs">
                EC
              </div>
              <span className="font-display font-bold text-surface-900 dark:text-white">
                EngCalc<span className="text-brand-500">Hub</span>
              </span>
            </div>
            <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
              Free engineering calculators for students, engineers, and professionals. Fast, accurate, and easy to use.
            </p>
            <div className="mt-4">
              <SupportCheckoutButton />
            </div>
          </div>

          {/* Category links */}
          {categories.slice(0, 4).map((cat) => (
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
