# Engineering Calculator Hub

A modern, SEO-optimized engineering calculator website built with Next.js, designed for passive income via ad revenue and optional Stripe Checkout support. Features 16 fully interactive calculators across 5 categories with SEO optimization, ad placements, and scalable architecture.

## Tech Stack

- **Next.js** (App Router) with static prerendered calculator pages
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Dark/Light mode** with system preference detection
- **Stripe Checkout** optional server-side integration

## Features

### Calculators (16 included)
- **Electrical**: Ohm's Law, Voltage Divider, Resistor Color Code, RC Time Constant, Power, Parallel/Series Resistors
- **Mathematics**: Scientific Calculator, Log Calculator, Binary/Hex/Decimal Converter
- **Physics**: Energy, Frequency, Wavelength
- **Conversions**: dB↔Voltage, Frequency↔Period

### SEO Optimization
- Dynamic meta tags per calculator page
- JSON-LD structured data (WebApplication, FAQPage, BreadcrumbList)
- Auto-generated sitemap.xml and robots.txt
- Clean URL structure: `/ohms-law-calculator`
- Internal linking via related calculators and footer
- SEO-optimized titles, descriptions, and keywords
- FAQ sections on every calculator page

### Monetization (Ad Placements)
5 ad placement zones ready for any provider:
1. **Top banner** — above calculator content
2. **Sticky sidebar** — desktop only, follows scroll
3. **In-content** — between calculator and formula explanation
4. **Footer** — site-wide footer ad
5. **Between cards** — between related calculator listings

Supports:
- **Google AdSense** (ready-to-use integration)
- **Ezoic** (placeholder IDs configured)
- **Mediavine** (site ID slot)

### User Features
- Copy result to clipboard
- Share calculator via Web Share API or clipboard
- Save favorites (localStorage)
- Keyboard input support
- Responsive on all devices

### Performance
- Static page generation (SSG) for all calculator pages
- Lazy-loaded ad units (IntersectionObserver)
- Minimal JavaScript bundle
- Font preloading
- No layout shift from ad placeholders

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run all local checks
npm run check

# Build for production
npm run build

# Preview production build after running build
npm run start
```

## Native Mac App

A SwiftUI Mac version lives in `macOS/`. It includes a bundled hero image plus all native calculator tools from the web app:

- Ohm's Law
- Power
- Voltage Divider
- Resistor Color Code
- RC Time Constant
- Series Resistors
- Parallel Resistors
- Universal
- Scientific
- Logarithms
- Base Converter
- Energy
- Frequency
- Wavelength
- dB to Voltage
- Voltage to dB
- Frequency and Period

Build and run it with Xcode:

```bash
cd macOS
xcodegen generate
open EngineeringCalculatorHubMac.xcodeproj
```

The runnable scheme is `EngineeringCalculatorHubMac`.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with fonts, meta, AdSense script
│   ├── page.tsx            # Homepage with search, categories, listings
│   ├── globals.css         # Tailwind + custom styles
│   ├── sitemap.ts          # Auto-generated sitemap
│   ├── robots.ts           # Auto-generated robots.txt
│   ├── not-found.tsx       # 404 page
│   ├── about/              # About page
│   ├── privacy/            # Privacy policy
│   ├── terms/              # Terms of use
│   ├── checkout/           # Stripe success/cancel pages
│   ├── api/
│   │   ├── checkout/       # Stripe Checkout session route
│   │   ├── stripe/webhook/ # Stripe webhook receiver
│   │   └── health/         # Health check
│   └── [slug]/
│       ├── page.tsx        # Dynamic calculator page (SSG + metadata)
│       └── CalculatorPageClient.tsx  # Client component router
├── components/
│   ├── ads/
│   │   ├── AdUnit.tsx      # Core ad component (lazy loading, multi-provider)
│   │   └── index.tsx       # Named exports: AdBanner, AdSidebar, etc.
│   ├── calculators/
│   │   ├── CalculatorLayout.tsx  # Reusable page layout with all sections
│   │   ├── OhmsLawCalc.tsx
│   │   ├── VoltageDividerCalc.tsx
│   │   ├── ... (16 calculator components)
│   │   └── FreqPeriodCalc.tsx
│   ├── layout/
│   │   ├── Header.tsx      # Navigation with categories and theme toggle
│   │   ├── Footer.tsx      # SEO footer with internal links
│   │   └── ThemeProvider.tsx
│   └── ui/
│       ├── CalcInput.tsx   # Reusable number input with label/unit
│       ├── CalcSelect.tsx  # Reusable select dropdown
│       ├── CalculatorCard.tsx  # Calculator listing card
│       ├── CopyButton.tsx
│       ├── ShareButton.tsx
│       └── FavoriteButton.tsx
├── data/
│   ├── calculators.ts      # All calculator configs, FAQs, formulas
│   └── categories.ts       # Category definitions
├── lib/
│   ├── adConfig.ts         # Environment-based ad provider configuration
│   └── site.ts             # Canonical site URL helpers
└── types/
    └── index.ts            # TypeScript types
```

## Adding a New Calculator

1. **Add config** in `src/data/calculators.ts`:
```typescript
{
  meta: {
    slug: 'your-calculator-slug',
    title: 'SEO Optimized Title – Keywords Here',
    shortTitle: 'Short Name',
    description: 'SEO description with target keywords...',
    category: 'electrical',
    icon: '⚡',
    keywords: ['keyword1', 'keyword2'],
  },
  formula: 'Y = f(x)',
  formulaExplanation: 'Detailed explanation...',
  exampleUsage: 'Worked example...',
  faqs: [{ question: '...', answer: '...' }],
  relatedSlugs: ['ohms-law-calculator'],
}
```

2. **Create component** in `src/components/calculators/YourCalc.tsx`:
```typescript
'use client';
import { useState } from 'react';
import CalcInput from '@/components/ui/CalcInput';

export default function YourCalc({ onResult }: { onResult: (r: string) => void }) {
  // ... calculator logic
}
```

3. **Register** in `src/app/[slug]/CalculatorPageClient.tsx`:
```typescript
import YourCalc from '@/components/calculators/YourCalc';

const CALCULATOR_MAP = {
  // ...existing
  'your-calculator-slug': YourCalc,
};
```

That's it! The page, routing, SEO metadata, sitemap entry, and footer link are all automatic.

## Enabling Ads

Set these in Vercel or `.env.local`:

```bash
NEXT_PUBLIC_AD_ENABLED=true
NEXT_PUBLIC_AD_PROVIDER=adsense
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-YOUR_REAL_ID
NEXT_PUBLIC_ADSENSE_BANNER_SLOT=YOUR_SLOT_ID
NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=YOUR_SLOT_ID
NEXT_PUBLIC_ADSENSE_IN_CONTENT_SLOT=YOUR_SLOT_ID
NEXT_PUBLIC_ADSENSE_FOOTER_SLOT=YOUR_SLOT_ID
NEXT_PUBLIC_ADSENSE_BETWEEN_CARDS_SLOT=YOUR_SLOT_ID
```

Ads stay hidden until the required provider IDs are present. In development, ad placeholders are shown by default; set `NEXT_PUBLIC_AD_PLACEHOLDERS=false` to hide them.

## Enabling Stripe Checkout

Step by step (do this in [dashboard.stripe.com](https://dashboard.stripe.com) — start in **Test mode**, repeat in Live mode when ready):

1. **Get your secret key**: Developers → API keys → copy the **Secret key** (`sk_test_...` / `sk_live_...`).
2. **Create the product**: Product catalogue → Add product (e.g. "Support Engineering Calculator Hub") with a one-off price. Copy the **Price ID** (`price_...`).
3. **Create the webhook**: Developers → Webhooks → Add endpoint:
   - URL: `https://YOUR_DOMAIN/api/stripe/webhook`
   - Events: `checkout.session.completed`
   - Copy the **Signing secret** (`whsec_...`).
4. **Set the environment variables** (Vercel → Project → Settings → Environment Variables, or `.env.local` for local dev):

```bash
NEXT_PUBLIC_STRIPE_ENABLED=true
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

5. Redeploy. The Support button appears, checkout opens on Stripe's hosted page (card details never touch this app), the success page **verifies the session server-side**, and the webhook records completed payments in Supabase (when configured, below).

The support button is hidden unless `NEXT_PUBLIC_STRIPE_ENABLED=true`. Checkout creation still fails safely unless both `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` are configured. The checkout endpoint is rate-limited and origin-checked.

## Connecting Supabase

A Supabase project (`engineering-calculator-hub`, region `us-east-1`) backs two small, server-only tables:

- `donations` — written by the Stripe webhook (session ID, amount, currency, status)
- `feedback` — written by the `/feedback` form (message + optional email)

Both tables have **row-level security enabled with zero policies and revoked client grants**, so they are completely inaccessible with the public anon key — all access goes through server API routes using the service-role key.

To connect a deployment:

1. Open the Supabase Dashboard → project **engineering-calculator-hub** → Settings → API.
2. Copy the **Project URL** and the **service_role** key.
3. Set them as environment variables (server-only — never `NEXT_PUBLIC_`):

```bash
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Without these variables the site still works: the feedback form reports "not configured" and the webhook simply skips persistence.

## Deployment

Recommended: **Vercel**.

```bash
npm install
npm run check
npx vercel --prod
```

Required production environment variables:

```bash
NEXT_PUBLIC_SITE_URL=https://engineeringcalculatorhub.com
```

Add the ad and Stripe variables above when those services are ready. The project includes `vercel.json` so Vercel uses `npm install`, `npm run build`, and the Next.js framework preset.

## SEO Checklist

- [x] Unique title & description per page
- [x] JSON-LD structured data (WebApplication, FAQ, Breadcrumb)
- [x] Auto-generated sitemap.xml
- [x] Auto-generated robots.txt
- [x] Canonical URLs
- [x] Open Graph & Twitter Card meta
- [x] Internal linking (related calculators, footer)
- [x] Clean URL structure
- [x] Mobile responsive
- [x] Fast loading (static generation)
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics
- [ ] Build backlinks

## License

MIT
