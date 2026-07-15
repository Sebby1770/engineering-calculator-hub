'use client';

import Link from 'next/link';
import { useState } from 'react';
import { addCalculation, readWorkspace, writeWorkspace } from '@/lib/workspace';

interface SaveToWorkspaceButtonProps {
  calculatorSlug: string;
  calculatorTitle: string;
  formula: string;
  result: string;
}

export default function SaveToWorkspaceButton({
  calculatorSlug,
  calculatorTitle,
  formula,
  result,
}: SaveToWorkspaceButtonProps) {
  const [savedProject, setSavedProject] = useState('');

  const save = () => {
    const current = readWorkspace();
    const project = current.projects.find((item) => item.id === current.activeProjectId);
    const next = addCalculation(current, { calculatorSlug, calculatorTitle, formula, result });
    writeWorkspace(next);
    setSavedProject(project?.name || 'workspace');
  };

  if (savedProject) {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300" role="status">
        <span aria-hidden="true">✓</span>
        Saved to {savedProject}
        <Link href="/workspace" className="font-semibold underline underline-offset-2">
          Open
        </Link>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={save}
      className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 transition hover:border-brand-300 hover:bg-brand-100 dark:border-brand-900/70 dark:bg-brand-950/30 dark:text-brand-300 dark:hover:bg-brand-950/60"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
      Save to workspace
    </button>
  );
}
