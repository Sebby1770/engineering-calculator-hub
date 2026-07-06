# Changelog

All notable changes to Engineering Calculator Hub are documented in this file.

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