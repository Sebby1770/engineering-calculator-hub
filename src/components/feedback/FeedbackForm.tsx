'use client';

import { useState } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;

export default function FeedbackForm() {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — humans never see it
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const trimmed = message.trim();
  const canSubmit = trimmed.length >= MESSAGE_MIN && trimmed.length <= MESSAGE_MAX && status !== 'sending';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus('sending');
    setError('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, email: email.trim(), website }),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to send feedback right now.');
      }

      setStatus('sent');
      setMessage('');
      setEmail('');
    } catch (submitError) {
      setStatus('error');
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong.');
    }
  };

  if (status === 'sent') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900/50 dark:bg-emerald-950/30">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="font-display text-lg font-bold text-surface-900 dark:text-white">
          Feedback sent — thank you!
        </h2>
        <p className="mt-1 text-sm text-surface-600 dark:text-surface-400">
          Every message gets read and helps decide what to build next.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 rounded-md border border-surface-300 px-4 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-white dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label htmlFor="feedback-message" className="text-sm font-medium text-surface-700 dark:text-surface-300">
            Your feedback <span className="text-red-500">*</span>
          </label>
          <span
            className={`text-xs ${
              trimmed.length > MESSAGE_MAX ? 'text-red-500' : 'text-surface-400'
            }`}
          >
            {trimmed.length}/{MESSAGE_MAX}
          </span>
        </div>
        <textarea
          id="feedback-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          required
          minLength={MESSAGE_MIN}
          maxLength={MESSAGE_MAX + 100}
          placeholder="A bug, a calculator you're missing, or anything that would make the site more useful…"
          className="w-full rounded-lg border border-surface-300 bg-white px-4 py-3 text-base outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-surface-700 dark:bg-surface-900 dark:focus:ring-brand-900"
        />
        {trimmed.length > 0 && trimmed.length < MESSAGE_MIN && (
          <p className="mt-1 text-xs text-surface-400">
            At least {MESSAGE_MIN} characters ({MESSAGE_MIN - trimmed.length} to go).
          </p>
        )}
      </div>

      <div>
        <label htmlFor="feedback-email" className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
          Email <span className="font-normal text-surface-400">(optional — only if you&apos;d like a reply)</span>
        </label>
        <input
          id="feedback-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-surface-300 bg-white px-4 py-3 text-base outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-surface-700 dark:bg-surface-900 dark:focus:ring-brand-900"
        />
      </div>

      {/* Honeypot field — hidden from humans, bots tend to fill it. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="feedback-website">Website</label>
        <input
          id="feedback-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      {status === 'error' && error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'sending' ? 'Sending…' : 'Send feedback'}
      </button>
    </form>
  );
}
