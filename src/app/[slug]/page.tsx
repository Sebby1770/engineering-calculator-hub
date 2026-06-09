import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { calculators, getCalculatorBySlug } from '@/data/calculators';
import { absoluteUrl } from '@/lib/site';
import CalculatorPageClient from './CalculatorPageClient';

type CalculatorPageProps = {
  params: Promise<{ slug: string }>;
};

// Serialize JSON-LD for inline <script>, escaping "<" so the data can never break
// out of the script element (defense in depth — the data here is static).
function toJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

// Static generation for all calculator pages
export function generateStaticParams() {
  return calculators.map((c) => ({ slug: c.meta.slug }));
}

// Dynamic SEO metadata per calculator
export async function generateMetadata({ params }: CalculatorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = getCalculatorBySlug(slug);
  if (!config) return {};

  const { meta } = config;
  const pageUrl = absoluteUrl(`/${meta.slug}`);

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: pageUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: meta.title,
      description: meta.description,
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default async function CalculatorPage({ params }: CalculatorPageProps) {
  const { slug } = await params;
  const config = getCalculatorBySlug(slug);
  if (!config) notFound();
  const pageUrl = absoluteUrl(`/${config.meta.slug}`);

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: config.meta.title,
    description: config.meta.description,
    url: pageUrl,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      {
        '@type': 'ListItem',
        position: 2,
        name: config.meta.shortTitle,
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbJsonLd) }}
      />
      <CalculatorPageClient slug={slug} />
    </>
  );
}
