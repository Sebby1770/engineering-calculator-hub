'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from './ThemeProvider';
import { categories } from '@/data/categories';
import { calculators } from '@/data/calculators';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { openCalculatorSearch } from '@/lib/calculatorActivity';

// Calculators grouped by category, for the dropdown + mobile menu.
const calculatorsByCategory = categories
  .map((category) => ({
    category,
    items: calculators.filter((calc) => calc.meta.category === category.id),
  }))
  .filter((group) => group.items.length > 0);

export default function Header() {
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [calcMenuOpen, setCalcMenuOpen] = useState(false);
  const calcMenuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown on outside click or Escape.
  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (calcMenuRef.current && !calcMenuRef.current.contains(event.target as Node)) {
        setCalcMenuOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setCalcMenuOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-forge-500/25 bg-white/80 backdrop-blur-xl dark:border-forge-400/20 dark:bg-surface-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-forge-400 to-cyan-700 text-white shadow-sm ring-1 ring-forge-300/70">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="3.2" />
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                <path d="M6.4 6.4l2.1 2.1M15.5 15.5l2.1 2.1M17.6 6.4l-2.1 2.1M8.5 15.5l-2.1 2.1" />
              </svg>
            </div>
            <span className="font-display font-bold text-lg text-surface-900 dark:text-white hidden sm:block">
              EngCalc<span className="text-forge-600 dark:text-forge-300">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* All-calculators dropdown — the primary navigation */}
            <div
              ref={calcMenuRef}
              className="relative"
              onMouseEnter={() => setCalcMenuOpen(true)}
              onMouseLeave={() => setCalcMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setCalcMenuOpen((open) => !open)}
                aria-haspopup="true"
                aria-expanded={calcMenuOpen}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-surface-700 dark:text-surface-200 hover:text-brand-600 dark:hover:text-brand-400 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                Calculators
                <svg
                  className={`h-4 w-4 transition-transform ${calcMenuOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {calcMenuOpen && (
                <div
                  role="menu"
                  aria-label="All calculators"
                  className="absolute left-0 top-full max-h-[72vh] w-[64rem] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-forge-400/25 bg-white p-5 shadow-2xl dark:border-forge-500/20 dark:bg-surface-900"
                >
                  <div className="grid grid-cols-2 gap-x-8 gap-y-5 xl:grid-cols-4">
                    {calculatorsByCategory.map(({ category, items }) => (
                      <div key={category.id}>
                        <div className="mb-2 flex items-center gap-2 text-surface-500 dark:text-surface-400">
                          <CategoryIcon category={category.id} className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            {category.name}
                          </span>
                        </div>
                        <ul className="space-y-0.5">
                          {items.map((calc) => (
                            <li key={calc.meta.slug}>
                              <Link
                                href={`/${calc.meta.slug}`}
                                role="menuitem"
                                onClick={() => setCalcMenuOpen(false)}
                                className="block rounded-md px-2 py-1.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950/40 dark:hover:text-brand-300 transition-colors"
                              >
                                {calc.meta.shortTitle}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/workspace"
              className="px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              Workspace
            </Link>
            <Link
              href="/pricing"
              className="px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              Pricing
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCalculatorSearch}
              aria-label="Find a calculator"
              aria-keyshortcuts="Meta+K Control+K"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-surface-200 bg-white px-2.5 text-sm font-medium text-surface-600 shadow-sm transition hover:border-brand-300 hover:text-brand-600 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:border-brand-700 dark:hover:text-brand-300 sm:px-3"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <span className="hidden xl:inline">Find tools</span>
              <kbd className="hidden rounded border border-surface-200 bg-surface-50 px-1.5 py-0.5 font-mono text-[10px] text-surface-400 dark:border-surface-700 dark:bg-surface-800 sm:inline">⌘K</kbd>
            </button>
            <Link
              href="/account"
              className="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              Account
            </Link>
            <Link href="/pricing" className="hidden rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-700 sm:inline-flex">
              Go Pro
            </Link>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle theme"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
              aria-label="Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu — full calculator list grouped by category */}
        {mobileOpen && (
          <nav className="lg:hidden py-4 border-t border-surface-200 dark:border-surface-800 animate-fade-in">
            {calculatorsByCategory.map(({ category, items }) => (
              <div key={category.id} className="mb-3">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400">
                  <CategoryIcon category={category.id} className="h-4 w-4" />
                  {category.name}
                </div>
                <ul>
                  {items.map((calc) => (
                    <li key={calc.meta.slug}>
                      <Link
                        href={`/${calc.meta.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-md px-3 py-2 pl-9 text-sm text-surface-600 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-surface-100 dark:hover:bg-surface-800"
                      >
                        {calc.meta.shortTitle}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="border-t border-surface-200 pt-3 dark:border-surface-800">
              {[
                ['/workspace', 'Engineering Workspace'],
                ['/pricing', 'Pricing'],
                ['/about', 'About'],
                ['/feedback', 'Feedback'],
                ['/account', 'Account'],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-surface-100 dark:hover:bg-surface-800"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
