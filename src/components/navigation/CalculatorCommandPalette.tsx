'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculators } from '@/data/calculators';
import { categories } from '@/data/categories';
import {
  CALCULATOR_ACTIVITY_EVENT,
  getCalculatorActivity,
  OPEN_CALCULATOR_SEARCH_EVENT,
  type CalculatorActivity,
} from '@/lib/calculatorActivity';
import { rankCalculators } from '@/lib/calculatorSearch';

const MAX_RESULTS = 9;

function calculatorsForSlugs(slugs: string[]) {
  return slugs.flatMap((slug) => {
    const calculator = calculators.find((item) => item.meta.slug === slug);
    return calculator ? [calculator] : [];
  });
}

export default function CalculatorCommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [activity, setActivity] = useState<CalculatorActivity>({ favorites: [], recent: [] });
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeOptionRef = useRef<HTMLAnchorElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const close = () => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
  };

  useEffect(() => {
    const refreshActivity = () => setActivity(getCalculatorActivity());
    const show = () => {
      if (!dialogRef.current) {
        previousFocusRef.current = document.activeElement as HTMLElement | null;
      }
      refreshActivity();
      setQuery('');
      setActiveIndex(0);
      setOpen(true);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        show();
      }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === 'ech-favorites' || event.key === 'ech-recent-calculators') refreshActivity();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('storage', onStorage);
    window.addEventListener(CALCULATOR_ACTIVITY_EVENT, refreshActivity);
    window.addEventListener(OPEN_CALCULATOR_SEARCH_EVENT, show);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(CALCULATOR_ACTIVITY_EVENT, refreshActivity);
      window.removeEventListener(OPEN_CALCULATOR_SEARCH_EVENT, show);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open]);

  const suggested = useMemo(() => {
    const favorites = calculatorsForSlugs(activity.favorites);
    const favoriteSlugs = new Set(favorites.map((item) => item.meta.slug));
    const recent = calculatorsForSlugs(activity.recent).filter(
      (item) => !favoriteSlugs.has(item.meta.slug),
    );
    const used = new Set([...favorites, ...recent].map((item) => item.meta.slug));
    const fallback = calculators.filter(
      (item) => item.meta.popular && !used.has(item.meta.slug),
    );
    return [...favorites, ...recent, ...fallback].slice(0, MAX_RESULTS);
  }, [activity]);

  const results = useMemo(
    () => (query.trim() ? rankCalculators(calculators, query).slice(0, MAX_RESULTS) : suggested),
    [query, suggested],
  );

  useEffect(() => {
    if (open && results.length) {
      activeOptionRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, open, results]);

  const chooseResult = (index: number) => {
    const result = results[index];
    if (!result) return;
    router.push(`/${result.meta.slug}`);
    close();
  };

  const onDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (results.length ? (index + 1) % results.length : 0));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (results.length ? (index - 1 + results.length) % results.length : 0));
      return;
    }
    if (event.key === 'Enter' && document.activeElement === inputRef.current) {
      event.preventDefault();
      chooseResult(activeIndex);
      return;
    }
    if (event.key === 'Tab' && dialogRef.current) {
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('input, button, a[href]'),
      ).filter((element) => !element.hasAttribute('disabled'));
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-start justify-center bg-surface-950/55 px-4 pt-[8vh] backdrop-blur-sm sm:pt-[12vh]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="calculator-finder-title"
        onKeyDown={onDialogKeyDown}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-2xl shadow-surface-950/30 dark:border-surface-700 dark:bg-surface-900"
      >
        <div className="border-b border-surface-200 p-4 dark:border-surface-800">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 shrink-0 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <div className="min-w-0 flex-1">
              <h2 id="calculator-finder-title" className="sr-only">Find a calculator</h2>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                role="combobox"
                aria-label="Search calculators"
                aria-autocomplete="list"
                aria-expanded="true"
                aria-controls="calculator-finder-results"
                aria-activedescendant={results[activeIndex] ? `calculator-result-${activeIndex}` : undefined}
                autoComplete="off"
                placeholder="Search a formula, unit, or tool…"
                className="w-full bg-transparent text-base font-medium text-surface-950 outline-none placeholder:text-surface-400 dark:text-white"
              />
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close calculator finder"
              className="rounded-md border border-surface-200 px-2 py-1 font-mono text-xs text-surface-500 hover:bg-surface-100 dark:border-surface-700 dark:hover:bg-surface-800"
            >
              Esc
            </button>
          </div>
          <p className="mt-2 pl-8 text-xs text-surface-400" aria-live="polite">
            {query.trim()
              ? `${results.length} ${results.length === 1 ? 'match' : 'matches'}`
              : activity.favorites.length || activity.recent.length
                ? 'Your favourites and recently viewed tools'
                : 'Popular tools to get started'}
          </p>
        </div>

        <div id="calculator-finder-results" role="listbox" className="max-h-[58vh] overflow-y-auto p-2">
          {results.length ? (
            results.map((calculator, index) => {
              const category = categories.find((item) => item.id === calculator.meta.category);
              const isFavorite = activity.favorites.includes(calculator.meta.slug);
              const isRecent = activity.recent.includes(calculator.meta.slug);
              return (
                <Link
                  id={`calculator-result-${index}`}
                  role="option"
                  aria-selected={activeIndex === index}
                  ref={activeIndex === index ? activeOptionRef : undefined}
                  key={calculator.meta.slug}
                  href={`/${calculator.meta.slug}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onClick={close}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 outline-none transition ${
                    activeIndex === index
                      ? 'bg-brand-50 text-brand-800 dark:bg-brand-950/50 dark:text-brand-200'
                      : 'text-surface-700 hover:bg-surface-50 dark:text-surface-200 dark:hover:bg-surface-800'
                  }`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${category?.color || 'from-brand-500 to-brand-700'} font-mono text-sm font-bold text-white`}>
                    {calculator.meta.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-semibold">{calculator.meta.shortTitle}</span>
                      {isFavorite && <span className="text-xs text-amber-500" aria-label="Favourite">★</span>}
                    </span>
                    <span className="block truncate text-xs text-surface-500 dark:text-surface-400">
                      {category?.name} · {calculator.formula}
                    </span>
                  </span>
                  {!query.trim() && isRecent && !isFavorite && (
                    <span className="hidden rounded-full bg-surface-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-surface-500 sm:inline dark:bg-surface-800 dark:text-surface-400">
                      Recent
                    </span>
                  )}
                  <svg className="h-4 w-4 shrink-0 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
                </Link>
              );
            })
          ) : (
            <div className="px-6 py-10 text-center">
              <p className="font-semibold text-surface-800 dark:text-surface-100">No tool matches that search.</p>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Try a component, quantity, formula, or unit.</p>
              <Link href="/feedback" onClick={close} className="mt-4 inline-flex text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
                Request a calculator
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-surface-200 bg-surface-50 px-4 py-2 text-[11px] text-surface-400 dark:border-surface-800 dark:bg-surface-950/50">
          <span><kbd className="font-mono">↑↓</kbd> choose · <kbd className="font-mono">Enter</kbd> open</span>
          <Link href="/workspace" onClick={close} className="font-semibold text-brand-600 hover:underline dark:text-brand-400">Open workspace →</Link>
        </div>
      </div>
    </div>
  );
}
