'use client';

import { InputHTMLAttributes } from 'react';

interface CalcInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  unit?: string;
  value: string;
  onChange: (value: string) => void;
  highlight?: boolean;
}

export default function CalcInput({
  label,
  unit,
  value,
  onChange,
  highlight = false,
  ...rest
}: CalcInputProps) {
  return (
    <div className="group">
      <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-lg border px-4 py-3 font-mono text-base transition-all outline-none
            ${
              highlight
                ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300 ring-2 ring-brand-200 dark:ring-brand-800'
                : 'border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-white focus:border-brand-400 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800'
            }`}
          {...rest}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-surface-400 dark:text-surface-500 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
