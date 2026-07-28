'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowser } from '@/lib/supabaseClient';
import {
  addProject,
  createReopenUrl,
  createWorkspaceDocument,
  duplicateProject,
  isWorkflowItemComplete,
  isWorkspaceDocument,
  mergeWorkspaceDocumentsWithResult,
  projectToCsv,
  readWorkspace,
  safeFileName,
  workspaceTemplates,
  type ReviewStatus,
  type WorkspaceDocument,
  type WorkspaceProject,
  writeWorkspace,
} from '@/lib/workspace';

type SyncState = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

const reviewLabels: Record<ReviewStatus, string> = {
  draft: 'Draft',
  'ready-for-review': 'Ready for review',
  reviewed: 'Reviewed',
};

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function formattedDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function statusClasses(status: ReviewStatus) {
  if (status === 'reviewed') return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300';
  if (status === 'ready-for-review') return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300';
  return 'border-surface-200 bg-surface-50 text-surface-600 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300';
}

export default function WorkspaceClient() {
  const [workspace, setWorkspace] = useState<WorkspaceDocument | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [projectQuery, setProjectQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setWorkspace(readWorkspace());
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsPro(false);
      return;
    }
    let cancelled = false;
    fetch('/api/me/subscription', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { active?: boolean } | null) => {
        if (!cancelled) setIsPro(data?.active === true);
      })
      .catch(() => {
        if (!cancelled) setIsPro(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  const activeProject = useMemo(
    () => workspace?.projects.find((project) => project.id === workspace.activeProjectId) ?? null,
    [workspace],
  );

  const totalCalculations = useMemo(
    () => workspace?.projects.reduce((sum, project) => sum + project.entries.length, 0) ?? 0,
    [workspace],
  );

  const visibleProjects = useMemo(() => {
    if (!workspace) return [];
    const query = projectQuery.trim().toLowerCase();
    if (!query) return workspace.projects;
    return workspace.projects.filter((project) =>
      `${project.name} ${project.description}`.toLowerCase().includes(query),
    );
  }, [projectQuery, workspace]);

  const commit = (next: WorkspaceDocument) => {
    if (!writeWorkspace(next)) {
      setBackupMessage('This browser could not save the change. Export a backup and free local storage before continuing.');
      return false;
    }
    setWorkspace(next);
    if (syncState === 'saved') setSyncState('idle');
    return true;
  };

  const updateProject = (projectId: string, updater: (project: WorkspaceProject) => WorkspaceProject) => {
    if (!workspace) return;
    const updatedAt = new Date().toISOString();
    commit({
      ...workspace,
      updatedAt,
      projects: workspace.projects.map((project) =>
        project.id === projectId ? { ...updater(project), updatedAt } : project,
      ),
    });
  };

  const createProject = () => {
    if (!workspace) return;
    commit(addProject(workspace));
  };

  const createTemplateProject = (templateId: string) => {
    if (!workspace) return;
    const template = workspaceTemplates.find((item) => item.id === templateId);
    if (!template) return;
    commit(addProject(workspace, undefined, template));
    setShowTemplates(false);
  };

  const deleteProject = (projectId: string) => {
    if (!workspace) return;
    const project = workspace.projects.find((item) => item.id === projectId);
    if (!window.confirm(`Delete “${project?.name || 'this project'}” and all of its saved calculations?`)) {
      return;
    }
    if (workspace.projects.length === 1) {
      commit(createWorkspaceDocument());
      return;
    }
    const projects = workspace.projects.filter((project) => project.id !== projectId);
    const activeProjectId =
      workspace.activeProjectId === projectId ? projects[0].id : workspace.activeProjectId;
    commit({ ...workspace, projects, activeProjectId, updatedAt: new Date().toISOString() });
  };

  const updateProjectStatus = (status: ReviewStatus) => {
    if (!activeProject) return;
    updateProject(activeProject.id, (project) => ({
      ...project,
      status,
      reviewedAt: status === 'reviewed' ? new Date().toISOString() : undefined,
      reviewedBy: status === 'reviewed' ? project.reviewedBy : undefined,
    }));
  };

  const exportBackup = () => {
    if (!workspace) return;
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(`engineering-workspace-backup-${date}.json`, JSON.stringify(workspace, null, 2), 'application/json');
    setBackupMessage('Full local backup downloaded.');
  };

  const importBackup = async (file: File | undefined) => {
    if (!workspace || !file) return;
    setBackupMessage('');
    if (file.size > 2_000_000) {
      setBackupMessage('That backup is larger than the 2 MB import limit.');
      return;
    }
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isWorkspaceDocument(parsed)) throw new Error('This is not a valid EngCalc workspace backup.');
      const outcome = mergeWorkspaceDocumentsWithResult(workspace, parsed);
      if (outcome.importedCount === 0) {
        throw new Error('The workspace already contains the maximum number of projects.');
      }
      if (!commit(outcome.document)) return;
      const importedLabel = `${outcome.importedCount} ${outcome.importedCount === 1 ? 'project' : 'projects'} imported as safe copies with review status reset to draft.`;
      setBackupMessage(
        outcome.skippedCount > 0
          ? `${importedLabel} ${outcome.skippedCount} skipped because this device has reached the 100-project limit.`
          : importedLabel,
      );
    } catch (error) {
      setBackupMessage(error instanceof Error ? error.message : 'The backup could not be imported.');
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  const syncCloud = async (direction: 'push' | 'pull') => {
    if (!workspace || !session || !isPro) return;
    if (
      direction === 'pull' &&
      totalCalculations > 0 &&
      !window.confirm('Load the cloud copy and replace this device’s current workspace? Download a local backup first if you may need these changes.')
    ) {
      return;
    }
    setSyncState(direction === 'push' ? 'saving' : 'loading');
    setSyncMessage('');
    try {
      const response = await fetch('/api/workspace', {
        method: direction === 'push' ? 'PUT' : 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          ...(direction === 'push' ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(direction === 'push' ? { body: JSON.stringify({ document: workspace }) } : {}),
      });
      const data = (await response.json().catch(() => null)) as
        | { document?: unknown; error?: string }
        | null;
      if (!response.ok) throw new Error(data?.error || 'Cloud sync is unavailable.');
      if (direction === 'pull' && data?.document) {
        if (!isWorkspaceDocument(data.document)) throw new Error('The cloud copy is not valid.');
        commit(data.document);
      }
      setSyncState('saved');
      setSyncMessage(direction === 'push' ? 'Cloud copy updated.' : data?.document ? 'Cloud copy loaded.' : 'No cloud copy exists yet.');
    } catch (error) {
      setSyncState('error');
      setSyncMessage(error instanceof Error ? error.message : 'Cloud sync failed.');
    }
  };

  if (!workspace || !activeProject) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-surface-500 sm:px-6 lg:px-8">
        Loading your engineering workspace…
      </div>
    );
  }

  const projectStatus = activeProject.status || 'draft';
  const completedWorkflowItems = activeProject.workflow?.filter((item) => isWorkflowItemComplete(activeProject, item)).length ?? 0;

  return (
    <div className="workspace-print mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="no-print relative overflow-hidden rounded-3xl border border-surface-200 bg-surface-950 px-6 py-8 text-white shadow-2xl shadow-brand-900/10 dark:border-surface-800 sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-30" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">
              Reproducible engineering workspace
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
              Turn calculations into reviewable design evidence.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-surface-300 sm:text-lg">
              Preserve inputs, outputs, worked steps, warnings, assumptions, and review status—not just the final answer.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              ['Projects', workspace.projects.length],
              ['Calculations', totalCalculations],
              ['Cloud', isPro ? 'Ready' : 'Pro'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                <div className="font-mono text-xl font-bold text-white">{value}</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-surface-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="no-print mt-5 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-cyan-50 p-5 dark:border-brand-900/60 dark:from-brand-950/30 dark:to-cyan-950/20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">Guided project packs</p>
            <h2 className="mt-1 font-display text-lg font-bold text-surface-900 dark:text-white">Start from an engineering workflow, not a blank page.</h2>
            <p className="mt-1 text-sm text-surface-600 dark:text-surface-300">Templates connect the right calculators and show progress as evidence is saved.</p>
          </div>
          <button type="button" onClick={() => setShowTemplates((shown) => !shown)} className="shrink-0 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            {showTemplates ? 'Hide templates' : 'Choose a template'}
          </button>
        </div>
        {showTemplates && (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {workspaceTemplates.map((template) => (
              <button key={template.id} type="button" onClick={() => createTemplateProject(template.id)} className="rounded-xl border border-white/80 bg-white/80 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-surface-700 dark:bg-surface-900/80">
                <span className="font-display font-bold text-surface-900 dark:text-white">{template.name}</span>
                <span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">{template.audience}</span>
                <span className="mt-2 block text-sm leading-relaxed text-surface-500 dark:text-surface-400">{template.description}</span>
                <span className="mt-3 block text-xs font-semibold text-surface-400">{template.workflow.length} guided checks</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="no-print h-fit rounded-2xl border border-surface-200 bg-white p-4 shadow-sm dark:border-surface-800 dark:bg-surface-900 lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-3 px-2 pb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-surface-400">Projects</p>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">One evidence pack per design.</p>
            </div>
            <button type="button" onClick={createProject} className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-lg font-semibold text-white transition hover:bg-brand-700" aria-label="Create blank project">+</button>
          </div>
          {workspace.projects.length > 4 && (
            <input type="search" value={projectQuery} onChange={(event) => setProjectQuery(event.target.value)} placeholder="Search projects…" className="mb-3 w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-surface-700 dark:bg-surface-800" />
          )}
          <div className="max-h-[32rem] space-y-1.5 overflow-y-auto">
            {visibleProjects.map((project) => {
              const status = project.status || 'draft';
              return (
                <button key={project.id} type="button" onClick={() => commit({ ...workspace, activeProjectId: project.id })} className={`w-full rounded-xl border px-3 py-3 text-left transition ${project.id === workspace.activeProjectId ? 'border-brand-300 bg-brand-50 text-brand-900 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-100' : 'border-transparent text-surface-600 hover:border-surface-200 hover:bg-surface-50 dark:text-surface-300 dark:hover:border-surface-700 dark:hover:bg-surface-800'}`}>
                  <span className="block truncate text-sm font-semibold">{project.name}</span>
                  <span className="mt-1 flex items-center justify-between gap-2 text-xs text-surface-400">
                    <span>{project.entries.length} {project.entries.length === 1 ? 'calculation' : 'calculations'}</span>
                    <span>{reviewLabels[status]}</span>
                  </span>
                </button>
              );
            })}
            {visibleProjects.length === 0 && <p className="px-2 py-4 text-center text-sm text-surface-400">No matching projects.</p>}
          </div>

          <div className="mt-5 border-t border-surface-200 pt-4 dark:border-surface-800">
            <p className="px-2 text-xs font-bold uppercase tracking-[0.16em] text-surface-400">Local recovery</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={exportBackup} className="rounded-lg border border-surface-300 px-3 py-2 text-xs font-semibold text-surface-700 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800">Backup all</button>
              <button type="button" onClick={() => importInputRef.current?.click()} className="rounded-lg border border-surface-300 px-3 py-2 text-xs font-semibold text-surface-700 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800">Import copy</button>
              <input ref={importInputRef} type="file" accept="application/json,.json" onChange={(event) => void importBackup(event.target.files?.[0])} className="hidden" />
            </div>
            {backupMessage && <p className="mt-2 px-2 text-xs leading-relaxed text-surface-500 dark:text-surface-400" role="status">{backupMessage}</p>}
          </div>

          <div className="mt-5 border-t border-surface-200 pt-4 dark:border-surface-800">
            <p className="px-2 text-xs font-bold uppercase tracking-[0.16em] text-surface-400">Cloud backup</p>
            {!session ? (
              <Link href="/account" className="mt-3 block rounded-lg border border-surface-200 px-3 py-2 text-center text-sm font-semibold text-surface-700 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800">Sign in to sync</Link>
            ) : !isPro ? (
              <Link href="/pricing" className="mt-3 block rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700">Unlock Pro sync</Link>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => syncCloud('push')} disabled={syncState === 'saving'} className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60">{syncState === 'saving' ? 'Saving…' : 'Save cloud'}</button>
                <button type="button" onClick={() => syncCloud('pull')} disabled={syncState === 'loading'} className="rounded-lg border border-surface-300 px-3 py-2 text-xs font-semibold text-surface-700 hover:bg-surface-50 disabled:opacity-60 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800">{syncState === 'loading' ? 'Loading…' : 'Load cloud'}</button>
              </div>
            )}
            {syncMessage && <p className={`mt-2 px-2 text-xs ${syncState === 'error' ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`} role="status">{syncMessage}</p>}
          </div>
        </aside>

        <main className="min-w-0">
          <section className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm dark:border-surface-800 dark:bg-surface-900 sm:p-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <label htmlFor="project-name" className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">Engineering evidence pack</label>
                <input id="project-name" value={activeProject.name} onChange={(event) => updateProject(activeProject.id, (project) => ({ ...project, name: event.target.value.slice(0, 120) }))} className="mt-2 w-full border-0 bg-transparent p-0 font-display text-2xl font-bold text-surface-950 outline-none placeholder:text-surface-300 dark:text-white sm:text-3xl" aria-label="Project name" />
                <textarea value={activeProject.description} onChange={(event) => updateProject(activeProject.id, (project) => ({ ...project, description: event.target.value.slice(0, 1000) }))} className="mt-3 min-h-14 w-full resize-y border-0 bg-transparent p-0 text-sm leading-relaxed text-surface-500 outline-none placeholder:text-surface-300 dark:text-surface-400" aria-label="Project description" placeholder="State the design purpose, constraints, and assumptions." />
              </div>
              <div className="no-print flex max-w-md flex-wrap gap-2">
                <button type="button" onClick={() => commit(duplicateProject(workspace, activeProject.id))} className="rounded-lg border border-surface-300 px-3 py-2 text-sm font-semibold text-surface-700 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800">Duplicate</button>
                <button type="button" onClick={() => downloadFile(`${safeFileName(activeProject.name)}.csv`, projectToCsv(activeProject), 'text/csv;charset=utf-8')} className="rounded-lg border border-surface-300 px-3 py-2 text-sm font-semibold text-surface-700 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800">CSV</button>
                <button type="button" onClick={() => downloadFile(`${safeFileName(activeProject.name)}.json`, JSON.stringify(activeProject, null, 2), 'application/json')} className="rounded-lg border border-surface-300 px-3 py-2 text-sm font-semibold text-surface-700 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800">Project JSON</button>
                <button type="button" onClick={() => window.print()} className="rounded-lg bg-surface-950 px-3 py-2 text-sm font-semibold text-white hover:bg-surface-800 dark:bg-white dark:text-surface-950 dark:hover:bg-surface-100">Print / PDF</button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-surface-200 py-3 text-xs text-surface-400 dark:border-surface-800">
              <span>Created {formattedDate(activeProject.createdAt)}</span>
              <span>Updated {formattedDate(activeProject.updatedAt)}</span>
              <span className="font-mono">Project {activeProject.id.slice(-8)}</span>
              <label className={`no-print ml-auto inline-flex items-center gap-2 rounded-lg border px-2 py-1 ${statusClasses(projectStatus)}`}>
                <span className="font-semibold">Status</span>
                <select value={projectStatus} onChange={(event) => updateProjectStatus(event.target.value as ReviewStatus)} className="bg-transparent font-semibold outline-none">
                  {Object.entries(reviewLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <span className={`hidden rounded-lg border px-2 py-1 font-semibold print:inline-flex ${statusClasses(projectStatus)}`}>{reviewLabels[projectStatus]}</span>
            </div>

            {projectStatus === 'reviewed' && (
              <div className="mt-4 grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20 sm:grid-cols-[1fr_auto] sm:items-end">
                <label className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Reviewed by
                  <input value={activeProject.reviewedBy || ''} onChange={(event) => updateProject(activeProject.id, (project) => ({ ...project, reviewedBy: event.target.value.slice(0, 160) }))} placeholder="Name or initials" className="mt-2 block w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm normal-case tracking-normal text-surface-800 outline-none focus:border-emerald-400 dark:border-emerald-900 dark:bg-surface-900 dark:text-white" />
                </label>
                {activeProject.reviewedAt && <p className="text-xs text-emerald-700 dark:text-emerald-300">Marked reviewed {formattedDate(activeProject.reviewedAt)}</p>}
              </div>
            )}

            {activeProject.workflow && activeProject.workflow.length > 0 && (
              <section className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-900/60 dark:bg-brand-950/20">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">Guided workflow</p>
                    <h2 className="mt-1 font-display text-lg font-bold text-surface-900 dark:text-white">{completedWorkflowItems} of {activeProject.workflow.length} checks captured</h2>
                  </div>
                  <div className="h-2 w-36 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-950" aria-label={`${completedWorkflowItems} of ${activeProject.workflow.length} workflow checks completed`}>
                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${(completedWorkflowItems / activeProject.workflow.length) * 100}%` }} />
                  </div>
                </div>
                <ol className="mt-4 grid gap-2 md:grid-cols-2">
                  {activeProject.workflow.map((item) => {
                    const complete = isWorkflowItemComplete(activeProject, item);
                    return (
                      <li key={item.id} className={`rounded-xl border p-3 ${complete ? 'border-emerald-200 bg-white dark:border-emerald-900/60 dark:bg-surface-900' : 'border-brand-100 bg-white/70 dark:border-brand-900/50 dark:bg-surface-900/60'}`}>
                        <div className="flex items-start gap-3">
                          <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${complete ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'}`}>{complete ? '✓' : '→'}</span>
                          <div>
                            <Link href={`/${item.calculatorSlug}`} className="font-semibold text-surface-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400">{item.title}</Link>
                            {item.optional && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-surface-400">Optional</span>}
                            <p className="mt-1 text-xs leading-relaxed text-surface-500 dark:text-surface-400">{item.purpose}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}

            {activeProject.entries.length === 0 ? (
              <div className="my-10 rounded-2xl border border-dashed border-surface-300 bg-surface-50 px-6 py-12 text-center dark:border-surface-700 dark:bg-surface-950/40">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 font-mono text-lg font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">Σ</div>
                <h2 className="mt-4 font-display text-xl font-bold text-surface-900 dark:text-white">Capture the first design decision</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-surface-500 dark:text-surface-400">
                  Open a calculator, run the design, and save it to this project. Supported professional tools preserve every input, output, worked step, warning, and version for reopening later.
                </p>
                <Link href={activeProject.workflow?.[0] ? `/${activeProject.workflow[0].calculatorSlug}` : '/#calculators'} className="no-print mt-5 inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
                  {activeProject.workflow?.[0] ? `Start: ${activeProject.workflow[0].title}` : 'Browse calculators'}
                </Link>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {activeProject.entries.map((entry, index) => {
                  const hasEvidence = Boolean(entry.inputs?.length || entry.outputs?.length || entry.steps?.length);
                  const entryStatus = entry.reviewStatus || 'draft';
                  return (
                    <article key={entry.id} className="break-inside-avoid rounded-2xl border border-surface-200 bg-surface-50/70 p-5 dark:border-surface-700 dark:bg-surface-950/40">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-surface-400">Calculation {activeProject.entries.length - index}</p>
                          <Link href={hasEvidence ? createReopenUrl(entry) : `/${entry.calculatorSlug}`} className="mt-1 block font-display text-lg font-bold text-surface-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400">{entry.calculatorTitle}</Link>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {hasEvidence && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">Reproducible snapshot</span>}
                            {entry.calculatorVersion && <span className="rounded-full border border-surface-200 px-2 py-0.5 text-[10px] font-semibold text-surface-400 dark:border-surface-700">Version {entry.calculatorVersion}</span>}
                          </div>
                        </div>
                        <div className="no-print flex items-center gap-2">
                          {hasEvidence && <Link href={createReopenUrl(entry)} className="rounded-lg border border-brand-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:border-brand-900 dark:bg-surface-900 dark:text-brand-300">Reopen inputs</Link>}
                          <button type="button" onClick={() => updateProject(activeProject.id, (project) => ({ ...project, entries: project.entries.filter((item) => item.id !== entry.id) }))} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-surface-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30" aria-label={`Remove ${entry.calculatorTitle}`}>Remove</button>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                        <div className="rounded-xl border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-900">
                          <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">Formula</p>
                          <code className="mt-2 block whitespace-pre-wrap font-mono text-sm font-semibold text-brand-700 dark:text-brand-300">{entry.formula}</code>
                        </div>
                        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-900/70 dark:bg-brand-950/30">
                          <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">Result</p>
                          <pre className="mt-2 whitespace-pre-wrap font-mono text-base font-bold text-brand-900 dark:text-brand-100">{entry.result}</pre>
                        </div>
                      </div>

                      {hasEvidence && (
                        <details className="mt-4 rounded-xl border border-surface-200 bg-white dark:border-surface-700 dark:bg-surface-900" open>
                          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-surface-700 dark:text-surface-200">Inputs, outputs and calculation trail</summary>
                          <div className="grid gap-4 border-t border-surface-200 p-4 dark:border-surface-700 md:grid-cols-2">
                            {entry.inputs && entry.inputs.length > 0 && (
                              <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">Captured inputs</h3>
                                <dl className="mt-2 space-y-1.5 text-sm">
                                  {entry.inputs.map((input) => <div key={input.id} className="flex justify-between gap-4"><dt className="text-surface-500 dark:text-surface-400">{input.label}</dt><dd className="font-mono font-semibold text-surface-900 dark:text-white">{input.value}{input.unit ? ` ${input.unit}` : ''}</dd></div>)}
                                </dl>
                              </div>
                            )}
                            {entry.outputs && entry.outputs.length > 0 && (
                              <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">Structured outputs</h3>
                                <dl className="mt-2 space-y-1.5 text-sm">
                                  {entry.outputs.map((output) => <div key={output.label} className="flex justify-between gap-4"><dt className="text-surface-500 dark:text-surface-400">{output.label}</dt><dd className="font-mono font-semibold text-surface-900 dark:text-white">{output.value}{output.unit ? ` ${output.unit}` : ''}</dd></div>)}
                                </dl>
                              </div>
                            )}
                            {entry.steps && entry.steps.length > 0 && (
                              <div className="md:col-span-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">Calculation trail</h3>
                                <ol className="mt-2 space-y-2 text-sm">
                                  {entry.steps.map((step, stepIndex) => <li key={`${step.label}-${stepIndex}`} className="grid gap-1 sm:grid-cols-[10rem_1fr]"><span className="font-semibold text-surface-600 dark:text-surface-300">{step.label}</span><code className="whitespace-pre-wrap text-surface-700 dark:text-surface-300">{step.value}</code></li>)}
                                </ol>
                              </div>
                            )}
                          </div>
                        </details>
                      )}

                      {entry.warning && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"><strong>Design check:</strong> {entry.warning}</div>}

                      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-400" htmlFor={`note-${entry.id}`}>Assumptions and notes</label>
                          <textarea id={`note-${entry.id}`} value={entry.note} onChange={(event) => updateProject(activeProject.id, (project) => ({ ...project, entries: project.entries.map((item) => item.id === entry.id ? { ...item, note: event.target.value.slice(0, 4000) } : item) }))} placeholder="Record component tolerances, operating conditions, source documents, or why this result was selected." className="mt-2 min-h-20 w-full rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 outline-none transition placeholder:text-surface-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-200 dark:focus:ring-brand-900/50" />
                        </div>
                        <label className={`no-print inline-flex items-center gap-2 rounded-lg border px-2 py-2 text-xs ${statusClasses(entryStatus)}`}>
                          <span className="font-semibold">Check</span>
                          <select value={entryStatus} onChange={(event) => {
                            const status = event.target.value as ReviewStatus;
                            updateProject(activeProject.id, (project) => ({ ...project, entries: project.entries.map((item) => item.id === entry.id ? { ...item, reviewStatus: status, reviewedAt: status === 'reviewed' ? new Date().toISOString() : undefined } : item) }));
                          }} className="bg-transparent font-semibold outline-none">
                            {Object.entries(reviewLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                          </select>
                        </label>
                      </div>
                      <p className="mt-2 text-xs text-surface-400">Calculated {formattedDate(entry.createdAt)}</p>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <div className="no-print mt-4 flex justify-end">
            <button type="button" onClick={() => deleteProject(activeProject.id)} className="rounded-lg px-3 py-2 text-sm font-medium text-surface-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30">Delete this project</button>
          </div>
        </main>
      </div>
    </div>
  );
}
