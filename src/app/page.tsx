'use client';

import { useMemo, useState } from 'react';
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
  const trimmedSearch = search.trim().toLowerCase();

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
      {/* Hero + search */}
      <section className="border-b border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-md border border-brand-200 bg-white px-2.5 py-1 font-medium text-brand-700 dark:border-brand-800 dark:bg-surface-900 dark:text-brand-300">
              {calculators.length} calculators
            </span>
            <span className="rounded-md border border-surface-200 bg-white px-2.5 py-1 text-surface-600 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300">
              {populatedCategories.length} engineering categories
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold tracking-normal text-surface-950 dark:text-white sm:text-5xl">
            Engineering Calculator Hub
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-surface-600 dark:text-surface-300">
            Pick a calculator below to open it on its own page. Fast tools for circuits, signals,
            physics, conversions, and daily engineering checks.
          </p>

          <div className="mt-6 max-w-3xl">
            <label htmlFor="calculator-search" className="sr-only">
              Search calculators
            </label>
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400"
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
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by formula, unit, or calculator name"
                className="w-full rounded-lg border border-surface-300 bg-white py-4 pl-12 pr-4 text-base shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-surface-700 dark:bg-surface-900 dark:focus:ring-brand-900"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2" aria-label="Category filters">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              aria-pressed={activeCategory === 'all'}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                activeCategory === 'all'
                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                  : 'border-surface-200 bg-white text-surface-600 hover:border-brand-300 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300'
              }`}
            >
              All
            </button>
            {populatedCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                aria-pressed={activeCategory === category.id}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                  activeCategory === category.id
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                    : 'border-surface-200 bg-white text-surface-600 hover:border-brand-300 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300'
                }`}
              >
                {category.name} ({categoryCounts[category.id]})
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AdBanner />
      </section>

      {/* Listing */}
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
                  <CalculatorCard key={calculator.meta.slug} meta={calculator.meta} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-surface-300 bg-surface-50 p-8 text-center dark:border-surface-700 dark:bg-surface-900">
                <h3 className="font-display text-lg font-bold text-surface-950 dark:text-white">
                  No matching calculators
                </h3>
                <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
                  Try a broader formula, unit, or category search.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-12">
            {/* Popular */}
            {popular.length > 0 && (
              <div id="popular">
                <h2 className="mb-4 font-display text-xl font-bold text-surface-950 dark:text-white">
                  Popular calculators
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {popular.map((calculator) => (
                    <CalculatorCard key={calculator.meta.slug} meta={calculator.meta} />
                  ))}
                </div>
              </div>
            )}

            {/* By category */}
            {populatedCategories.map((category) => (
              <div key={category.id} id={category.id} className="scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${category.color} text-lg font-bold text-white`}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-surface-950 dark:text-white">
                      {category.name}
                    </h2>
                    <p className="text-sm text-surface-500 dark:text-surface-400">
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {calculators
                    .filter((calculator) => calculator.meta.category === category.id)
                    .map((calculator) => (
                      <CalculatorCard key={calculator.meta.slug} meta={calculator.meta} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
