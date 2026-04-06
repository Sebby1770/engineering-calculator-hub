import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="font-mono text-8xl font-bold text-surface-200 dark:text-surface-800 mb-4">404</div>
      <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2">
        Calculator Not Found
      </h1>
      <p className="text-surface-500 dark:text-surface-400 mb-6 max-w-md">
        The calculator you&apos;re looking for doesn&apos;t exist or may have been moved. Browse our full collection below.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
        ← Back to All Calculators
      </Link>
    </div>
  );
}
