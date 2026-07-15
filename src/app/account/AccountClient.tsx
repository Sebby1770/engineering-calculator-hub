'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowser } from '@/lib/supabaseClient';

interface SubscriptionState {
  configured: boolean;
  active: boolean;
  status: string | null;
  currentPeriodEnd: string | null;
  hasBilling: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AccountClient() {
  const supabase = getSupabaseBrowser();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [email, setEmail] = useState('');
  const [linkSent, setLinkSent] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [busy, setBusy] = useState<'signin' | 'upgrade' | 'portal' | null>(null);
  const [error, setError] = useState('');
  const [upgraded, setUpgraded] = useState(false);

  useEffect(() => {
    setUpgraded(new URLSearchParams(window.location.search).get('upgraded') === '1');
  }, []);

  // Track the auth session.
  useEffect(() => {
    if (!supabase) {
      setSessionLoaded(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoaded(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  // Load subscription state whenever we have a session.
  const refreshSubscription = useCallback(async () => {
    if (!session) {
      setSubscription(null);
      return;
    }
    try {
      const response = await fetch('/api/me/subscription', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) {
        setSubscription(null);
        return;
      }
      setSubscription((await response.json()) as SubscriptionState);
    } catch {
      setSubscription(null);
    }
  }, [session]);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  const sendMagicLink = async () => {
    if (!supabase) return;
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setBusy('signin');
    setError('');
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: `${window.location.origin}/account` },
      });
      if (otpError) throw otpError;
      setLinkSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the sign-in link.');
    } finally {
      setBusy(null);
    }
  };

  const callBilling = async (endpoint: 'subscribe' | 'portal') => {
    if (!session) return;
    setBusy(endpoint === 'subscribe' ? 'upgrade' : 'portal');
    setError('');
    try {
      const response = await fetch(`/api/billing/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!response.ok || !data?.url) {
        throw new Error(data?.error || 'Billing is not available right now.');
      }
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Billing request failed.');
      setBusy(null);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSubscription(null);
    setLinkSent(false);
  };

  const isPro = subscription?.active === true;
  const periodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
        Account
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-surface-900 dark:text-white">
        {session ? 'Your account' : 'Sign in'}
      </h1>

      {!supabase ? (
        <div className="mt-8 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-6 text-surface-600 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-400">
          Accounts are not configured on this deployment. Set{' '}
          <code className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable
          sign-in.
        </div>
      ) : !sessionLoaded ? (
        <p className="mt-8 text-surface-500 dark:text-surface-400">Loading…</p>
      ) : !session ? (
        <div className="mt-8 rounded-xl border border-surface-200 bg-white p-6 shadow-sm dark:border-surface-800 dark:bg-surface-900">
          {linkSent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
              </div>
              <h2 className="font-display text-lg font-bold text-surface-900 dark:text-white">
                Check your inbox
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-surface-600 dark:text-surface-400">
                We sent a sign-in link to <strong>{email.trim()}</strong>. Open it on this device
                to finish signing in — no password needed.
              </p>
              <button
                type="button"
                onClick={() => setLinkSent(false)}
                className="mt-4 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-surface-600 dark:text-surface-400">
                Enter your email and we&apos;ll send you a one-time sign-in link. No password to
                remember.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') sendMagicLink();
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-lg border border-surface-300 bg-white px-4 py-2.5 text-base outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-surface-700 dark:bg-surface-950 dark:focus:ring-brand-900"
                />
                <button
                  type="button"
                  onClick={sendMagicLink}
                  disabled={busy === 'signin'}
                  className="shrink-0 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy === 'signin' ? 'Sending…' : 'Send sign-in link'}
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {upgraded && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
              Payment received — your Pro access activates as soon as Stripe confirms it (usually
              within seconds). Refresh this page if it doesn&apos;t show yet.
            </div>
          )}

          {/* Identity */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-surface-200 bg-white p-5 shadow-sm dark:border-surface-800 dark:bg-surface-900">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">
                Signed in as
              </p>
              <p className="truncate font-medium text-surface-900 dark:text-white">
                {session.user.email}
              </p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="shrink-0 rounded-lg border border-surface-300 px-4 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800"
            >
              Sign out
            </button>
          </div>

          {/* Plan */}
          <div className="rounded-xl border border-surface-200 bg-white p-5 shadow-sm dark:border-surface-800 dark:bg-surface-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">
                  Plan
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-display text-xl font-bold text-surface-900 dark:text-white">
                    {isPro ? 'Pro' : 'Free'}
                  </span>
                  {isPro && (
                    <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                      {subscription?.status}
                    </span>
                  )}
                </div>
                {isPro && periodEnd && (
                  <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                    Renews {periodEnd}
                  </p>
                )}
                {!isPro && (
                  <p className="mt-1 max-w-md text-sm leading-relaxed text-surface-500 dark:text-surface-400">
                    Every core calculator stays free. Pro adds secure cloud workspace backup,
                    up to 100 synced projects, device-to-device recovery, and priority requests.
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {!isPro && (
                <button
                  type="button"
                  onClick={() => callBilling('subscribe')}
                  disabled={busy === 'upgrade'}
                  className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy === 'upgrade' ? 'Opening checkout…' : 'Upgrade to Pro'}
                </button>
              )}
              {!isPro && (
                <Link
                  href="/pricing"
                  className="rounded-lg border border-surface-300 px-5 py-2.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800"
                >
                  Compare plans
                </Link>
              )}
              {subscription?.hasBilling && (
                <button
                  type="button"
                  onClick={() => callBilling('portal')}
                  disabled={busy === 'portal'}
                  className="rounded-lg border border-surface-300 px-5 py-2.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800"
                >
                  {busy === 'portal' ? 'Opening…' : 'Manage billing'}
                </button>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      )}

      {error && !session && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
