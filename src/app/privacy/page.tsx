import type { Metadata } from 'next';
import Link from 'next/link';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Engineering Calculator Hub handles local projects, optional accounts, cloud sync, payments, feedback, hosting data, and future advertising.',
  alternates: { canonical: absoluteUrl('/privacy') },
};

const sections: { title: string; paragraphs: React.ReactNode[] }[] = [
  {
    title: 'The short version',
    paragraphs: [
      <>
        Engineering Calculator Hub works without an account. Calculator inputs are processed in
        your browser and are not sent to our servers merely because you calculate a result. Data is
        sent only when you choose an online feature: signing in, syncing a Pro workspace (which can
        include saved results and notes), starting a Stripe payment or subscription, or sending
        feedback.
      </>,
    ],
  },
  {
    title: 'Information stored on your device',
    paragraphs: [
      <>
        Your theme preference, saved favorite calculators, and Engineering Workspace projects are
        kept in your browser&apos;s local storage. Workspace data can include calculator names,
        formulas, results, project descriptions, and notes you write. It stays on that device
        unless you explicitly use Pro cloud sync. Clearing this site&apos;s browser data removes the
        local copy.
      </>,
    ],
  },
  {
    title: 'Accounts and Pro cloud sync (Supabase)',
    paragraphs: [
      <>
        Passwordless accounts are provided by{' '}
        <a className="text-brand-600 hover:underline dark:text-brand-400" href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
          Supabase
        </a>
        . When you sign in, Supabase processes your email address and authentication session. We
        keep a profile record containing your account ID, email, Stripe customer identifier, and
        subscription identifier, status, and latest billing-event time.
      </>,
      <>
        Pro cloud sync is manual. Choosing “Save cloud” uploads the complete workspace document
        shown in your browser; choosing “Load cloud” downloads the latest stored copy. Private
        workspace tables are not directly accessible from the browser and every sync request is
        authenticated and subscription-checked by our server.
      </>,
    ],
  },
  {
    title: 'Payments (Stripe)',
    paragraphs: [
      <>
        Optional support payments and Pro subscriptions are processed by{' '}
        <a className="text-brand-600 hover:underline dark:text-brand-400" href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">
          Stripe
        </a>{' '}
        on Stripe&apos;s own checkout pages. Your card details go directly to Stripe and never touch
        our servers. For subscriptions, we keep the Stripe customer identifier, price identifier,
        subscription status, and current billing-period end so we can grant Pro access. One-off
        support payments keep the checkout session ID, amount, currency, and payment status. We do
        not store card details.
      </>,
    ],
  },
  {
    title: 'Feedback',
    paragraphs: [
      <>
        If you use the <Link className="text-brand-600 hover:underline dark:text-brand-400" href="/feedback">feedback form</Link>,
        we store the message you write and — only if you choose to provide it — your email address,
        so we can reply. Feedback is used solely to improve the site and is never sold or shared
        for marketing.
      </>,
    ],
  },
  {
    title: 'Hosting and server logs',
    paragraphs: [
      <>
        The site is hosted on Vercel. Like any web host, Vercel processes basic technical request
        data (such as IP address and browser type) to deliver pages and protect against abuse. See
        the{' '}
        <a className="text-brand-600 hover:underline dark:text-brand-400" href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
          Vercel privacy policy
        </a>{' '}
        for details.
      </>,
    ],
  },
  {
    title: 'International processing',
    paragraphs: [
      <>
        Our providers operate internationally. The configured Supabase project is hosted in the
        United States (US East), and Vercel and Stripe may process data in other countries under
        their published privacy and data-transfer arrangements. By choosing an online feature,
        your relevant data may therefore be processed outside your country.
      </>,
    ],
  },
  {
    title: 'Security and incident response',
    paragraphs: [
      <>
        We use transport encryption, server-only credentials, signed payment webhooks, access
        controls, row-level database security, request validation, and rate limits. No internet
        service can promise absolute security. If we become aware of a data breach, we will assess
        it, contain it, notify affected people and regulators where legally required, and rotate
        affected credentials.
      </>,
    ],
  },
  {
    title: 'Advertising',
    paragraphs: [
      <>
        Advertising is <strong>disabled by default</strong> on this site. If ads are enabled in the
        future (e.g. Google AdSense), the ad provider may use cookies or similar identifiers to
        serve and measure ads, and this policy will be updated with the relevant disclosures and
        consent options where required by law. Until then, no advertising scripts are loaded.
      </>,
    ],
  },
  {
    title: 'Analytics',
    paragraphs: [<>We do not run any analytics or tracking scripts.</>],
  },
  {
    title: 'Data retention and your rights',
    paragraphs: [
      <>
        Payment records are retained for accounting and fraud-prevention purposes. Account,
        workspace, and feedback data are kept while the relevant feature remains active or useful.
        You can remove local workspace data by clearing this site&apos;s browser storage. You can ask
        us to access, correct, export, or delete account, cloud-workspace, or feedback data through
        the private <Link className="text-brand-600 hover:underline dark:text-brand-400" href="/feedback">feedback form</Link>.
        We will verify your identity before changing account-linked data. Some payment and security
        records may be retained where required for tax, accounting, dispute, or fraud-prevention
        purposes.
      </>,
    ],
  },
  {
    title: 'Children',
    paragraphs: [
      <>
        The site is a general-audience engineering and educational tool and does not knowingly
        collect personal information from children.
      </>,
    ],
  },
  {
    title: 'Changes to this policy',
    paragraphs: [
      <>
        If our data practices change (for example, if advertising is enabled), this page will be
        updated and the date below revised.
      </>,
    ],
  },
  {
    title: 'Contact',
    paragraphs: [
      <>
        For a privacy question, complaint, or data request, use the{' '}
        <Link className="text-brand-600 hover:underline dark:text-brand-400" href="/feedback">
          private feedback form
        </Link>
        . Do not place personal information in a public GitHub issue. We will investigate privacy
        complaints and respond within a reasonable period.
      </>,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
        Privacy
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-surface-900 dark:text-white">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-surface-500 dark:text-surface-400">Last updated July 15, 2026</p>

      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl font-semibold text-surface-900 dark:text-white">
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph, index) => (
              <p key={index} className="mt-2 leading-relaxed text-surface-600 dark:text-surface-400">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
