import type { MetadataRoute } from 'next';
import { calculators } from '@/data/calculators';
import { absoluteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const calculatorPages = calculators.map((c) => ({
    url: absoluteUrl(`/${c.meta.slug}`),
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const staticPages = ['/about', '/privacy', '/terms', '/feedback'].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.4,
  }));

  return [
    {
      url: absoluteUrl('/'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...calculatorPages,
    ...staticPages,
  ];
}
