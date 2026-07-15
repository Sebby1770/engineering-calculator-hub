export function isAllowedOriginForHosts(
  origin: string | null,
  requestUrl: string,
  canonicalUrl: string,
) {
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    const requestOrigin = new URL(requestUrl).origin;
    const canonicalOrigin = new URL(canonicalUrl).origin;

    // Compare complete origins (scheme, hostname, and port). The exact request
    // origin permits localhost and preview deployments without trusting every
    // sibling domain or an insecure HTTP variant of the production host.
    return originUrl.origin === requestOrigin || originUrl.origin === canonicalOrigin;
  } catch {
    return false;
  }
}
