'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { calculators, getPopularCalculators } from '@/data/calculators';
import { categories } from '@/data/categories';
import CalculatorCard from '@/components/ui/CalculatorCard';
import { AdBanner } from '@/components/ads';
import type { CalculatorConfig, Category } from '@/types';

type CategoryFilter = 'all' | Category;

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
  const popular = getPopularCalculators();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const searchRef = useRef<HTMLInputElement>(null);
  const trimmedSearch = search.trim().toLowerCase();

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

  // Only show categories that actually contain calculators.
  const populatedCategories = useMemo(
    () => categories.filter((category) => calculators.some((c) => c.meta.category === category.id)),
    []
  );

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

  const resetFilters = () => {
    setSearch('');
    setActiveCategory('all');
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
              {calculators.length} free calculators — no sign-up, ever
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight text-surface-950 dark:text-white sm:text-6xl">
              Engineering{' '}
              <span className="animate-gradient-x bg-gradient-to-r from-brand-600 via-violet-500 to-brand-600 bg-[length:200%_auto] bg-clip-text text-transparent motion-reduce:animate-none dark:from-brand-400 dark:via-violet-400 dark:to-brand-400">
                Calculator Hub
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-surface-600 dark:text-surface-300">
              Every formula you reach for — circuits, signals, physics, and conversions — each on
              its own fast page. Pick one below and start calculating.
            </p>

            {/* Search */}
            <div className="mt-8">
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
                onClick={() => setActiveCategory('all')}
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
                  onClick={() => setActiveCategory(category.id)}
                  aria-pressed={activeCategory === category.id}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    activeCategory === category.id
                      ? 'border-brand-500 bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                      : 'border-surface-200 bg-white/70 text-surface-600 backdrop-blur hover:border-brand-300 hover:text-brand-600 dark:border-surface-700 dark:bg-surface-900/70 dark:text-surface-300'
                  }`}
                >
                  <span className="mr-1.5">{category.icon}</span>
                  {category.name} ({categoryCounts[category.id]})
                </button>
              ))}
            </div>

            {/* Trust strip */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-surface-500 dark:text-surface-400">
              {['Free & open source', 'Runs in your browser', 'Formulas + worked examples'].map((item) => (
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

      {/* ───────────────────────── Listing ───────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {isFiltering ? (
          <>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                  {filtered.length} matching {filtered.length === 1 ? 'calculator' : 'calculators'}
                </p>
                <h2 className="font-display text-2xl font-bold text-surface-950 dark:text-white">
                  Search results
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
            {/* Popular */}
            {popular.length > 0 && (
              <div id="popular">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <h2 className="font-display text-xl font-bold text-surface-950 dark:text-white">
                      Popular calculators
                    </h2>
                    <span className="rounded-full bg-surface-100 px-2.5 py-0.5 text-xs font-semibold text-surface-500 dark:bg-surface-800 dark:text-surface-400">
                      {popular.length}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {popular.map((calculator) => (
                    <CalculatorCard
                      key={calculator.meta.slug}
                      meta={calculator.meta}
                      formula={calculator.formula}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* By category */}
            {populatedCategories.map((category) => (
              <div key={category.id} id={category.id} className="scroll-mt-24">
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${category.color} text-lg font-bold text-white shadow-sm`}
                  >
                    {category.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-3">
                      <h2 className="font-display text-xl font-bold text-surface-950 dark:text-white">
                        {category.name}
                      </h2>
                      <span className="rounded-full bg-surface-100 px-2.5 py-0.5 text-xs font-semibold text-surface-500 dark:bg-surface-800 dark:text-surface-400">
                        {categoryCounts[category.id]}
                      </span>
                    </div>
                    <p className="text-sm text-surface-500 dark:text-surface-400">
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {calculators
                    .filter((calculator) => calculator.meta.category === category.id)
                    .map((calculator) => (
                      <CalculatorCard
                        key={calculator.meta.slug}
                        meta={calculator.meta}
                        formula={calculator.formula}
                      />
                    ))}
                </div>
              </div>
            ))}

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
                <h2 className="font-display text-2xl font-bold sm:text-3xl">Missing a calculator?</h2>
                <p className="mt-2 max-w-xl leading-relaxed text-brand-100">
                  Tell us the formula you keep reaching for and we&apos;ll consider it for the next
                  release — or open an issue and build it with us.
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
