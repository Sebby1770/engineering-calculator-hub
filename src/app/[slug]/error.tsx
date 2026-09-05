'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function CalculatorPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[55vh] max-w-2xl items-center px-4 py-16 sm:px-6">
      <div className="w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/60 dark:bg-surface-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-600 dark:bg-red-950/50 dark:text-red-300" aria-hidden="true">!</div>
        <h1 className="mt-5 font-display text-2xl font-bold text-surface-950 dark:text-white">This calculator did not load</h1>
        <p className="mt-2 text-surface-600 dark:text-surface-400">
          Your saved workspace is unaffected. Retry the calculator, or choose another tool from the library.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700">
            Try again
          </button>
          <Link href="/" className="rounded-lg border border-surface-300 px-5 py-3 text-sm font-bold text-surface-700 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800">
            Browse calculators
          </Link>
        </div>
      </div>
    </div>
  );
}
