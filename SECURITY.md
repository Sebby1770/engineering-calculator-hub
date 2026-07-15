# Security posture and launch runbook

Engineering Calculator Hub is a Next.js application with local-first calculators and optional
Supabase Auth, Supabase Postgres, Stripe billing, and Pro cloud workspace sync. This document
describes the controls that exist in code and the operational controls required before accepting
real customer data or money.

Report vulnerabilities privately through [GitHub Security Advisories](https://github.com/Sebby1770/engineering-calculator-hub/security/advisories/new).
Do not put credentials, customer data, or an unpatched vulnerability in a public issue.

Last reviewed: 2026-07-15

## Security boundaries

- Calculator inputs run locally. They reach the backend only if a user deliberately saves a
  result to Pro cloud sync.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are publishable browser
  configuration, not secrets. Database security never depends on hiding them.
- `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` are server-only.
  They must live in Vercel encrypted environment variables or an ignored `.env.local` file and
  must never use a `NEXT_PUBLIC_` prefix.
- Server database modules import `server-only`, and the service-role REST helper accepts only the
  four explicitly listed application tables.
- Card details are entered on Stripe-hosted pages and never pass through this application.

## Implemented controls

### Browser and transport

- Content Security Policy limits code, frames, forms, images, and connections. Supabase Auth is
  allowed only to the configured project origin, and advertising domains are absent unless ads
  are explicitly enabled.
- HSTS, clickjacking protection, MIME sniffing protection, strict referrers, restricted browser
  permissions, COOP/CORP, and disabled production browser source maps are configured in
  `next.config.js`.
- API responses are marked `noindex`, and the app emits no permissive CORS headers.
- React escapes user-visible content. Static JSON-LD is serialized with `<` escaped.

### APIs and authentication

- Every authenticated route validates the bearer token against Supabase Auth; client-decoded JWT
  claims are never trusted on their own.
- State-changing routes reject foreign origins. The guard accepts only localhost, the canonical
  host, or the exact deployment host, so previews work without trusting arbitrary Vercel domains.
- Feedback, billing, subscription status, checkout, and workspace routes have per-IP soft limits.
  Feedback and workspace uploads also enforce byte limits and schema/length validation.
- Prices and Stripe customer IDs come from server configuration or verified account records, not
  request bodies.
- Pro authorization requires both an active/trialing Stripe status and the exact configured Pro
  price ID.

### Stripe

- Checkout and Billing Portal sessions are created server-side.
- Stripe webhook signatures are verified against the unmodified request body.
- Webhooks fail closed when persistence or subscription verification is unavailable, allowing
  Stripe to retry instead of silently losing an entitlement.
- Completed subscriptions are retrieved from Stripe before access is recorded. An unexpected
  price never grants Pro.
- Entitlements are bound to the exact Stripe subscription ID, and newer event timestamps prevent
  a delayed update from overwriting a later cancellation.
- One-off payment events are idempotent through a unique Stripe Checkout session ID.
- Existing active subscribers cannot accidentally create a second Pro subscription from the app.

### Supabase/Postgres

The migrations in `supabase/migrations/` version all commercial tables:

- `profiles` — server-managed account and Stripe entitlement state
- `workspace_documents` — one validated cloud document per Pro user
- `donations` — idempotent one-off Stripe payment records
- `feedback` — validated product feedback and optional reply address

All four tables have RLS enabled and forced, with client grants revoked and no browser policies.
Only the server-side service role receives explicit table privileges. Constraints cover supported
subscription states, text lengths, currency shape, and non-negative payment amounts. Frequently
filtered and retention/audit columns are indexed. A locked `SECURITY DEFINER` trigger creates the
private profile row when Supabase Auth creates a user.

## CI and dependency safety

- Pull requests and pushes to `main` run tests, lint, type checking, a production build, and
  `npm audit --audit-level=high` in GitHub Actions.
- Dependabot checks npm and GitHub Actions weekly.
- The repository ignores local environment files, build output, Vercel link metadata, and local
  database CLI state. Review staged files before every commit anyway.
- Enable GitHub secret scanning and push protection in repository settings.

## Required Vercel production controls

The in-code limiter is deliberately described as a soft limit because serverless instances do not
share memory. Before a public launch:

1. Enable Vercel Bot Protection in log/challenge mode and review false positives.
2. Use the Hobby plan's rate-limit rule (or a stricter Pro-plan set) for application APIs, excluding
   `/api/stripe/webhook` so legitimate Stripe retries are not dropped. A sensible first rule is
   100 requests per minute per IP for `/api/*`, then tune from Security Events.
3. Keep automatic DDoS protection enabled and use Attack Challenge Mode only during an incident.
4. Protect preview deployments and never attach production Supabase/Stripe secrets to untrusted
   preview branches.
5. Enable Vercel runtime alerts and review 4xx/5xx, billing, auth, and webhook errors.

Do not add a blanket API-key WAF rule: browser-facing APIs use Supabase bearer tokens or
same-origin controls, and Stripe must reach the webhook without a custom header.

## Secret and environment checklist

- Scope test keys to Preview/Development and live keys to Production.
- Mark service-role and Stripe keys sensitive in Vercel.
- Rotate a key immediately if it appears in source, logs, screenshots, support messages, or an
  unexpected environment. Redeploy after rotation and revoke the old value.
- Keep separate Stripe webhook signing secrets for test and live endpoints.
- Verify the Supabase Auth Site URL and redirect allow-list; do not use wildcard redirects in
  production.
- Treat a copied publishable Supabase key as expected. RLS and grants—not obscurity—protect data.

## Backup, privacy, and incident response

- Free local workspace data is the user's responsibility; JSON/CSV/PDF-ready exports are provided.
- Upgrade Supabase before launch if scheduled backups and point-in-time recovery are required.
  Test a restore, not just a backup setting.
- Stripe remains authoritative for payments. Reconcile Stripe subscriptions against `profiles`
  periodically and after any webhook incident.
- For a suspected breach: preserve logs, restrict the affected path, rotate relevant secrets,
  reconcile Stripe/Supabase records, notify affected people and regulators where required, and
  document the timeline and corrective action.
- Privacy and Terms pages are product safeguards, not legal advice. Have an Australian lawyer
  review them, the refund flow, business identity/contact details, tax obligations, and Australian
  Consumer Law disclosures before a paid launch.

## Verification

```bash
npm run verify
npm audit --audit-level=high
npm run start
curl -I http://localhost:3000
```

Also test: sign-in redirect, upgrade, duplicate upgrade prevention, webhook retry, cancellation,
portal return, cloud save/load, cross-account isolation, oversized payload rejection, a foreign
Origin request, data export, and an account/data deletion request.

No checklist can guarantee that a service will never be compromised or sued. The objective is to
reduce likelihood and impact, keep claims honest, and make failures observable and recoverable.
