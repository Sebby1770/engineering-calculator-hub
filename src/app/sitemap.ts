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

  const staticPages = [
    { path: '/workspace', priority: 0.9 },
    { path: '/pricing', priority: 0.7 },
    { path: '/about', priority: 0.4 },
    { path: '/privacy', priority: 0.3 },
    { path: '/terms', priority: 0.3 },
    { path: '/feedback', priority: 0.4 },
  ].map(({ path, priority }) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority,
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
