'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabaseClient';

type GateState = 'checking' | 'allowed' | 'locked';

// Wraps a Pro calculator. Subscription state is verified server-side via
// /api/me/subscription. If accounts/billing aren't configured at all, the
// gate fails open so the site works before SaaS setup is complete.
//
// Note: the calculators run client-side, so this gate is a product/UX
// boundary, not a hard security boundary — see SECURITY.md.
export default function ProGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GateState>('checking');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getSupabaseBrowser();
      if (!supabase) {
        if (!cancelled) setState('allowed');
        return;
      }
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          if (!cancelled) setState('locked');
          return;
        }
        const response = await fetch('/api/me/subscription', {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });
        const sub = (await response.json().catch(() => null)) as
          | { configured?: boolean; active?: boolean }
          | null;
        const allowed = sub?.configured === false || sub?.active === true;
        if (!cancelled) setState(allowed ? 'allowed' : 'locked');
      } catch {
        if (!cancelled) setState('locked');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'allowed') return <>{children}</>;

  if (state === 'checking') {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-surface-400">
        Checking your access…
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-8 text-center dark:border-brand-900/50 dark:from-brand-950/30 dark:to-surface-900">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      </div>
      <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white">
        This calculator is part of Pro
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-surface-600 dark:text-surface-400">
        Sign in and upgrade to unlock premium calculators and support continued development.
      </p>
      <Link
        href="/account"
        className="mt-5 inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        Sign in / Upgrade
      </Link>
    </div>
  );
}
