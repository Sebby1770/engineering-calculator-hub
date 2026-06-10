import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'Terms of use for Engineering Calculator Hub: acceptable use, accuracy disclaimer, donations, and limitation of liability.',
  alternates: { canonical: absoluteUrl('/terms') },
};

const REPO_URL = 'https://github.com/Sebby1770/engineering-calculator-hub';

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. Acceptance of these terms',
    body: 'By using Engineering Calculator Hub, you agree to these terms. If you do not agree, please do not use the site.',
  },
  {
    title: '2. The service',
    body: 'The site provides free online calculators for engineering, physics, mathematics, and unit conversions, together with explanatory formulas, examples, and FAQs. The calculators run in your browser and no account is required.',
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
    title: '5. Donations',
    body: 'Support payments are voluntary donations processed by Stripe on Stripe’s checkout pages. They do not purchase goods, services, or any additional features. If something goes wrong with a payment, contact us and we will work with you to put it right.',
  },
  {
    title: '6. Intellectual property',
    body: 'The source code of this site is available under the MIT licence in the public repository. Site content (calculator explanations, examples, and FAQs) may be referenced with attribution; bulk republication is not permitted.',
  },
  {
    title: '7. Third-party services',
    body: 'The site relies on third-party services (such as Vercel for hosting and Stripe for payments) that have their own terms and privacy policies. We are not responsible for those services.',
  },
  {
    title: '8. No warranty',
    body: 'The site is provided "as is" and "as available", without warranties of any kind, express or implied, including fitness for a particular purpose, accuracy, or uninterrupted availability. Calculators and features may change or be removed at any time.',
  },
  {
    title: '9. Limitation of liability',
    body: 'To the maximum extent permitted by law, the site owner is not liable for any loss or damage arising from use of the site or reliance on its results, including indirect, incidental, or consequential damage. Nothing in these terms excludes liability that cannot be excluded under applicable law (including the Australian Consumer Law, where it applies).',
  },
  {
    title: '10. Changes to these terms',
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
      <p className="mt-3 text-sm text-surface-500 dark:text-surface-400">Last updated June 10, 2026</p>

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
            11. Contact
          </h2>
          <p className="mt-2 leading-relaxed text-surface-600 dark:text-surface-400">
            Questions about these terms? Open an issue on{' '}
            <a
              className="text-brand-600 hover:underline dark:text-brand-400"
              href={`${REPO_URL}/issues`}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
