import type { Category } from '@/types';

// Formal line icons (no emoji) for the engineering categories.
const PATHS: Record<Category, React.ReactNode> = {
  electrical: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  mathematics: <path d="M18 4H8.6a.6.6 0 00-.46.98L14 12l-5.86 7.02a.6.6 0 00.46.98H18" />,
  physics: (
    <>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="9" ry="3.8" />
      <ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(120 12 12)" />
    </>
  ),
  conversions: (
    <>
      <path d="M7 8h10" />
      <path d="M13 4l4 4-4 4" />
      <path d="M17 16H7" />
      <path d="M11 20l-4-4 4-4" />
    </>
  ),
  signals: <path d="M2 12c2-6.5 4-6.5 6 0s4 6.5 6 0 4-6.5 8 0" />,
};

interface CategoryIconProps {
  category: Category;
  className?: string;
}

export default function CategoryIcon({ category, className = 'h-4 w-4' }: CategoryIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[category]}
    </svg>
  );
}
