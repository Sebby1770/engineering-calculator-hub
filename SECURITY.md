# Security Checklist & Posture

This document records how the **Engineering Calculator Hub** addresses the 50-point
security checklist. It reflects what this app actually is: a **Next.js (App Router)
static-content calculator site** with **no user accounts, no database, and no stored
user data**. The only server code is three API routes (Stripe checkout, Stripe
webhook, and a static health check). Because of that, a large number of checklist
items do not apply — those are marked **N/A** with the reason, rather than left
ambiguous.

Legend: ✅ implemented/verified · ➖ not applicable · 📋 ops/process recommendation

Last reviewed: 2026-06-09

---

## 1. Fixed / hardened in code

| # | Item | What was done |
|---|------|---------------|
| 46 | Missing security headers | Added a full header set in `next.config.js` `headers()`: **Content-Security-Policy**, **Strict-Transport-Security** (HSTS, 2y + preload), **X-Frame-Options: DENY**, **X-Content-Type-Options: nosniff**, **Referrer-Policy**, **Permissions-Policy**, **Cross-Origin-Opener-Policy**, **X-DNS-Prefetch-Control**. Verified live with `curl -I`. |
| 19 | Cross-site scripting (XSS) | React escapes all rendered values by default. The only `dangerouslySetInnerHTML` is static JSON-LD; it is now serialized through `toJsonLd()` which escapes `<` to prevent `</script>` breakouts (`src/app/[slug]/page.tsx`). CSP adds a second layer. |
| 28 | Rate limits missing on APIs | Added `src/lib/rateLimit.ts` (in-memory fixed-window) and applied it to `POST /api/checkout` at **5 requests/min/IP** → returns **429** with `Retry-After`. |
| 20 | CSRF | `POST /api/checkout` now rejects requests from a foreign `Origin` (**403**). Note: this endpoint has no auth/cookies, so CSRF impact was already low; this is defense in depth. |
| 16 | Missing input validation | The universal calculator caps expression length (1000 chars) before evaluating; the checkout route validates origin and rate. API routes never trust a client-supplied price/amount. |
| 39 (analogue) | Expression / function injection | `mathjs` is hardened in `UniversalCalculator.tsx`: `import` and `createUnit` are disabled via `math.import(..., { override: true })`, blocking expression-based redefinition. (Runs client-side only.) |
| 36 | Source maps exposed in production | `productionBrowserSourceMaps: false` set explicitly in `next.config.js`. |
| 12 | Verbose errors leaking stack traces | API routes return generic messages (`"Unable to create checkout session."`); real errors go to `console.error` server-side only. |

## 2. Already in place (verified)

| # | Item | Evidence |
|---|------|----------|
| 2 | Public `.env` files | `.gitignore` ignores `.env` and `.env*.local`; only `.env.example` (blank placeholders) is committed. No real `.env` exists in the repo. |
| 3 / 14 | Hardcoded API keys / secrets in frontend | No secrets in source. Only `NEXT_PUBLIC_*` (non-secret config) reaches the client. `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` are server-only `process.env` reads. |
| 31 | Webhook without signature verification | `POST /api/stripe/webhook` verifies via `stripe.webhooks.constructEvent(body, signature, secret)` and rejects missing/invalid signatures (400). |
| 32 / 34 | Payment checks only on frontend / trusting user IDs | The checkout session is created **server-side**; the price comes from the server `STRIPE_PRICE_ID` env var, never from the client. The client `NEXT_PUBLIC_STRIPE_ENABLED` flag is only a UI hint — the server independently enforces configuration. |
| 22 | Path traversal | The dynamic `[slug]` route resolves against a fixed whitelist (`getCalculatorBySlug`) and calls `notFound()` otherwise. No filesystem path is built from user input. |
| 27 | Overly permissive CORS | API routes set **no** `Access-Control-Allow-Origin`, so they are same-origin only. No `*` wildcard anywhere. |
| 35 | Logs containing secrets/PII | Logs contain only a Stripe session id and generic error text — no tokens, emails, or passwords. |
| 10 | Debug pages in production | None exist. `/api/health` returns only `{status, service}`. |
| 1 (X-Powered-By) | Tech-stack leakage | `poweredByHeader: false` — verified the header is absent. |
| 37 / 38 | Dependency vulnerabilities / outdated packages | `npm audit` → **0 vulnerabilities**. Dependencies are current (Next 16, React 18, mathjs 15, stripe 22). |

## 3. Not applicable to this app (with reason)

| # | Item | Why N/A |
|---|------|---------|
| 1 | Exposed database credentials | No database. |
| 4 | Weak/missing authentication | No login or user accounts. |
| 5 | No authorization checks | No protected resources or roles. |
| 6 | Users accessing others' data | No user data is stored. |
| 7 | Open DB read/write permissions | No database. |
| 8 | Misconfigured Firebase/Supabase/S3 | None of these are used. |
| 9 | Admin routes unprotected | No admin area. |
| 17 | SQL injection | No SQL / no database. |
| 18 | NoSQL injection | No NoSQL / no database. |
| 21 | Insecure file uploads | No upload functionality. |
| 23 | SSRF | The server never fetches user-supplied URLs. |
| 24 | Broken password reset | No auth. |
| 25 | Weak session management | No sessions/cookies are issued. |
| 26 | Weak/leaked/reused JWT secrets | No JWTs. |
| 30 | Default credentials | No credentials to set. |
| 33 | IDOR | No user-owned objects referenced by id. |
| 40 | AI tools accessing data without checks | No AI features (the "universal calculator" is `mathjs`, not an LLM). |
| 41 | Excessive DB permissions for app user | No database. |
| 47 | Cookies missing HttpOnly/Secure/SameSite | The app sets no cookies. |
| 48 | Unencrypted sensitive data | No sensitive data is collected or stored; transport is HTTPS (Vercel). |
| 49 | Poor tenant isolation | Single-tenant; no per-user data. |

## 4. Ops / process recommendations (outside the code)

| # | Item | Recommendation |
|---|------|----------------|
| 11 | Build logs leaking secrets | Keep secrets in Vercel **Environment Variables** (not in build commands/logs). No secrets are echoed in scripts today. |
| 13 | Leaked repos / commit history | History was scanned — only `.env.example` appears, no real secrets. Keep the repo private if desired. |
| 29 | Public test/staging environments | Vercel **Preview** deployments are public by default. `robots.ts` disallows `/api/`; consider Vercel Deployment Protection (password) for previews. |
| 42 | No audit logs | Not required (no sensitive user actions). Stripe events are logged by Stripe; `checkout.session.completed` is logged server-side. |
| 43 | No monitoring/alerting | Optional: enable Vercel Analytics / log drains and alert on 5xx spikes. `/api/health` is available for uptime checks. |
| 44 | No backup/restore plan | N/A (no data store). Source is recoverable from git. |
| 45 | Publicly exposed internal dashboards | None exist. |
| 50 | Over-trusting generated code without review | This review *is* that step. Re-run `npm run check` and re-read diffs before each deploy. |

## 5. Notes & future hardening

- **CSP `'unsafe-inline'`**: the script policy allows inline scripts because Next.js
  emits inline bootstrap scripts and we render inline JSON-LD without per-request
  nonces. To reach a strict, nonce-based CSP, generate a nonce in `middleware.ts`,
  pass it to the JSON-LD `<script>` tags, and drop `'unsafe-inline'`. Google AdSense
  domains are pre-allowed so ads keep working when `NEXT_PUBLIC_AD_ENABLED=true`;
  remove them if you never enable ads.
- **Rate limiting** is in-memory and therefore per-instance on serverless. For a hard
  global limit, back `rateLimit()` with Upstash Redis or Vercel KV.

## Verifying

```bash
npm run check          # lint + typecheck + production build
npm audit              # dependency vulnerabilities
npm run start          # then: curl -I http://localhost:3000  (inspect headers)
```
