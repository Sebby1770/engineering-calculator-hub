# Changelog

All notable changes to Engineering Calculator Hub are documented in this file.

## Unreleased

## [2.6.0] - 2026-09-13

### Changed
- About, pricing, 404, and calculator stamps now use the same drafting-plate chrome as the homepage.

## [2.5.0] - 2026-09-13

### Changed
- Homepage and chrome restyled as a **drafting-plate workshop**: warm paper stock, mill-finished plates with corner ticks and screws, Syne display type, a live compass rose, and a scrolling formula ticker. Search, bays, and calculators are unchanged.

## [2.4.0] - 2026-09-13

### Added
- Four new workshop bays — **Mechanical**, **Civil & Structural**, **Thermofluids**, and **Materials & Chemical** — with 20 deterministic SI formula tools (beam, gear train, shaft torsion, helical spring, pump power, principal stress, Manning, Euler buckling, rational runoff, section modulus, ideal gas, Bernoulli, Darcy–Weisbach, Carnot, LMTD, convection, Reynolds, dilution, thermal expansion, stress–strain). No new electrical calculators in this round.
- Pump power (ρgQH), 2D Mohr principal stress, and Newton convection calculators with reference-case tests.
- Accessible global `Cmd/Ctrl+K` calculator finder with ranked multi-word, formula, unit, and engineering-symbol search.
- Resilient local favourites and recently viewed calculators, with home-page quick access and malformed-storage recovery.
- Calculator route loading and error states plus live result announcements and clearer button semantics.
- Regression tests for search ranking, activity ordering, deduplication, limits, and storage recovery.
- Reference-case tests for beam deflection, Euler Pcr, Carnot efficiency, Reynolds number, Manning discharge, dilution, and 2:1 gear torque.

### Changed
- Homepage, calculator cards, footer, and site metadata now present a multi-discipline **instrument workshop** (isometric blueprint grid, brass/cyan accents, mixed-discipline featured tools) instead of an electrical-only identity.
- Split calculator implementations into statically analyzable lazy chunks so each route loads only the selected tool.
- Derive public calculator counts from the source catalogue instead of stale hard-coded metadata.

## [2.2.0] - 2026-08-20

### Added
- **GitHub Pages** static site at https://sebby1770.github.io/engineering-calculator-hub/ (`npm run build:pages`). Calculators and local workspace run in the browser; Stripe/API routes stay on the Node host.
- **Digital & Networking** category with three tools:
  - **Binary calculator** — 8/16/32/64-bit convert with nibble grouping, AND/OR/XOR/NAND/NOR/NOT/shifts, and two’s-complement encode
  - **Boolean algebra** — truth table plus Quine–McCluskey minimal SOP (AND/OR/NOT/XOR/NAND/NOR, juxtaposition `AB`, postfix `'`)
  - **IP subnetting** — IPv4 CIDR/mask lookup, equal prefix splits, and VLSM from a host list (`/31` RFC 3021, `/32` host route)
- Unit tests in `tests/digitalTools.test.mjs` for conversion, bitwise masking, classic Boolean identities, `/24`–`/32` math, and a VLSM carve.

## [2.0.0] - 2026-07-15

### Added
- **Engineering Workspace** with named projects, saved calculation snapshots, notes, CSV/JSON export, and print-to-PDF calculation sheets.
- **Pro cloud workspace architecture** with authenticated server-side sync, payload validation, rate limiting, exact-price entitlement verification, and RLS-enabled Supabase migrations.
- Versioned commercial backend tables for profiles, workspace documents, payment records, and feedback, with forced RLS, revoked browser grants, constraints, indexes, and auth-profile lifecycle automation.
- GitHub Actions verification for tests, lint, type checking, production builds, and high-severity dependency audits.
- Seven professional electrical and signal tools: LED Resistor Designer, PCB Trace Drop, Series RLC Resonance, Three-Phase Power, Battery Runtime, ADC Resolution, and RC Low-Pass Designer.
- A calculation verification suite covering the new formulas, E24 divider synthesis, tolerance analysis, and workspace document validation.
- Dedicated Pricing page and a product-specific Open Graph launch card.

### Changed
- Voltage Divider upgraded into a loaded, tolerance-aware E24 design workflow with worst-case corners, output impedance, current, and dissipation.
- Homepage repositioned around transparent engineering workflow rather than raw calculator count.
- Header and footer now make Workspace and Pricing first-class product destinations.
- Pro value moved from paywalling commodity formulas to cloud projects and workflow features.
- Removed unverified aggregate-rating structured data from calculator pages.
- Hardened CSP, exact-origin checks, streamed request-size limits, subscription-bound event ordering, webhook failure handling, server-only module boundaries, legal disclosures, and the production security runbook.

## [1.2.0] - 2026-07-06

### Added
- **Smart math engine** (`smartMath.ts`) with step-by-step work for equations, derivatives, integrals, limits, matrices, and simplification.
- **Equation Solver** calculator with quadratic discriminant analysis, factor form, and general `solve(f(x)=0, x)` support.
- **WorkSteps** UI component for labeled, numbered solution steps across calculators.
- Limit calculator now uses Richardson extrapolation with sample-point work shown.
- Ohm's Law calculator shows rearrangement and substitution steps.

### Changed
- Universal calculator upgraded to smart mode: auto-detects equation type, shows kind badge, and displays step-by-step work.
- Derivative, integral, and linear-system calculators now surface symbolic and numeric working.
- Numerical limit estimation improved with Richardson extrapolation for higher accuracy.

## [1.1.0] - 2026-07-06

### Added
- **Calculus** category with derivative, integral, limit, ODE, and Taylor series calculators.
- **Geometry** category with triangle, circle, Pythagorean, volume, and distance calculators.
- **Linear Algebra** category with determinant, inverse, multiplication, linear-system solver, dot/cross product, and eigenvalue tools.
- Shared math utilities for matrices, geometry, limits, and Euler ODE solving.
- Reusable `MatrixInput` and `CalcResult` UI components.

### Changed
- Universal calculator examples now include derivatives, integrals, matrices, and equation solving.
- Energy calculator adds rotational and spring energy modes.
- Power calculator adds mechanical power via torque and angular velocity.
- README and sitemap automatically include all new calculator pages.

## [1.0.0] - 2026-06-10

### Added
- Initial launch with 16 calculators across electrical, mathematics, physics, and conversions.
- SEO pages, favorites, sharing, ads, and optional Stripe support.
