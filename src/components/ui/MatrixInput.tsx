"use client";

interface MatrixInputProps {
  label: string;
  rows: number;
  cols: number;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function MatrixInput({
  label,
  rows,
  cols,
  value,
  onChange,
  placeholder,
}: MatrixInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        spellCheck={false}
        placeholder={
          placeholder ?? `Enter ${rows}×${cols} values separated by commas or spaces`
        }
        className="w-full rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-4 py-3 font-mono text-sm text-surface-900 dark:text-white outline-none transition-all resize-y focus:border-brand-400 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
      />
    </div>
  );
}