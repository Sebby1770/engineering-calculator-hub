# Security Checklist & Posture

This document records how the **Engineering Calculator Hub** addresses the 50-point
security checklist. It reflects what this app actually is: a **Next.js (App Router)
static-content calculator site** with **no user accounts**. Server code is limited to
four API routes (Stripe checkout, Stripe webhook, feedback intake, health check), and
a **locked-down Supabase Postgres database** holds two server-only tables: a donation
log written by the Stripe webhook, and visitor feedback. Items that don't apply are
marked **N/A** with the reason, rather than left ambiguous.

Reporting: see [/.well-known/security.txt](public/.well-known/security.txt) — report
vulnerabilities via [GitHub security advisories](https://github.com/Sebby1770/engineering-calculator-hub/security/advisories/new).

Legend: ✅ implemented/verified · ➖ not applicable · 📋 ops/process recommendation

Last reviewed: 2026-06-10

---

## 1. Fixed / hardened in code

| # | Item | What was done |
|---|------|---------------|
| 46 | Missing security headers | Full header set in `next.config.js` `headers()`: **Content-Security-Policy**, **Strict-Transport-Security** (HSTS, 2y + preload), **X-Frame-Options: DENY**, **X-Content-Type-Options: nosniff**, **Referrer-Policy**, **Permissions-Policy**, **Cross-Origin-Opener-Policy**, **X-DNS-Prefetch-Control**, plus **X-Robots-Tag: noindex** on `/api/*`. Verified live with `curl -I`. |
| 19 | Cross-site scripting (XSS) | React escapes all rendered values by default. The only `dangerouslySetInnerHTML` is static JSON-LD serialized through `toJsonLd()` which escapes `<` (`src/app/[slug]/page.tsx`). CSP adds a second layer. |
| 28 | Rate limits missing on APIs | `src/lib/rateLimit.ts` (in-memory fixed-window) applied to `POST /api/checkout` (**5/min/IP**) and `POST /api/feedback` (**3/min/IP**) → **429** with `Retry-After`. |
| 20 | CSRF | Shared origin guard (`src/lib/requestGuards.ts`) rejects foreign-`Origin` POSTs (**403**) on checkout and feedback. These endpoints use no cookies/auth, so this is defense in depth. |
| 16 | Missing input validation | Feedback endpoint validates message length (10–2000), optional email format/length, and silently drops honeypot submissions; DB constraints re-enforce the same limits. Universal calculator caps expression length. API routes never trust client-supplied prices/amounts. |
| 32 | Payment checks only on frontend | Checkout sessions are created **server-side** with a server-configured price. The success page now **retrieves the session from Stripe server-side** and only shows "confirmed" when `payment_status === 'paid'` — visiting the URL proves nothing. |
| 31 | Webhook without signature verification | `POST /api/stripe/webhook` verifies via `stripe.webhooks.constructEvent(...)`; donation inserts are **idempotent** (unique `stripe_session_id`, duplicate deliveries ignored), and a failed insert returns 500 so Stripe retries. |
| 39 (analogue) | Expression / function injection | `mathjs` hardened in `UniversalCalculator.tsx`: `import`/`createUnit` disabled. (Runs client-side only.) |
| 36 | Source maps exposed in production | `productionBrowserSourceMaps: false` in `next.config.js`. |
| 12 | Verbose errors leaking stack traces | API routes return generic messages; real errors go to `console.error` server-side only. |

## 2. Database (Supabase) — how it's secured

The database was added deliberately small and locked down (project `engineering-calculator-hub`, Postgres 17):

| # | Item | Status |
|---|------|--------|
| 1 | Exposed database credentials | ✅ Only the **service-role key** is used, read from server-only env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — never `NEXT_PUBLIC_*`). No Supabase keys ship to the browser at all. |
| 7 | Open database read/write permissions | ✅ **RLS enabled with zero policies** on both tables **and** `REVOKE ALL ... FROM anon, authenticated` — client roles can do nothing, even with the anon key. |
| 8 | Misconfigured Firebase/Supabase/S3 | ✅ See above; no storage buckets, no client SDK, no realtime. All access is server-side REST with the service role. |
| 17 | SQL injection | ✅ No SQL is ever built from user input — inserts go through PostgREST as JSON; lengths/format enforced by `CHECK` constraints. |
| 41 | Excessive DB permissions for app user | ✅/📋 The serverless routes use the service role (full access) but touch only two tables with insert-only code paths. For stricter least-privilege, a dedicated Postgres role with INSERT-only grants could replace it later. |
| 42 | No audit logs | ✅ (lightweight) The `donations` table is an append-only record of every completed checkout, independent of Stripe's dashboard. |
| 44 | No backup/restore plan | 📋 Data is low-criticality (feedback + donation log; Stripe holds the authoritative payment records). Supabase free tier has no scheduled backups — upgrade to Pro or export periodically if this data becomes important. |
| 48 | Unencrypted sensitive data | ✅ Supabase encrypts at rest; transport is TLS; the only personal field stored is an optional feedback email. |

## 3. Already in place (verified)

| # | Item | Evidence |
|---|------|----------|
| 2 | Public `.env` files | `.gitignore` ignores `.env` and `.env*.local`; only `.env.example` (blank placeholders) is committed. |
| 3 / 14 | Hardcoded API keys / secrets in frontend | No secrets in source. Only `NEXT_PUBLIC_*` (non-secret config) reaches the client. Stripe + Supabase secrets are server-only `process.env` reads. |
| 22 | Path traversal | The dynamic `[slug]` route resolves against a fixed whitelist and 404s otherwise. No filesystem path is built from user input. |
| 27 | Overly permissive CORS | API routes set **no** `Access-Control-Allow-Origin`, so they are same-origin only. |
| 35 | Logs containing secrets/PII | Logs contain only Stripe session ids, HTTP statuses, and generic error text. |
| 10 | Debug pages in production | None exist. `/api/health` returns only `{status, service}`. |
| 37 / 38 | Dependency vulnerabilities / outdated packages | `npm audit` → **0 vulnerabilities**, now enforced in CI (`--audit-level=high`) plus weekly **Dependabot** update PRs. |

## 4. Not applicable to this app (with reason)

| # | Item | Why N/A |
|---|------|---------|
| 4 | Weak/missing authentication | No login or user accounts. |
| 5 | No authorization checks | No protected resources or roles. |
| 6 | Users accessing others' data | No per-user data is exposed; the two DB tables are unreadable from the client entirely. |
| 9 | Admin routes unprotected | No admin area (data is viewed in the Supabase dashboard, behind Supabase auth). |
| 18 | NoSQL injection | No NoSQL store. |
| 21 | Insecure file uploads | No upload functionality. |
| 23 | SSRF | The server never fetches user-supplied URLs (Supabase/Stripe URLs are fixed config). |
| 24 | Broken password reset | No auth. |
| 25 | Weak session management | No sessions/cookies are issued. |
| 26 | Weak/leaked/reused JWT secrets | No JWTs are issued by this app. |
| 30 | Default credentials | No credentials to set. |
| 33 | IDOR | No object IDs are accepted from clients (the success page accepts a Stripe session ID but only displays what Stripe returns for it). |
| 40 | AI tools accessing data without checks | No AI features. |
| 47 | Cookies missing HttpOnly/Secure/SameSite | The app sets no cookies. |
| 49 | Poor tenant isolation | Single-tenant; no per-user data model. |

## 5. Ops / process

| # | Item | Status |
|---|------|--------|
| 11 | Build logs leaking secrets | 📋 Secrets live in Vercel Environment Variables; no secrets are echoed in scripts. |
| 13 | Leaked repos / commit history | ✅ History scanned — only `.env.example` appears, no real secrets. Repo is public by choice (MIT). |
| 29 | Public test/staging environments | 📋 Vercel Preview deployments are public by default; consider Deployment Protection for previews. |
| 43 | No monitoring/alerting | ✅/📋 **GitHub Actions CI** now runs lint, typecheck, build, and `npm audit` on every push/PR. For runtime alerting, enable Vercel log drains/alerts; `/api/health` is available for uptime checks. |
| 45 | Publicly exposed internal dashboards | ➖ None exist (Supabase dashboard is behind Supabase login). |
| 50 | Over-trusting generated code | 📋 CI gate + this document; re-read diffs before each deploy. |

## 6. Notes & future hardening

- **CSP `'unsafe-inline'`**: Next.js emits inline bootstrap scripts and the calculator pages
  render inline JSON-LD. A nonce-based CSP requires per-request dynamic rendering, which would
  give up static generation of every calculator page — a poor trade for this site. Revisit if
  the threat model changes. AdSense domains are pre-allowed only so ads work if
  `NEXT_PUBLIC_AD_ENABLED=true` is ever set; remove them if you never enable ads.
- **Rate limiting** is in-memory and therefore per-instance on serverless. For a hard global
  limit, back `rateLimit()` with Upstash Redis or Vercel KV.
- **Least-privilege DB role**: the service role is acceptable at this scale; a dedicated
  INSERT-only Postgres role would be the next step if the schema grows.

## Verifying

```bash
npm run check          # lint + typecheck + production build
npm audit              # dependency vulnerabilities
npm run start          # then: curl -I http://localhost:3000  (inspect headers)
```
