import type { MetadataRoute } from 'next';
import { calculators } from '@/data/calculators';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://engineeringcalculatorhub.com';

  const calculatorPages = calculators.map((c) => ({
    url: `${base}/${c.meta.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...calculatorPages,
  ];
}
