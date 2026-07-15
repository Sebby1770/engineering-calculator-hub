import { getSiteUrl } from './site';
import { isAllowedOriginForHosts } from './originPolicy';

// Resolve the origin to use for redirect URLs (Stripe success/cancel/return).
// Local origins are honoured so checkout round-trips work in development;
// anything else uses the configured canonical site URL.
export function getPublicOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && isAllowedOrigin(request)) {
    return origin.replace(/\/+$/, '');
  }
  return getSiteUrl();
}

// CSRF defense shared by the POST API routes: reject requests from a foreign
// origin. A missing Origin is allowed because browsers always attach Origin to
// genuine cross-site requests, so the classic cross-site form/fetch attack is
// still blocked, while non-browser callers keep working.
export function isAllowedOrigin(request: Request) {
  return isAllowedOriginForHosts(request.headers.get('origin'), request.url, getSiteUrl());
}
