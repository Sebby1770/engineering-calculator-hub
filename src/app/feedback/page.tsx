import type { Metadata } from 'next';
import Link from 'next/link';
import { absoluteUrl } from '@/lib/site';
import FeedbackForm from '@/components/feedback/FeedbackForm';

export const metadata: Metadata = {
  title: 'Feedback',
  description:
    'Report a bug, request a calculator, or share an idea to improve Engineering Calculator Hub.',
  alternates: { canonical: absoluteUrl('/feedback') },
};

export default function FeedbackPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
        Feedback
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-surface-900 dark:text-white">
        Help shape the hub
      </h1>
      <p className="mt-3 leading-relaxed text-surface-600 dark:text-surface-400">
        Found a bug, missing a calculator, or have an idea? Tell us below. If you prefer, you can
        also open an issue on{' '}
        <a
          href="https://github.com/Sebby1770/engineering-calculator-hub/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          GitHub
        </a>
        .
      </p>

      <div className="mt-8 rounded-xl border border-surface-200 bg-white p-6 shadow-sm dark:border-surface-800 dark:bg-surface-900">
        <FeedbackForm />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-surface-400 dark:text-surface-500">
        Your message (and email, if you choose to leave one) is stored securely so we can act on
        it. See the <Link href="/privacy" className="underline hover:text-brand-500">privacy policy</Link>{' '}
        for details.
      </p>
    </div>
  );
}
