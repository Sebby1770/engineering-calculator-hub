'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { calculators } from '@/data/calculators';
import { categories } from '@/data/categories';
import CategoryIcon from '@/components/ui/CategoryIcon';
import {
  CALCULATOR_ACTIVITY_EVENT,
  getCalculatorActivity,
  openCalculatorSearch,
  type CalculatorActivity,
} from '@/lib/calculatorActivity';

function calculatorsForSlugs(slugs: string[]) {
  return slugs.flatMap((slug) => {
    const calculator = calculators.find((item) => item.meta.slug === slug);
    return calculator ? [calculator] : [];
  });
}

export default function CalculatorQuickAccess() {
  const [activity, setActivity] = useState<CalculatorActivity>({ favorites: [], recent: [] });

  useEffect(() => {
    const refresh = () => setActivity(getCalculatorActivity());
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === 'ech-favorites' || event.key === 'ech-recent-calculators') refresh();
    };
    refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener(CALCULATOR_ACTIVITY_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(CALCULATOR_ACTIVITY_EVENT, refresh);
    };
  }, []);

  const items = useMemo(() => {
    const favorites = calculatorsForSlugs(activity.favorites);
    const favoriteSlugs = new Set(favorites.map((item) => item.meta.slug));
    const recent = calculatorsForSlugs(activity.recent).filter(
      (item) => !favoriteSlugs.has(item.meta.slug),
    );
    return [...favorites.slice(0, 4), ...recent.slice(0, Math.max(0, 4 - favorites.length))];
  }, [activity]);

  if (!items.length) return null;

  return (
    <section aria-labelledby="quick-access-title" className="mx-auto max-w-7xl px-4 pb-9 sm:px-6 lg:px-8">
      <div className="plate plate-corners p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">Your toolbox</p>
            <h2 id="quick-access-title" className="mt-1 font-display text-xl font-bold text-surface-950 dark:text-white">
              Pick up where you left off
            </h2>
          </div>
          <button type="button" onClick={openCalculatorSearch} className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
            Find any calculator <span aria-hidden="true">⌘K</span>
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((calculator) => {
            const category = categories.find((item) => item.id === calculator.meta.category);
            const favorite = activity.favorites.includes(calculator.meta.slug);
            return (
              <Link
                key={calculator.meta.slug}
                href={`/${calculator.meta.slug}`}
                className="group flex min-w-0 items-center gap-3 rounded-xl border border-surface-200 bg-white p-3 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-surface-700 dark:bg-surface-900 dark:hover:border-brand-700"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm ring-1 ring-surface-200 dark:bg-surface-800 dark:text-brand-300 dark:ring-surface-700">
                  <CategoryIcon category={calculator.meta.category} className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 truncate text-sm font-bold text-surface-800 group-hover:text-brand-700 dark:text-surface-100 dark:group-hover:text-brand-300">
                    {calculator.meta.shortTitle}
                    {favorite && <span className="text-amber-500" aria-label="Favourite">★</span>}
                  </span>
                  <span className="block truncate text-xs text-surface-400">{category?.name}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
