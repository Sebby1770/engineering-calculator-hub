"use client";

interface CalcResultProps {
  label?: string;
  value: string;
  detail?: string;
}

export default function CalcResult({
  label = "Result",
  value,
  detail,
}: CalcResultProps) {
  return (
    <div className="mt-4 p-4 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
      <span className="text-sm text-surface-500 dark:text-surface-400">
        {label}:
      </span>
      <div className="font-mono text-xl sm:text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1 whitespace-pre-wrap break-words">
        {value}
      </div>
      {detail && (
        <p className="mt-2 text-sm text-surface-600 dark:text-surface-400">
          {detail}
        </p>
      )}
    </div>
  );
}