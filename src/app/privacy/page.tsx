import type { Metadata } from 'next';
import Link from 'next/link';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Engineering Calculator Hub handles your data: no accounts, no tracking by default, and clear disclosure of payments, feedback, ads, and local storage.',
  alternates: { canonical: absoluteUrl('/privacy') },
};

const REPO_URL = 'https://github.com/Sebby1770/engineering-calculator-hub';

const sections: { title: string; paragraphs: React.ReactNode[] }[] = [
  {
    title: 'The short version',
    paragraphs: [
      <>
        Engineering Calculator Hub works without an account. All calculators run in your browser —
        the numbers you type into them are processed on your device and are never sent to our
        servers. We collect data in exactly two situations, both started by you: when you make a
        voluntary support payment, and when you send feedback.
      </>,
    ],
  },
  {
    title: 'Information stored on your device',
    paragraphs: [
      <>
        Your theme preference (light/dark) and saved favorite calculators are kept in your
        browser&apos;s local storage. They never leave your device, and clearing your browser data
        removes them. We do not set any cookies ourselves.
      </>,
    ],
  },
  {
    title: 'Payments (Stripe)',
    paragraphs: [
      <>
        Optional support payments are processed by{' '}
        <a className="text-brand-600 hover:underline dark:text-brand-400" href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">
          Stripe
        </a>{' '}
        on Stripe&apos;s own checkout pages. Your card details go directly to Stripe and never touch
        our servers. After a completed payment, Stripe notifies us and we keep a minimal record:
        the checkout session ID, the amount, the currency, and the payment status. We do not store
        your name, email, or card information from payments.
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
        Payment records are retained for accounting purposes. Feedback is kept only as long as it
        is useful for improving the site. You can ask us to show or delete the data we hold about
        you (for example, a feedback message you sent) by opening an issue on{' '}
        <a className="text-brand-600 hover:underline dark:text-brand-400" href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        . If you are in a region with specific privacy rights (such as the GDPR or the Australian
        Privacy Act), those rights apply to this data.
      </>,
    ],
  },
  {
    title: 'Children',
    paragraphs: [
      <>
        The site is a general-audience educational tool and does not knowingly collect personal
        information from children. The only personal data we ever receive is what is voluntarily
        typed into the feedback form.
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
        For any privacy question or request, contact the site owner via{' '}
        <a className="text-brand-600 hover:underline dark:text-brand-400" href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer">
          GitHub issues
        </a>
        .
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
      <p className="mt-3 text-sm text-surface-500 dark:text-surface-400">Last updated June 10, 2026</p>

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
