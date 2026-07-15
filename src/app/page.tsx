'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { calculators } from '@/data/calculators';
import { categories } from '@/data/categories';
import CalculatorCard from '@/components/ui/CalculatorCard';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { AdBanner } from '@/components/ads';
import type { CalculatorConfig, Category } from '@/types';

type CategoryFilter = 'all' | Category;

const FEATURED_SLUGS = [
  'voltage-divider-calculator',
  'pcb-trace-voltage-drop-calculator',
  'led-resistor-designer',
  'adc-resolution-calculator',
  'battery-runtime-calculator',
  'series-rlc-resonance-calculator',
  'three-phase-power-calculator',
  'ohms-law-calculator',
];

function matchesSearch(calculator: CalculatorConfig, query: string) {
  const haystack = [
    calculator.meta.title,
    calculator.meta.shortTitle,
    calculator.meta.description,
    calculator.formula,
    ...calculator.meta.keywords,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

export default function HomePage() {
  const popular = FEATURED_SLUGS.flatMap((slug) => {
    const calculator = calculators.find((item) => item.meta.slug === slug);
    return calculator ? [calculator] : [];
  });
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const searchRef = useRef<HTMLInputElement>(null);
  const trimmedSearch = search.trim().toLowerCase();

  // Only show categories that actually contain calculators.
  const populatedCategories = useMemo(
    () => categories.filter((category) => calculators.some((c) => c.meta.category === category.id)),
    []
  );

  // Deep links: /?category=electrical preselects a category filter.
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('category');
    if (param && categories.some((c) => c.id === param)) {
      setActiveCategory(param as Category);
    }
  }, []);

  // Press "/" anywhere to jump to search.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const category of categories) {
      counts[category.id] = calculators.filter((c) => c.meta.category === category.id).length;
    }
    return counts;
  }, []);

  const filtered = useMemo(() => {
    return calculators.filter((calculator) => {
      const categoryMatch = activeCategory === 'all' || calculator.meta.category === activeCategory;
      const searchMatch = !trimmedSearch || matchesSearch(calculator, trimmedSearch);
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, trimmedSearch]);

  const isFiltering = trimmedSearch !== '' || activeCategory !== 'all';

  const selectCategory = (category: CategoryFilter) => {
    setActiveCategory(category);
    const url = new URL(window.location.href);
    if (category === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', category);
    }
    window.history.replaceState(null, '', url.toString());
  };

  const resetFilters = () => {
    setSearch('');
    selectCategory('all');
  };

  return (
    <div className="bg-white dark:bg-surface-950">
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative overflow-hidden border-b border-surface-200/80 dark:border-surface-800/80">
        {/* Blueprint grid backdrop, faded at the edges */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_75%_70%_at_50%_0%,black_30%,transparent_100%)]"
        />
        {/* Colour glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 right-[-8rem] h-[28rem] w-[28rem] animate-float-slow rounded-full bg-brand-400/25 blur-3xl motion-reduce:animate-none dark:bg-brand-500/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 left-[-10rem] h-[24rem] w-[24rem] animate-float-slow rounded-full bg-violet-300/20 blur-3xl [animation-delay:-7s] motion-reduce:animate-none dark:bg-violet-600/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-200/20 blur-3xl dark:bg-cyan-500/5"
        />
        {/* Floating formula glyphs */}
        <span aria-hidden="true" className="pointer-events-none absolute right-[8%] top-10 hidden select-none font-mono text-[7rem] font-bold leading-none text-brand-600/[0.07] dark:text-brand-400/[0.06] md:block">
          Ω
        </span>
        <span aria-hidden="true" className="pointer-events-none absolute left-[4%] bottom-8 hidden select-none font-mono text-[6rem] font-bold leading-none text-violet-600/[0.06] dark:text-violet-400/[0.05] lg:block">
          λ
        </span>
        <span aria-hidden="true" className="pointer-events-none absolute right-[28%] bottom-2 hidden select-none font-mono text-[4.5rem] font-bold leading-none text-cyan-600/[0.06] dark:text-cyan-400/[0.05] lg:block">
          ∑
        </span>

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center animate-slide-up">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-white/70 px-4 py-1.5 text-sm font-medium text-brand-700 shadow-sm backdrop-blur dark:border-brand-800/60 dark:bg-surface-900/70 dark:text-brand-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              {calculators.length} transparent engineering tools — core calculations stay free
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight text-surface-950 dark:text-white sm:text-6xl">
              Fast enough for a calculator.{' '}
              <span className="animate-gradient-x bg-gradient-to-r from-brand-600 via-violet-500 to-brand-600 bg-[length:200%_auto] bg-clip-text text-transparent motion-reduce:animate-none dark:from-brand-400 dark:via-violet-400 dark:to-brand-400">
                Rigorous enough for a design review.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-surface-600 dark:text-surface-300">
              Transparent formulas, tolerance-aware electrical design tools, and a local-first
              workspace that turns isolated answers into an auditable calculation sheet.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/workspace" className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-700">
                Open Engineering Workspace
              </Link>
              <a href="#calculators" className="inline-flex items-center justify-center rounded-xl border border-surface-300 bg-white/70 px-6 py-3 text-sm font-bold text-surface-700 backdrop-blur transition hover:border-brand-300 hover:text-brand-700 dark:border-surface-700 dark:bg-surface-900/70 dark:text-surface-200">
                Explore all calculators
              </a>
            </div>

            {/* Search */}
            <div className="mt-7">
              <label htmlFor="calculator-search" className="sr-only">
                Search calculators
              </label>
              <div className="relative mx-auto max-w-2xl">
                <svg
                  className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  id="calculator-search"
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by formula, unit, or calculator name…"
                  className="w-full rounded-2xl border border-surface-200 bg-white/80 py-4 pr-14 text-base shadow-lg shadow-brand-500/5 outline-none backdrop-blur transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-surface-700 dark:bg-surface-900/80 dark:focus:ring-brand-900/50"
                  style={{ paddingLeft: '3.25rem' }}
                />
                <kbd className="pointer-events-none absolute right-4 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md border border-surface-200 bg-surface-50 font-mono text-xs text-surface-400 sm:flex dark:border-surface-700 dark:bg-surface-800">
                  /
                </kbd>
              </div>
            </div>

            {/* Category pills */}
            <div className="mt-6 flex flex-wrap justify-center gap-2" aria-label="Category filters">
              <button
                type="button"
                onClick={() => selectCategory('all')}
                aria-pressed={activeCategory === 'all'}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  activeCategory === 'all'
                    ? 'border-brand-500 bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                    : 'border-surface-200 bg-white/70 text-surface-600 backdrop-blur hover:border-brand-300 hover:text-brand-600 dark:border-surface-700 dark:bg-surface-900/70 dark:text-surface-300'
                }`}
              >
                All ({calculators.length})
              </button>
              {populatedCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => selectCategory(category.id)}
                  aria-pressed={activeCategory === category.id}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition ${
                    activeCategory === category.id
                      ? 'border-brand-500 bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                      : 'border-surface-200 bg-white/70 text-surface-600 backdrop-blur hover:border-brand-300 hover:text-brand-600 dark:border-surface-700 dark:bg-surface-900/70 dark:text-surface-300'
                  }`}
                >
                  <CategoryIcon category={category.id} className="h-4 w-4" />
                  {category.name} ({categoryCounts[category.id]})
                </button>
              ))}
            </div>

            {/* Trust strip */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-surface-500 dark:text-surface-400">
              {['Transparent calculation trail', 'Tolerance-aware designers', 'Local-first project sheets'].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AdBanner />
      </section>

      {/* ───────────────────────── Content ───────────────────────── */}
      <section id="calculators" className="scroll-mt-24 mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {isFiltering ? (
          <>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                  {filtered.length} matching {filtered.length === 1 ? 'calculator' : 'calculators'}
                </p>
                <h2 className="font-display text-2xl font-bold text-surface-950 dark:text-white">
                  {activeCategory !== 'all' && !trimmedSearch
                    ? categories.find((c) => c.id === activeCategory)?.name
                    : 'Search results'}
                </h2>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-md border border-surface-300 px-3 py-2 text-sm text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-900"
              >
                Clear
              </button>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((calculator) => (
                  <CalculatorCard
                    key={calculator.meta.slug}
                    meta={calculator.meta}
                    formula={calculator.formula}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-surface-300 bg-surface-50 p-8 text-center dark:border-surface-700 dark:bg-surface-900">
                <h3 className="font-display text-lg font-bold text-surface-950 dark:text-white">
                  No matching calculators
                </h3>
                <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
                  Try a broader formula, unit, or category search — or{' '}
                  <Link href="/feedback" className="text-brand-600 underline hover:text-brand-700 dark:text-brand-400">
                    request the calculator
                  </Link>{' '}
                  you were after.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-14">
            <div className="grid gap-4 lg:grid-cols-3">
              {[
                {
                  eyebrow: 'Calculate',
                  title: '41 free, deterministic tools',
                  copy: 'From fundamentals to PCB loss, ADC resolution, filters, battery runtime, and three-phase power.',
                  href: '#calculators',
                  action: 'Browse tools',
                },
                {
                  eyebrow: 'Document',
                  title: 'Build a calculation sheet',
                  copy: 'Save results into named projects, add assumptions, and export CSV, JSON, or a clean PDF-ready report.',
                  href: '/workspace',
                  action: 'Open workspace',
                },
                {
                  eyebrow: 'Upgrade',
                  title: 'Pay for workflow, not formulas',
                  copy: 'Pro adds secure cloud projects, device-to-device recovery, and a durable workflow layer around free calculations.',
                  href: '/pricing',
                  action: 'See Pro',
                },
              ].map((item) => (
                <Link key={item.title} href={item.href} className="group rounded-2xl border border-surface-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg dark:border-surface-800 dark:bg-surface-900 dark:hover:border-brand-800">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">{item.eyebrow}</p>
                  <h2 className="mt-3 font-display text-xl font-bold text-surface-950 dark:text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-surface-500 dark:text-surface-400">{item.copy}</p>
                  <span className="mt-5 inline-flex text-sm font-bold text-brand-600 group-hover:translate-x-1 dark:text-brand-400">{item.action} →</span>
                </Link>
              ))}
            </div>

            {/* Popular tools */}
            {popular.length > 0 && (
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <h2 className="font-display text-xl font-bold text-surface-950 dark:text-white">
                      Most-used and new workflows
                    </h2>
                    <span className="rounded-full bg-surface-100 px-2.5 py-0.5 text-xs font-semibold text-surface-500 dark:bg-surface-800 dark:text-surface-400">
                      {popular.length}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {popular.map((calculator) => (
                    <CalculatorCard
                      key={calculator.meta.slug}
                      meta={calculator.meta}
                      formula={calculator.formula}
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm text-surface-500 dark:text-surface-400">
                  Looking for something else? Browse all {calculators.length} tools from the{' '}
                  <strong className="font-semibold text-surface-700 dark:text-surface-200">
                    Calculators
                  </strong>{' '}
                  menu at the top, or filter by category above.
                </p>
              </div>
            )}

            {/* CTA band */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 p-8 text-white shadow-xl shadow-brand-500/10 sm:p-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-violet-400/20 blur-2xl"
              />
              <span aria-hidden="true" className="pointer-events-none absolute right-10 bottom-2 hidden select-none font-mono text-[5rem] font-bold leading-none text-white/10 sm:block">
                π
              </span>
              <div className="relative">
                <h2 className="font-display text-2xl font-bold sm:text-3xl">Help shape the next engineering workflow.</h2>
                <p className="mt-2 max-w-xl leading-relaxed text-brand-100">
                  Tell us what you calculate repeatedly, what assumptions you need to capture, and
                  what a review-ready report must contain. Real workflows set the roadmap.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/feedback"
                    className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition-colors hover:bg-brand-50"
                  >
                    Request a calculator
                  </Link>
                  <a
                    href="https://github.com/Sebby1770/engineering-calculator-hub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    View on GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
