'use client';

import { useState } from 'react';
import Link from 'next/link';
import { calculators, getPopularCalculators } from '@/data/calculators';
import { categories } from '@/data/categories';
import CalculatorCard from '@/components/ui/CalculatorCard';
import { AdBanner, AdInContent, AdBetweenCards } from '@/components/ads';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const popular = getPopularCalculators();
  const trimmedSearch = search.trim().toLowerCase();

  const filtered = trimmedSearch
    ? calculators.filter(
        (c) =>
          c.meta.title.toLowerCase().includes(trimmedSearch) ||
          c.meta.shortTitle.toLowerCase().includes(trimmedSearch) ||
          c.meta.keywords.some((k) => k.toLowerCase().includes(trimmedSearch)) ||
          c.meta.description.toLowerCase().includes(trimmedSearch)
      )
    : null;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-surface-200 dark:border-surface-800">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-400/10 dark:bg-brand-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-sm font-medium mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {calculators.length} free calculators available
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-surface-900 dark:text-white mb-4 animate-slide-up">
            Engineering Calculator
            <span className="text-brand-500"> Hub</span>
          </h1>

          <p className="text-lg sm:text-xl text-surface-600 dark:text-surface-400 max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Free, fast, and accurate calculators for electrical engineering, physics, mathematics, and unit conversions.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search calculators... (e.g. ohms law, voltage divider)"
                className="w-full rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 pl-12 pr-4 py-4 text-base outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search results */}
      {filtered !== null && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white mb-4">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
          </h2>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c) => (
                <CalculatorCard key={c.meta.slug} meta={c.meta} />
              ))}
            </div>
          ) : (
            <p className="text-surface-500 dark:text-surface-400">
              No calculators found. Try a different search term.
            </p>
          )}
        </section>
      )}

      {/* Rest of page (hidden during search) */}
      {filtered === null && (
        <>
          {/* Top banner ad */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
            <AdBanner />
          </div>

          {/* Popular calculators */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-surface-900 dark:text-white">
                ⚡ Popular Calculators
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popular.map((c) => (
                <CalculatorCard key={c.meta.slug} meta={c.meta} />
              ))}
            </div>
          </section>

          {/* Categories grid */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
            <h2 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-6">
              Browse by Category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/#${cat.id}`}
                  className="group rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl text-white mb-3`}>
                    {cat.icon}
                  </div>
                  <h3 className="font-display font-semibold text-surface-900 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2">
                    {cat.description}
                  </p>
                  <span className="text-xs text-surface-400 dark:text-surface-500 mt-2 block">
                    {calculators.filter((c) => c.meta.category === cat.id).length} calculators
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <AdInContent />

          {/* All calculators by category */}
          {categories.map((cat, catIdx) => (
            <section key={cat.id} id={cat.id} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center text-lg text-white`}>
                  {cat.icon}
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white">
                    {cat.name}
                  </h2>
                  <p className="text-sm text-surface-500 dark:text-surface-400">{cat.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {calculators
                  .filter((c) => c.meta.category === cat.id)
                  .map((c) => (
                    <CalculatorCard key={c.meta.slug} meta={c.meta} />
                  ))}
              </div>
              {catIdx === 1 && <AdBetweenCards className="mt-6" />}
            </section>
          ))}

          {/* Bottom SEO text */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
            <div className="rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white mb-3">
                About Engineering Calculator Hub
              </h2>
              <div className="text-surface-600 dark:text-surface-400 space-y-3 text-sm leading-relaxed">
                <p>
                  Engineering Calculator Hub provides free, fast, and accurate online calculators for
                  engineering students, professionals, and hobbyists. Our tools cover electrical engineering
                  fundamentals like Ohm&apos;s Law, voltage dividers, and resistor calculations, as well as
                  physics, mathematics, and unit conversions.
                </p>
                <p>
                  Every calculator includes detailed formula explanations, worked examples, and frequently
                  asked questions to help you understand the underlying concepts. Whether you&apos;re studying
                  for an exam, designing a circuit, or converting units, our tools give you instant, reliable
                  results.
                </p>
                <p>
                  All calculators are free to use with no registration required. They work on any device —
                  desktop, tablet, or mobile. Results can be copied, shared, or saved for later reference.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
