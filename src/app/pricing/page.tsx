import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing – Free Calculators and Engineering Workspace Pro',
  description:
    'Use every engineering calculator free. Upgrade to Pro for secure cloud projects, device-to-device recovery, and cloud-backed professional calculation sheets.',
};

const comparison = [
  ['All 41 calculators', true, true],
  ['Transparent formulas and worked steps', true, true],
  ['Local design projects', true, true],
  ['CSV, JSON, and print-to-PDF export', true, true],
  ['Secure cloud workspace backup', false, true],
  ['Sync up to 100 projects', false, true],
  ['Cloud-backed design worksheets', false, true],
  ['Restore projects on another device', false, true],
  ['Priority feature requests', false, true],
] as const;

export default function PricingPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative border-b border-surface-200 bg-surface-950 text-white dark:border-surface-800">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" aria-hidden="true" />
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-300">Simple founding pricing</p>
          <h1 className="mx-auto mt-4 max-w-4xl font-display text-4xl font-bold tracking-tight sm:text-6xl">
            The formulas stay free. Pro pays for the engineering workflow.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-surface-300">
            Calculate without an account. Upgrade when you need cloud-backed projects, reusable design work, and review-ready outputs.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-3xl border border-surface-200 bg-white p-7 shadow-sm dark:border-surface-800 dark:bg-surface-900">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-surface-400">Free</p>
            <div className="mt-4 flex items-end gap-2">
              <span className="font-display text-5xl font-bold text-surface-950 dark:text-white">$0</span>
              <span className="pb-1 text-surface-400">forever</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-surface-500 dark:text-surface-400">
              For quick answers, learning, and local project notes. No account required.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-surface-700 dark:text-surface-300">
              {['All calculators and worked steps', 'Local-first Engineering Workspace', 'CSV, JSON, and PDF-ready export', 'Shareable calculator links'].map((feature) => (
                <li key={feature} className="flex gap-2"><span className="text-emerald-500">✓</span>{feature}</li>
              ))}
            </ul>
            <Link href="/#calculators" className="mt-8 inline-flex w-full justify-center rounded-xl border border-surface-300 px-5 py-3 text-sm font-semibold text-surface-700 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800">
              Start calculating
            </Link>
          </article>

          <article className="relative rounded-3xl border-2 border-brand-500 bg-white p-7 shadow-2xl shadow-brand-500/15 dark:bg-surface-900">
            <div className="absolute right-5 top-5 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700 dark:bg-brand-950 dark:text-brand-300">Best for individuals</div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">Pro</p>
            <div className="mt-4 flex items-end gap-2">
              <span className="font-display text-5xl font-bold text-surface-950 dark:text-white">$9</span>
              <span className="pb-1 text-surface-400">USD / month</span>
            </div>
            <p className="mt-2 text-xs font-semibold text-brand-600 dark:text-brand-400">Founding target: $72/year when annual billing launches.</p>
            <p className="mt-4 text-sm leading-relaxed text-surface-500 dark:text-surface-400">
              For engineers who want their calculations organised, backed up, and ready to review.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-surface-700 dark:text-surface-300">
              {['Everything in Free', 'Secure cloud workspace backup', 'Sync up to 100 design projects', 'Restore work on another device', 'Cloud-backed design worksheets', 'Priority feature requests'].map((feature) => (
                <li key={feature} className="flex gap-2"><span className="text-brand-500">✓</span>{feature}</li>
              ))}
            </ul>
            <Link href="/account" className="mt-8 inline-flex w-full justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700">
              Start with Pro
            </Link>
            <p className="mt-3 text-center text-xs text-surface-400">Secure checkout and self-service cancellation through Stripe.</p>
          </article>

          <article className="rounded-3xl border border-surface-200 bg-surface-50 p-7 dark:border-surface-800 dark:bg-surface-950/50">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-surface-400">Teams & embeds</p>
            <div className="mt-4 font-display text-4xl font-bold text-surface-950 dark:text-white">Coming next</div>
            <p className="mt-4 text-sm leading-relaxed text-surface-500 dark:text-surface-400">
              Shared templates, approvals, branded reports, and white-label calculators for hardware manufacturers and engineering teams.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-surface-700 dark:text-surface-300">
              {['Team calculation libraries', 'Review and approval history', 'Branded PDF calculation sheets', 'Embeddable and white-label tools', 'API and partner integrations'].map((feature) => (
                <li key={feature} className="flex gap-2"><span className="text-surface-400">→</span>{feature}</li>
              ))}
            </ul>
            <Link href="/feedback" className="mt-8 inline-flex w-full justify-center rounded-xl border border-surface-300 px-5 py-3 text-sm font-semibold text-surface-700 hover:bg-white dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-900">
              Join the design-partner list
            </Link>
          </article>
        </div>

        <div className="mt-20">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">Compare plans</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-surface-950 dark:text-white">Useful before you pay. Valuable when you do.</h2>
          </div>
          <div className="mt-8 overflow-hidden rounded-2xl border border-surface-200 dark:border-surface-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-50 text-surface-500 dark:bg-surface-900 dark:text-surface-400">
                <tr>
                  <th className="px-5 py-4 font-semibold">Capability</th>
                  <th className="px-5 py-4 text-center font-semibold">Free</th>
                  <th className="px-5 py-4 text-center font-semibold text-brand-600 dark:text-brand-400">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 bg-white dark:divide-surface-800 dark:bg-surface-950">
                {comparison.map(([feature, free, pro]) => (
                  <tr key={feature}>
                    <td className="px-5 py-4 font-medium text-surface-700 dark:text-surface-200">{feature}</td>
                    <td className="px-5 py-4 text-center text-surface-500 dark:text-surface-400">{free === true ? '✓' : free === false ? '—' : free}</td>
                    <td className="px-5 py-4 text-center font-bold text-brand-600 dark:text-brand-400">{pro === true ? '✓' : pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-20 grid gap-8 rounded-3xl bg-surface-950 p-8 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-300">Try the workflow first</p>
            <h2 className="mt-3 font-display text-3xl font-bold">Build a calculation sheet before creating an account.</h2>
            <p className="mt-3 max-w-2xl text-surface-300">The workspace saves locally on your device. Upgrade only when cloud backup and synced projects become useful.</p>
          </div>
          <Link href="/workspace" className="inline-flex justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-surface-950 hover:bg-brand-50">
            Open Engineering Workspace
          </Link>
        </div>
      </section>
    </div>
  );
}
