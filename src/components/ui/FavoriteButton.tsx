'use client';

import { useState, useEffect } from 'react';

export default function FavoriteButton({ slug }: { slug: string }) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const favs: string[] = JSON.parse(localStorage.getItem('ech-favorites') || '[]');
    setIsFav(favs.includes(slug));
  }, [slug]);

  const toggle = () => {
    const favs: string[] = JSON.parse(localStorage.getItem('ech-favorites') || '[]');
    const next = isFav ? favs.filter((f) => f !== slug) : [...favs, slug];
    localStorage.setItem('ech-favorites', JSON.stringify(next));
    setIsFav(!isFav);
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-surface-300 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={isFav ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        className={isFav ? 'text-amber-500' : ''}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      {isFav ? 'Saved' : 'Save'}
    </button>
  );
}
