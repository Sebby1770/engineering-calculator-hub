import type { Metadata } from 'next';
import Link from 'next/link';
import Stripe from 'stripe';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Payment Complete',
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl('/checkout/success') },
};

// Always verify the session server-side — never trust "the success URL was
// visited" as proof of payment.
export const dynamic = 'force-dynamic';

type CheckoutSuccessProps = {
  searchParams: Promise<{ session_id?: string }>;
};

async function getCheckoutSession(sessionId: string | undefined) {
  if (!sessionId || !/^cs_[a-zA-Z0-9_]{8,200}$/.test(sessionId)) return null;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  try {
    return await new Stripe(secretKey).checkout.sessions.retrieve(sessionId);
  } catch {
    return null;
  }
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessProps) {
  const { session_id: sessionId } = await searchParams;
  const session = await getCheckoutSession(sessionId);
  const paid = session?.payment_status === 'paid';
  const amount =
    paid && session?.amount_total != null && session.currency
      ? `${(session.amount_total / 100).toFixed(2)} ${session.currency.toUpperCase()}`
      : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <div
        className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ${
          paid
            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
            : 'bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400'
        }`}
      >
        {paid ? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        )}
      </div>

      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
        Checkout
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-surface-900 dark:text-white">
        {paid ? 'Payment confirmed' : session ? 'Payment processing' : 'Thanks for your support'}
      </h1>
      <p className="mt-4 text-surface-600 dark:text-surface-400">
        {paid
          ? 'Your payment went through — thank you for supporting Engineering Calculator Hub.'
          : session
            ? 'Stripe is still finalising your payment. You don’t need to do anything else.'
            : 'Thanks for supporting Engineering Calculator Hub.'}
      </p>

      {amount && (
        <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          {amount}
        </p>
      )}

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Back to calculators
        </Link>
      </div>
    </main>
  );
}
