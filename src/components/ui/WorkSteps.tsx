"use client";

import type { WorkStep } from "@/lib/smartMath";

interface WorkStepsProps {
  title?: string;
  steps: WorkStep[];
}

export default function WorkSteps({ title = "Work shown", steps }: WorkStepsProps) {
  if (steps.length === 0) return null;

  return (
    <div className="mt-4 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-surface-400 mb-3">
        {title}
      </p>
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={`${step.label}-${index}`} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950 text-xs font-bold text-brand-700 dark:text-brand-300">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-surface-700 dark:text-surface-300">
                {step.label}
              </div>
              <div className="mt-1 whitespace-pre-wrap break-words font-mono text-sm text-surface-900 dark:text-white">
                {step.value}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}