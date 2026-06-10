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
      className="group relative flex flex-col rounded-lg border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg hover:shadow-brand-500/5 hover:-translate-y-0.5 transition-all duration-200"
    >
      {meta.new && (
        <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
          New
        </span>
      )}
      <div
        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${iconGradient} flex items-center justify-center text-lg font-mono font-bold text-white mb-3 shadow-sm`}
      >
        {meta.icon}
      </div>
      <h3 className="font-display font-semibold text-surface-900 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
        {meta.shortTitle}
      </h3>
      <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed line-clamp-2">
        {meta.description.split('.')[0]}.
      </p>
      {formula && (
        <div className="mt-auto pt-3">
          <code className="inline-block max-w-full truncate rounded-md bg-surface-50 dark:bg-surface-800/70 border border-surface-200 dark:border-surface-700 px-2 py-1 font-mono text-xs text-surface-600 dark:text-surface-300">
            {formula}
          </code>
        </div>
      )}
      <span
        aria-hidden="true"
        className="absolute bottom-4 right-4 text-brand-500 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </Link>
  );
}
