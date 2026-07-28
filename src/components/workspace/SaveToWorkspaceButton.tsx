'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  addProject,
  readWorkspace,
  tryAddCalculation,
  writeWorkspace,
  type CalculatorCapture,
  type WorkspaceProject,
} from '@/lib/workspace';

interface SaveToWorkspaceButtonProps {
  calculatorSlug: string;
  calculatorTitle: string;
  formula: string;
  result: string;
  evidence?: CalculatorCapture;
}

export default function SaveToWorkspaceButton({
  calculatorSlug,
  calculatorTitle,
  formula,
  result,
  evidence,
}: SaveToWorkspaceButtonProps) {
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [savedProject, setSavedProject] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const refresh = () => {
      const workspace = readWorkspace();
      setProjects(workspace.projects);
      setSelectedProjectId((current) => current || workspace.activeProjectId);
    };
    refresh();
    window.addEventListener('engcalc:workspace-updated', refresh);
    return () => window.removeEventListener('engcalc:workspace-updated', refresh);
  }, []);

  const save = () => {
    try {
      let current = readWorkspace();
      let projectId = selectedProjectId || current.activeProjectId;

      if (selectedProjectId === 'new') {
        const beforeCount = current.projects.length;
        current = addProject(current, newProjectName.trim() || `${calculatorTitle} design`);
        if (current.projects.length === beforeCount) {
          throw new Error('The workspace already contains the maximum number of projects.');
        }
        projectId = current.activeProjectId;
      }

      const project = current.projects.find((item) => item.id === projectId);
      if (!project) throw new Error('Choose a valid workspace project.');

      const outcome = tryAddCalculation(current, {
        calculatorSlug,
        calculatorTitle,
        formula,
        result,
        inputs: evidence?.inputs,
        outputs: evidence?.outputs,
        steps: evidence?.steps,
        warning: evidence?.warning,
        mode: evidence?.mode,
        calculatorVersion: evidence?.calculatorVersion,
      }, projectId);
      if (!outcome.ok) {
        throw new Error(
          outcome.reason === 'project-capacity-reached'
            ? 'This project has reached its 1,000-calculation limit. Create a new project before saving.'
            : 'Choose a valid workspace project.',
        );
      }
      if (!writeWorkspace(outcome.document)) {
        throw new Error('This browser could not save the calculation. Export a workspace backup and free local storage.');
      }
      setSavedProject(project.name);
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The calculation could not be saved.');
    }
  };

  if (savedProject) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300" role="status">
          <span aria-hidden="true">✓</span>
          Saved {evidence?.inputs?.length ? 'with reproducible inputs' : ''} to {savedProject}
          <Link href="/workspace" className="font-semibold underline underline-offset-2">Open</Link>
        </div>
        <button type="button" onClick={() => setSavedProject('')} className="rounded-lg px-3 py-2 text-xs font-semibold text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800">Save another copy</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1 text-xs font-semibold uppercase tracking-wider text-surface-400">
          Save calculation to
          <select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-surface-200 bg-white px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-surface-700 outline-none focus:border-brand-400 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-200">
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            <option value="new">+ Create a new project</option>
          </select>
        </label>
        {selectedProjectId === 'new' && (
          <label className="min-w-0 flex-1 text-xs font-semibold uppercase tracking-wider text-surface-400">
            New project name
            <input value={newProjectName} onChange={(event) => setNewProjectName(event.target.value.slice(0, 120))} placeholder={`${calculatorTitle} design`} className="mt-1.5 w-full rounded-lg border border-surface-200 bg-white px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-surface-700 outline-none focus:border-brand-400 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-200" />
          </label>
        )}
        <button type="button" onClick={save} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:border-brand-300 hover:bg-brand-100 dark:border-brand-900/70 dark:bg-brand-950/30 dark:text-brand-300 dark:hover:bg-brand-950/60">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          Save evidence
        </button>
      </div>
      <p className="mt-2 text-xs text-surface-400">
        {evidence?.inputs?.length
          ? 'Inputs, outputs, worked steps, warnings, and formula version will be preserved.'
          : 'This calculator currently saves its result and formula; add assumptions in the workspace.'}
      </p>
      {error && <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400" role="alert">{error}</p>}
    </div>
  );
}
