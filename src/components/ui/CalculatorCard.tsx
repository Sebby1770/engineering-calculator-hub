import Link from 'next/link';
import { CalculatorMeta } from '@/types';
import { categories } from '@/data/categories';

interface CalculatorCardProps {
  meta: CalculatorMeta;
  formula?: string;
}

export default function CalculatorCard({ meta, formula }: CalculatorCardProps) {
  const category = categories.find((c) => c.id === meta.category);
  const iconGradient = category?.color ?? 'from-brand-500 to-brand-700';

  return (
    <Link
      href={`/${meta.slug}`}
      className="plate plate-corners card-sheen group relative flex flex-col overflow-hidden p-5 pl-6 transition-all duration-200 hover:-translate-y-0.5"
    >
      <span className="screw right-2 top-2 hidden sm:block" />
      {meta.new && (
        <span className="absolute top-3 right-3 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
          New
        </span>
      )}
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${iconGradient} font-mono text-lg font-bold text-white shadow-sm`}
      >
        {meta.icon}
      </div>
      <h3 className="mb-1 font-display font-semibold text-surface-900 transition-colors group-hover:text-forge-700 dark:text-white dark:group-hover:text-forge-300">
        {meta.shortTitle}
      </h3>
      <p className="text-sm leading-relaxed text-surface-500 line-clamp-2 dark:text-surface-400">
        {meta.description.split('.')[0]}.
      </p>
      {formula && (
        <div className="mt-auto -mx-5 -mb-5 ml-[-1.5rem] border-t border-forge-500/20 bg-surface-50/90 px-6 py-2 dark:border-forge-400/15 dark:bg-surface-950/60">
          <code className="block max-w-full truncate font-mono text-[11px] text-forge-800 dark:text-cyan-200">
            {formula}
          </code>
        </div>
      )}
      <span
        aria-hidden="true"
        className="absolute bottom-4 right-4 -translate-x-1 text-forge-500 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </Link>
  );
}
