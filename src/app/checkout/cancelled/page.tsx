import type { Metadata } from 'next';
import Link from 'next/link';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Checkout Cancelled',
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl('/checkout/cancelled') },
};

export default function CheckoutCancelledPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
        Checkout
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-surface-900 dark:text-white">
        Checkout cancelled
      </h1>
      <p className="mt-4 text-surface-600 dark:text-surface-400">
        No payment was made. You can keep using the calculators as usual.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
      >
        Back to calculators
      </Link>
    </main>
  );
}
