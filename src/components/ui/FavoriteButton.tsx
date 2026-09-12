'use client';

import { useState, useEffect } from 'react';
import {
  CALCULATOR_ACTIVITY_EVENT,
  FAVORITES_STORAGE_KEY,
  isFavoriteCalculator,
  toggleFavoriteCalculator,
} from '@/lib/calculatorActivity';

export default function FavoriteButton({ slug }: { slug: string }) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const refresh = () => setIsFav(isFavoriteCalculator(slug));
    const onStorage = (event: StorageEvent) => {
      if (event.key === FAVORITES_STORAGE_KEY || event.key === null) refresh();
    };
    refresh();
    window.addEventListener(CALCULATOR_ACTIVITY_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CALCULATOR_ACTIVITY_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, [slug]);

  const toggle = () => {
    setIsFav(toggleFavoriteCalculator(slug));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isFav}
      aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-surface-300 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
      title={isFav ? 'Remove from favourites' : 'Add to favourites'}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={isFav ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        className={isFav ? 'text-amber-500' : ''}
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      {isFav ? 'Saved' : 'Favourite'}
    </button>
  );
}
