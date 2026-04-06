import Link from 'next/link';
import { CalculatorMeta } from '@/types';

export default function CalculatorCard({ meta }: { meta: CalculatorMeta }) {
  return (
    <Link
      href={`/${meta.slug}`}
      className="group relative flex flex-col rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-200"
    >
      {meta.new && (
        <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
          New
        </span>
      )}
      <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-lg font-mono font-bold text-brand-600 dark:text-brand-400 mb-3 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/30 transition-colors">
        {meta.icon}
      </div>
      <h3 className="font-display font-semibold text-surface-900 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
        {meta.shortTitle}
      </h3>
      <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed line-clamp-2">
        {meta.description.split('.')[0]}.
      </p>
    </Link>
  );
}
