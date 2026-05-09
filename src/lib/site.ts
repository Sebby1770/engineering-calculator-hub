const FALLBACK_SITE_URL = 'https://engineeringcalculatorhub.com';

function normalizeUrl(url: string) {
  return url.replace(/\/+$/, '');
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredUrl) return normalizeUrl(configuredUrl);

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionUrl) return normalizeUrl(`https://${productionUrl}`);

  const deploymentUrl = process.env.VERCEL_URL;
  if (deploymentUrl) return normalizeUrl(`https://${deploymentUrl}`);

  return FALLBACK_SITE_URL;
}

export function absoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
