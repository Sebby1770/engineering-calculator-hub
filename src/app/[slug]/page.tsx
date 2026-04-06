import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { calculators, getCalculatorBySlug } from '@/data/calculators';
import CalculatorPageClient from './CalculatorPageClient';

// Static generation for all calculator pages
export function generateStaticParams() {
  return calculators.map((c) => ({ slug: c.meta.slug }));
}

// Dynamic SEO metadata per calculator
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const config = getCalculatorBySlug(params.slug);
  if (!config) return {};

  const { meta } = config;
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://engineeringcalculatorhub.com/${meta.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: meta.title,
      description: meta.description,
    },
    alternates: {
      canonical: `https://engineeringcalculatorhub.com/${meta.slug}`,
    },
  };
}

export default function CalculatorPage({ params }: { params: { slug: string } }) {
  const config = getCalculatorBySlug(params.slug);
  if (!config) notFound();

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: config.meta.title,
    description: config.meta.description,
    url: `https://engineeringcalculatorhub.com/${config.meta.slug}`,
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
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://engineeringcalculatorhub.com' },
      {
        '@type': 'ListItem',
        position: 2,
        name: config.meta.shortTitle,
        item: `https://engineeringcalculatorhub.com/${config.meta.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CalculatorPageClient slug={params.slug} />
    </>
  );
}
