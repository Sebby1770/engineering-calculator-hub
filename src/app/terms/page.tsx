import type { Metadata } from 'next';
import Link from 'next/link';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'Terms of use for Engineering Calculator Hub: acceptable use, accuracy disclaimer, donations, and limitation of liability.',
  alternates: { canonical: absoluteUrl('/terms') },
};

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. Acceptance of these terms',
    body: 'By using Engineering Calculator Hub, you agree to these terms. If you do not agree, please do not use the site.',
  },
  {
    title: '2. The service',
    body: 'The site provides free online calculators, explanatory formulas, examples, and a local Engineering Workspace. Core calculators run in your browser and require no account. Optional account, cloud-sync, and subscription features use online services.',
  },
  {
    title: '3. Accuracy disclaimer — important',
    body: 'Results are provided for education, estimation, and general reference only. They are not a substitute for professional engineering judgment. Always verify calculations independently before relying on them in production, safety-critical, regulatory, medical, legal, or financial contexts. The site does not provide professional engineering certification, design approval, or compliance advice.',
  },
  {
    title: '4. Acceptable use',
    body: 'You agree not to misuse the site — including attempting to gain unauthorised access, probing or attacking the infrastructure, scraping at a volume that degrades the service, abusing the feedback or payment endpoints, or using the site for any unlawful purpose.',
  },
  {
    title: '5. Payments and subscriptions',
    body: 'Stripe processes voluntary support payments and paid Pro subscriptions. The price, billing interval, and any promotion are shown before checkout. Pro renews until cancelled; subscribers can manage or cancel through the Stripe Billing Portal linked from their account. Cancellation stops future renewal and access follows the billing status reported by Stripe. Refunds are assessed under applicable law and the checkout terms; nothing here limits mandatory consumer guarantees.',
  },
  {
    title: '6. Accounts and your content',
    body: 'You are responsible for access to the email account used for passwordless sign-in and for promptly reporting suspected unauthorised access. You retain ownership of project names, notes, and other content you enter. You grant us and our processors only the limited permission needed to host, back up, transmit, and return that content while providing the service. Keep your own export of important work.',
  },
  {
    title: '7. Intellectual property and open source',
    body: 'Repository source code is licensed under the MIT licence as stated in the repository. That licence governs use of the covered code and materials; it does not transfer ownership of third-party names, trademarks, provider services, or material identified under another licence.',
  },
  {
    title: '8. Third-party services',
    body: 'The site relies on third-party services, including Vercel for hosting, Supabase for accounts and cloud data, and Stripe for payments. Those providers have their own terms and privacy policies. We are not responsible for their independent services.',
  },
  {
    title: '9. No warranty',
    body: 'The site is provided "as is" and "as available", without warranties of any kind, express or implied, including fitness for a particular purpose, accuracy, or uninterrupted availability. Calculators and features may change or be removed at any time.',
  },
  {
    title: '10. Limitation of liability',
    body: 'To the maximum extent permitted by law, the site owner is not liable for any loss or damage arising from use of the site or reliance on its results, including indirect, incidental, or consequential damage. Nothing in these terms excludes liability that cannot be excluded under applicable law (including the Australian Consumer Law, where it applies).',
  },
  {
    title: '11. Suspension and service changes',
    body: 'We may restrict abusive access, suspend an account that threatens the service or other users, and change or discontinue features. Where practical, paid users will receive reasonable notice of a material change. You remain responsible for exporting important project data rather than treating cloud sync as the only copy.',
  },
  {
    title: '12. Governing law',
    body: 'These terms are governed by the applicable laws of Australia, without excluding any mandatory law that applies where you live. The parties should first try to resolve a dispute in good faith. Nothing prevents either party from using a tribunal, court, regulator, or consumer-protection process available under law.',
  },
  {
    title: '13. Changes to these terms',
    body: 'These terms may be updated from time to time. Continued use of the site after an update constitutes acceptance of the revised terms. The date below shows the latest revision.',
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
        Terms
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-surface-900 dark:text-white">
        Terms of Use
      </h1>
      <p className="mt-3 text-sm text-surface-500 dark:text-surface-400">Last updated July 15, 2026</p>

      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl font-semibold text-surface-900 dark:text-white">
              {section.title}
            </h2>
            <p className="mt-2 leading-relaxed text-surface-600 dark:text-surface-400">{section.body}</p>
          </section>
        ))}

        <section>
          <h2 className="font-display text-xl font-semibold text-surface-900 dark:text-white">
            14. Contact
          </h2>
          <p className="mt-2 leading-relaxed text-surface-600 dark:text-surface-400">
            Questions about these terms? Use the{' '}
            <Link
              className="text-brand-600 hover:underline dark:text-brand-400"
              href="/feedback"
            >
              private feedback form
            </Link>
            . Do not include account details or personal information in a public GitHub issue.
          </p>
        </section>
      </div>
    </div>
  );
}
