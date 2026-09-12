'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { calculators } from '@/data/calculators';
import { categories } from '@/data/categories';
import CalculatorCard from '@/components/ui/CalculatorCard';
import CategoryIcon from '@/components/ui/CategoryIcon';
import DraftingCompass from '@/components/ui/DraftingCompass';
import CalculatorQuickAccess from '@/components/navigation/CalculatorQuickAccess';
import { rankCalculators } from '@/lib/calculatorSearch';
import { AdBanner } from '@/components/ads';
import type { Category } from '@/types';

type CategoryFilter = 'all' | Category;

const FEATURED_SLUGS = [
  'simply-supported-beam-calculator',
  'principal-stress-calculator',
  'manning-flow-calculator',
  'pump-power-calculator',
  'carnot-efficiency-calculator',
  'reynolds-number-calculator',
  'derivative-calculator',
  'triangle-calculator',
];

const TICKER = [
  'δ = PL³/48EI',
  'η = 1 − Tc/Th',
  'Re = ρvD/μ',
  'Q = (1/n)AR^{2/3}S^{1/2}',
  'σ1,2 = (σx+σy)/2 ± R',
  'P = ρgQH',
  'Q = hAΔT',
  'PV = nRT',
];

const BAY_FORMULAS: Partial<Record<Category, string>> = {
  mechanical: 'δ = PL³/48EI',
  civil: 'Q = (1/n)AR^{2/3}S^{1/2}',
  thermofluids: 'η = 1 − Tc/Th',
  materials: 'Re = ρvD/μ',
  electrical: 'V = IR',
  mathematics: 'f(x) → simplify',
  calculus: 'd/dx , ∫',
  geometry: 'a² + b² = c²',
  linear_algebra: 'Ax = b',
  physics: 'E = ½mv²',
  conversions: 'dB = 20 log(V₂/V₁)',
  signals: 'fc = 1/(2πRC)',
  digital: 'CIDR / mask',
};

export default function HomePage() {
  const popular = FEATURED_SLUGS.flatMap((slug) => {
    const calculator = calculators.find((item) => item.meta.slug === slug);
    return calculator ? [calculator] : [];
  });
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const searchRef = useRef<HTMLInputElement>(null);
  const trimmedSearch = search.trim();

  const populatedCategories = useMemo(
    () => categories.filter((category) => calculators.some((c) => c.meta.category === category.id)),
    [],
  );

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('category');
    if (param && categories.some((c) => c.id === param)) {
      setActiveCategory(param as Category);
    }
  }, []);

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
    const categoryMatches = calculators.filter(
      (calculator) => activeCategory === 'all' || calculator.meta.category === activeCategory,
    );
    return trimmedSearch ? rankCalculators(categoryMatches, trimmedSearch) : categoryMatches;
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

  const tickerItems = [...TICKER, ...TICKER];
  const newCount = calculators.filter((c) => c.meta.new).length;

  return (
    <div>
      <section className="workshop-hero relative overflow-hidden border-b border-forge-500/30 dark:border-forge-400/20">
        <div
          aria-hidden="true"
          className="scanlines absolute inset-0 bg-iso-blueprint animate-grid-shift motion-reduce:animate-none [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]"
        />

        <div className="formula-ticker relative" aria-hidden="true">
          <div className="formula-ticker-track animate-marquee motion-reduce:animate-none">
            {tickerItems.map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(17rem,0.85fr)] lg:px-8 lg:py-16">
          <div className="animate-slide-up">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-forge-700 dark:text-cyan-300">
              Plate {String(calculators.length).padStart(3, '0')} · SI · Review bay
            </p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-surface-950 dark:text-white sm:text-6xl lg:text-7xl">
              Draft on the bench.
              <span className="mt-2 block text-forge-700 dark:text-forge-300">Take it to review.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-surface-600 dark:text-surface-300">
              A mill-finished workshop of mechanical, civil, thermofluids, materials, and
              mathematics instruments. Formulas stay free. The sheet is what you keep.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/workspace" className="inline-flex items-center justify-center bg-forge-700 px-6 py-3 text-sm font-bold tracking-wide text-paper-50 shadow-[4px_4px_0_0_rgb(47,37,14)] transition hover:translate-x-px hover:translate-y-px hover:shadow-[3px_3px_0_0_rgb(47,37,14)] dark:shadow-[4px_4px_0_0_rgb(34,211,238)]">
                Open the workspace
              </Link>
              <a href="#calculators" className="inline-flex items-center justify-center border border-forge-700/40 bg-paper-50/80 px-6 py-3 text-sm font-bold text-forge-900 backdrop-blur transition hover:border-forge-700 dark:border-cyan-400/30 dark:bg-surface-900/70 dark:text-cyan-100">
                Pull a bay
              </a>
            </div>

            <div className="mt-8">
              <label htmlFor="calculator-search" className="sr-only">
                Search calculators
              </label>
              <div className="relative max-w-xl">
                <svg
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-forge-700/70 dark:text-cyan-300/70"
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
                  placeholder="Search formula, unit, or name…"
                  className="w-full border border-forge-700/30 bg-paper-50/90 py-3.5 pr-14 font-mono text-sm outline-none backdrop-blur transition focus:border-forge-600 focus:ring-2 focus:ring-forge-400/40 dark:border-cyan-400/20 dark:bg-surface-900/80 dark:focus:ring-cyan-500/30"
                  style={{ paddingLeft: '2.85rem' }}
                />
                <kbd className="pointer-events-none absolute right-3 top-1/2 hidden h-7 min-w-7 -translate-y-1/2 items-center justify-center border border-forge-700/25 bg-paper-100 px-1.5 font-mono text-[11px] text-forge-800 sm:flex dark:border-cyan-400/20 dark:bg-surface-800 dark:text-cyan-200">
                  /
                </kbd>
              </div>
            </div>
          </div>

          <div className="plate plate-corners relative mx-auto w-full max-w-md p-6 lg:max-w-none">
            <span className="screw left-3 top-3" />
            <span className="screw right-3 top-3" />
            <span className="screw bottom-3 left-3" />
            <span className="screw bottom-3 right-3" />
            <DraftingCompass className="mx-auto h-56 w-56 sm:h-64 sm:w-64" />
            <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-forge-700/20 pt-4 dark:border-cyan-400/15">
              {[
                { label: 'Bays', value: String(populatedCategories.length) },
                { label: 'Tools', value: String(calculators.length) },
                { label: 'New', value: String(newCount) },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-forge-700 dark:text-cyan-300">{stat.label}</dt>
                  <dd className="font-display text-2xl font-extrabold tabular-nums text-surface-950 dark:text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-surface-500 dark:text-surface-400">
              SI · worked steps · local-first
            </p>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2" aria-label="Category filters">
            <button
              type="button"
              onClick={() => selectCategory('all')}
              aria-pressed={activeCategory === 'all'}
              className={`border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition ${
                activeCategory === 'all'
                  ? 'border-forge-800 bg-forge-800 text-paper-50 dark:border-cyan-300 dark:bg-cyan-300 dark:text-surface-950'
                  : 'border-forge-700/25 bg-paper-50/70 text-forge-900 hover:border-forge-700 dark:border-cyan-400/20 dark:bg-surface-900/70 dark:text-cyan-100'
              }`}
            >
              All · {calculators.length}
            </button>
            {populatedCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => selectCategory(category.id)}
                aria-pressed={activeCategory === category.id}
                className={`inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition ${
                  activeCategory === category.id
                    ? 'border-forge-800 bg-forge-800 text-paper-50 dark:border-cyan-300 dark:bg-cyan-300 dark:text-surface-950'
                    : 'border-forge-700/25 bg-paper-50/70 text-forge-900 hover:border-forge-700 dark:border-cyan-400/20 dark:bg-surface-900/70 dark:text-cyan-100'
                }`}
              >
                <CategoryIcon category={category.id} className="h-3.5 w-3.5" />
                {category.name.split(' ')[0]} · {categoryCounts[category.id]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AdBanner />
      </section>

      <CalculatorQuickAccess />

      <section id="calculators" className="scroll-mt-24 mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {isFiltering ? (
          <>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-forge-700 dark:text-forge-300">
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
            <div>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-forge-600 dark:text-forge-300">Workshop bays</p>
                  <h2 className="font-display text-2xl font-bold text-surface-950 dark:text-white">Pick a discipline</h2>
                </div>
                <p className="hidden text-sm text-surface-500 sm:block dark:text-surface-400">
                  {populatedCategories.length} bays · {calculators.length} instruments
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {populatedCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => selectCategory(category.id)}
                    className="plate plate-corners card-sheen group p-5 text-left transition hover:-translate-y-0.5"
                  >
                    <span className="screw right-2 top-2" />
                    <div className="flex items-start justify-between gap-3">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${category.color} text-white shadow-sm`}>
                        <CategoryIcon category={category.id} className="h-5 w-5" />
                      </span>
                      <span className="font-mono text-[11px] text-surface-400">{categoryCounts[category.id]}</span>
                    </div>
                    <h3 className="mt-3 font-display text-base font-bold text-surface-950 group-hover:text-forge-700 dark:text-white dark:group-hover:text-forge-200">
                      {category.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-surface-500 dark:text-surface-400">
                      {category.description}
                    </p>
                    {BAY_FORMULAS[category.id] && (
                      <span className="formula-chip mt-3">{BAY_FORMULAS[category.id]}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {[
                {
                  eyebrow: 'Calculate',
                  title: `${calculators.length} free, deterministic tools`,
                  copy: 'Beams, channels, Carnot limits, and Reynolds numbers sit beside derivatives, triangles, and the electrical designers you already use.',
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
                  copy: 'Pro adds conflict-safe cloud autosave, recent version recovery, device-to-device continuity, and a durable workflow layer around free calculations.',
                  href: '/pricing',
                  action: 'See Pro',
                },
              ].map((item) => (
                <Link key={item.title} href={item.href} className="plate plate-corners group p-6 transition hover:-translate-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-forge-600 dark:text-forge-300">{item.eyebrow}</p>
                  <h2 className="mt-3 font-display text-xl font-bold text-surface-950 dark:text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-surface-500 dark:text-surface-400">{item.copy}</p>
                  <span className="mt-5 inline-flex text-sm font-bold text-brand-600 group-hover:translate-x-1 dark:text-brand-400">{item.action} →</span>
                </Link>
              ))}
            </div>

            {popular.length > 0 && (
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-forge-400 to-cyan-600 text-white shadow-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <h2 className="font-display text-xl font-bold text-surface-950 dark:text-white">
                      Mixed-discipline bench
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
                  menu at the top, or open a bay above.
                </p>
              </div>
            )}

            <div className="relative overflow-hidden border border-forge-800 bg-forge-900 p-8 text-paper-50 sm:p-10 dark:border-cyan-400/30">
              <span aria-hidden="true" className="pointer-events-none absolute right-8 top-4 font-mono text-[11px] uppercase tracking-[0.28em] text-forge-200/70">
                ECH · request bay
              </span>
              <span aria-hidden="true" className="pointer-events-none absolute -right-4 bottom-0 select-none font-display text-[7rem] font-extrabold leading-none text-white/5">
                Σ
              </span>
              <div className="relative max-w-2xl">
                <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Stamp the next plate.</h2>
                <p className="mt-3 leading-relaxed text-paper-100/85">
                  Tell us the calculation you repeat, the assumptions a reviewer needs, and what
                  the printed sheet must carry. Real benches write the catalogue.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/feedback"
                    className="bg-paper-50 px-5 py-2.5 text-sm font-bold text-forge-900 shadow-[3px_3px_0_0_rgb(212,176,86)] transition hover:translate-x-px hover:translate-y-px"
                  >
                    Request a calculator
                  </Link>
                  <a
                    href="https://github.com/Sebby1770/engineering-calculator-hub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-paper-50/40 px-5 py-2.5 text-sm font-bold text-paper-50 transition hover:bg-white/10"
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
