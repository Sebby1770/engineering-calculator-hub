import type { Category } from "@/types";

// Formal line icons (no emoji) for the engineering categories.
const PATHS: Record<Category, React.ReactNode> = {
  mechanical: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.2v2.2M12 18.6v2.2M3.2 12h2.2M18.6 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M5.4 18.6l1.6-1.6M17 7l1.6-1.6" />
    </>
  ),
  civil: (
    <>
      <path d="M4 20V7l8-3 8 3v13" />
      <path d="M4 20h16" />
      <path d="M10 20v-6h4v6" />
      <path d="M8 10h.01M16 10h.01" />
    </>
  ),
  thermofluids: (
    <>
      <path d="M12 3v10" />
      <circle cx="12" cy="17" r="3" />
      <path d="M4 8c2 2 3.5 2 5.5 0s3.5-2 5.5 0 3.5 2 5 0" />
    </>
  ),
  materials: (
    <>
      <path d="M9 3h6" />
      <path d="M10 3v6L5.8 17.2A3.2 3.2 0 008.6 22h6.8a3.2 3.2 0 002.8-4.8L14 9V3" />
      <path d="M8.5 14.5h7" />
    </>
  ),
  electrical: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  mathematics: (
    <path d="M18 4H8.6a.6.6 0 00-.46.98L14 12l-5.86 7.02a.6.6 0 00.46.98H18" />
  ),
  calculus: (
    <>
      <path d="M6 18c4-8 8-8 12-14" />
      <path d="M6 6h12" />
    </>
  ),
  geometry: <path d="M12 3l9 16H3L12 3z" />,
  linear_algebra: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
      <path d="M11 7h2M7 11v2M17 11h-2M13 17v-2" />
    </>
  ),
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
  digital: (
    <>
      <rect x="3" y="7" width="18" height="10" rx="2" />
      <path d="M7 12h2M11 12h2M15 12h2" />
    </>
  ),
};

interface CategoryIconProps {
  category: Category;
  className?: string;
}

export default function CategoryIcon({
  category,
  className = "h-4 w-4",
}: CategoryIconProps) {
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
