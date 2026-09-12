import Link from 'next/link';
import { getPopularCalculators } from '@/data/calculators';

export default function NotFound() {
  const popular = getPopularCalculators().slice(0, 4);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-forge-700 dark:text-cyan-300">Plate missing</p>
      <div className="mb-4 font-display text-8xl font-extrabold text-forge-800/20 dark:text-cyan-200/15">404</div>
      <h1 className="mb-2 font-display text-3xl font-extrabold text-surface-900 dark:text-white">
        That plate is not on this bench
      </h1>
      <p className="mb-6 max-w-md text-surface-500 dark:text-surface-400">
        The calculator you asked for is not in the catalogue, or the stamp has moved.
      </p>
      <Link
        href="/"
        className="bg-forge-800 px-6 py-3 font-bold text-paper-50 shadow-[4px_4px_0_0_rgb(176,138,46)] transition hover:translate-x-px hover:translate-y-px"
      >
        Back to the workshop
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
