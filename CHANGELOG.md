# Changelog

All notable changes to Engineering Calculator Hub are documented in this file.

## [1.3.0] - 2026-08-17

### Added
- **Vitest** test suite for `mathUtils`, `smartEvaluate`, unit conversion helpers, and calculation history, plus a GitHub Actions CI workflow (Node 20: `npm ci`, `npm test`, `npm run lint`).
- **Calculation history** — last 20 evaluations (`slug`, `title`, `inputPreview`, `result`, `at`) stored in `localStorage`. Completing a calculator appends an entry; the home page shows a Recent strip when any exist.
- **Command palette** — press ⌘K / Ctrl+K to search every calculator by title or keyword and open it with Enter. Escape closes the palette.
- **Unit Converter** (`unit-converter-calculator`) for length, mass, temperature, pressure, energy, and frequency. Linear units use exact SI factors; temperature is affine (C/F/K).
- **Voltage Drop** (`voltage-drop-calculator`) with single-phase `Vd = 2·I·R·L`, three-phase `Vd = √3·I·R·L`, copper/aluminum resistivity presets, and a common AWG table. Worked steps included.
- **Decibel** (`decibel-calculator`) for power and voltage ratios plus adding/subtracting independent dB sources via `10^(dB/10)`. Worked steps included.
- **Shareable inputs** via `useCalcQuery` — named fields persist to the URL. Wired up on Ohm's Law and the Unit Converter.

### Changed
- Home page keeps search and category filters, and mentions the live calculator count (now 37).
- README documents tests, the new tools, the command palette, history, and shareable URLs.

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