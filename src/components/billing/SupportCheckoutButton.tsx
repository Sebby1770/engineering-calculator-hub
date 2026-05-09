'use client';

import { useState } from 'react';

const stripeEnabled = process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'true';

export default function SupportCheckoutButton({ compact = false }: { compact?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!stripeEnabled) return null;

  const startCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;

      if (!response.ok || !data?.url) {
        throw new Error(data?.error || 'Checkout is not available right now.');
      }

      window.location.assign(data.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Checkout failed.');
      setLoading(false);
    }
  };

  return (
    <div className={compact ? '' : 'space-y-2'}>
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className={`inline-flex items-center justify-center rounded-lg bg-brand-600 font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70 ${
          compact ? 'h-9 px-3 text-sm' : 'px-4 py-2 text-sm'
        }`}
      >
        {loading ? 'Opening...' : 'Support'}
      </button>
      {error && !compact && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
