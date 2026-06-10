import Link from 'next/link';
import { getPopularCalculators } from '@/data/calculators';

export default function NotFound() {
  const popular = getPopularCalculators().slice(0, 4);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 font-mono text-8xl font-bold text-surface-200 dark:text-surface-800">404</div>
      <h1 className="mb-2 font-display text-2xl font-bold text-surface-900 dark:text-white">
        Calculator Not Found
      </h1>
      <p className="mb-6 max-w-md text-surface-500 dark:text-surface-400">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-700"
      >
        ← Back to All Calculators
      </Link>

      {popular.length > 0 && (
        <div className="mt-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-surface-400">
            Popular calculators
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {popular.map((calc) => (
              <Link
                key={calc.meta.slug}
                href={`/${calc.meta.slug}`}
                className="rounded-md border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-colors hover:border-brand-300 hover:text-brand-600 dark:border-surface-700 dark:text-surface-300 dark:hover:border-brand-700 dark:hover:text-brand-400"
              >
                {calc.meta.shortTitle}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
