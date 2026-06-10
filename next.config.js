/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production';

// Content Security Policy.
// - 'unsafe-inline' is required for Next.js's inline bootstrap/runtime scripts and
//   for the inline JSON-LD structured data (we are not using per-request nonces).
// - 'unsafe-eval' is added in development only, for React Fast Refresh.
// - Google AdSense domains are pre-allowed so ads keep working if/when
//   NEXT_PUBLIC_AD_ENABLED is set to "true". Tighten these if you do not use ads.
const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "font-src 'self' data:",
  "img-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://pagead2.googlesyndication.com https://partner.googleadservices.com https://www.googletagservices.com https://adservice.google.com`,
  "connect-src 'self' https://pagead2.googlesyndication.com",
  "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
];

if (!isDev) {
  cspDirectives.push('upgrade-insecure-requests');
}

const securityHeaders = [
  { key: 'Content-Security-Policy', value: cspDirectives.join('; ') },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig = {
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Never ship client-side source maps to production (avoids leaking original source).
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Keep API responses out of search engines.
        source: '/api/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
    ];
  },
};

module.exports = nextConfig;
