import { getSiteUrl } from './site';

function isLocalHostname(hostname: string) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === '::1'
  );
}

export function isLocalOrigin(origin: string) {
  try {
    return isLocalHostname(new URL(origin).hostname);
  } catch {
    return false;
  }
}

// Resolve the origin to use for redirect URLs (Stripe success/cancel/return).
// Local origins are honoured so checkout round-trips work in development;
// anything else uses the configured canonical site URL.
export function getPublicOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && isLocalOrigin(origin)) {
    return origin.replace(/\/+$/, '');
  }
  return getSiteUrl();
}

// CSRF defense shared by the POST API routes: reject requests from a foreign
// origin. A missing Origin is allowed because browsers always attach Origin to
// genuine cross-site requests, so the classic cross-site form/fetch attack is
// still blocked, while non-browser callers keep working.
export function isAllowedOrigin(origin: string | null) {
  if (!origin) return true;
  try {
    const url = new URL(origin);
    if (isLocalHostname(url.hostname)) return true;
    return url.host === new URL(getSiteUrl()).host;
  } catch {
    return false;
  }
}
