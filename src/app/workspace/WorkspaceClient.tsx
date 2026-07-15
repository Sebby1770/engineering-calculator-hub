'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowser } from '@/lib/supabaseClient';
import {
  addProject,
  createWorkspaceDocument,
  isWorkspaceDocument,
  projectToCsv,
  readWorkspace,
  safeFileName,
  type WorkspaceDocument,
  type WorkspaceProject,
  writeWorkspace,
} from '@/lib/workspace';

type SyncState = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

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

export default function WorkspaceClient() {
  const [workspace, setWorkspace] = useState<WorkspaceDocument | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [syncMessage, setSyncMessage] = useState('');

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

  const commit = (next: WorkspaceDocument) => {
    setWorkspace(next);
    writeWorkspace(next);
    if (syncState === 'saved') setSyncState('idle');
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

  const syncCloud = async (direction: 'push' | 'pull') => {
    if (!workspace || !session || !isPro) return;
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
      setSyncMessage(direction === 'push' ? 'Cloud copy updated.' : 'Cloud copy loaded.');
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

  return (
    <div className="workspace-print mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="no-print relative overflow-hidden rounded-3xl border border-surface-200 bg-surface-950 px-6 py-8 text-white shadow-2xl shadow-brand-900/10 dark:border-surface-800 sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-30" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">
              Local-first engineering notebook
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
              Your calculations, organised into design decisions.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-surface-300 sm:text-lg">
              Save results from any calculator, record assumptions, and export a clean calculation sheet for review.
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

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="no-print h-fit rounded-2xl border border-surface-200 bg-white p-4 shadow-sm dark:border-surface-800 dark:bg-surface-900 lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-3 px-2 pb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-surface-400">Projects</p>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">One worksheet per design.</p>
            </div>
            <button
              type="button"
              onClick={createProject}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-lg font-semibold text-white transition hover:bg-brand-700"
              aria-label="Create project"
            >
              +
            </button>
          </div>
          <div className="space-y-1.5">
            {workspace.projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => commit({ ...workspace, activeProjectId: project.id })}
                className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                  project.id === workspace.activeProjectId
                    ? 'border-brand-300 bg-brand-50 text-brand-900 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-100'
                    : 'border-transparent text-surface-600 hover:border-surface-200 hover:bg-surface-50 dark:text-surface-300 dark:hover:border-surface-700 dark:hover:bg-surface-800'
                }`}
              >
                <span className="block truncate text-sm font-semibold">{project.name}</span>
                <span className="mt-1 block text-xs text-surface-400">
                  {project.entries.length} {project.entries.length === 1 ? 'calculation' : 'calculations'}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 border-t border-surface-200 pt-4 dark:border-surface-800">
            <p className="px-2 text-xs font-bold uppercase tracking-[0.16em] text-surface-400">Cloud backup</p>
            {!session ? (
              <Link href="/account" className="mt-3 block rounded-lg border border-surface-200 px-3 py-2 text-center text-sm font-semibold text-surface-700 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800">
                Sign in to sync
              </Link>
            ) : !isPro ? (
              <Link href="/pricing" className="mt-3 block rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700">
                Unlock Pro sync
              </Link>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => syncCloud('push')} disabled={syncState === 'saving'} className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                  {syncState === 'saving' ? 'Saving…' : 'Save cloud'}
                </button>
                <button type="button" onClick={() => syncCloud('pull')} disabled={syncState === 'loading'} className="rounded-lg border border-surface-300 px-3 py-2 text-xs font-semibold text-surface-700 hover:bg-surface-50 disabled:opacity-60 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800">
                  {syncState === 'loading' ? 'Loading…' : 'Load cloud'}
                </button>
              </div>
            )}
            {syncMessage && (
              <p className={`mt-2 px-2 text-xs ${syncState === 'error' ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`} role="status">
                {syncMessage}
              </p>
            )}
          </div>
        </aside>

        <main className="min-w-0">
          <section className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm dark:border-surface-800 dark:bg-surface-900 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <label htmlFor="project-name" className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-400">
                  Calculation sheet
                </label>
                <input
                  id="project-name"
                  value={activeProject.name}
                  onChange={(event) => updateProject(activeProject.id, (project) => ({ ...project, name: event.target.value.slice(0, 120) }))}
                  className="mt-2 w-full border-0 bg-transparent p-0 font-display text-2xl font-bold text-surface-950 outline-none placeholder:text-surface-300 dark:text-white sm:text-3xl"
                  aria-label="Project name"
                />
                <textarea
                  value={activeProject.description}
                  onChange={(event) => updateProject(activeProject.id, (project) => ({ ...project, description: event.target.value.slice(0, 1000) }))}
                  className="mt-3 min-h-14 w-full resize-y border-0 bg-transparent p-0 text-sm leading-relaxed text-surface-500 outline-none placeholder:text-surface-300 dark:text-surface-400"
                  aria-label="Project description"
                  placeholder="State the design purpose, constraints, and assumptions."
                />
              </div>
              <div className="no-print flex flex-wrap gap-2">
                <button type="button" onClick={() => downloadFile(`${safeFileName(activeProject.name)}.csv`, projectToCsv(activeProject), 'text/csv;charset=utf-8')} className="rounded-lg border border-surface-300 px-3 py-2 text-sm font-semibold text-surface-700 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800">
                  Export CSV
                </button>
                <button type="button" onClick={() => downloadFile(`${safeFileName(activeProject.name)}.json`, JSON.stringify(activeProject, null, 2), 'application/json')} className="rounded-lg border border-surface-300 px-3 py-2 text-sm font-semibold text-surface-700 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800">
                  Export JSON
                </button>
                <button type="button" onClick={() => window.print()} className="rounded-lg bg-surface-950 px-3 py-2 text-sm font-semibold text-white hover:bg-surface-800 dark:bg-white dark:text-surface-950 dark:hover:bg-surface-100">
                  Print / PDF
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-surface-200 py-3 text-xs text-surface-400 dark:border-surface-800">
              <span>Created {formattedDate(activeProject.createdAt)}</span>
              <span>Updated {formattedDate(activeProject.updatedAt)}</span>
              <span className="font-mono">Project {activeProject.id.slice(-8)}</span>
            </div>

            {activeProject.entries.length === 0 ? (
              <div className="my-10 rounded-2xl border border-dashed border-surface-300 bg-surface-50 px-6 py-12 text-center dark:border-surface-700 dark:bg-surface-950/40">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 font-mono text-lg font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">Σ</div>
                <h2 className="mt-4 font-display text-xl font-bold text-surface-900 dark:text-white">Start a calculation sheet</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-surface-500 dark:text-surface-400">
                  Open any calculator, calculate a result, then choose “Save to workspace.” It will appear here with its formula and timestamp.
                </p>
                <Link href="/#calculators" className="no-print mt-5 inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
                  Browse calculators
                </Link>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {activeProject.entries.map((entry, index) => (
                  <article key={entry.id} className="break-inside-avoid rounded-2xl border border-surface-200 bg-surface-50/70 p-5 dark:border-surface-700 dark:bg-surface-950/40">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-surface-400">Calculation {activeProject.entries.length - index}</p>
                        <Link href={`/${entry.calculatorSlug}`} className="mt-1 block font-display text-lg font-bold text-surface-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400">
                          {entry.calculatorTitle}
                        </Link>
                      </div>
                      <button type="button" onClick={() => updateProject(activeProject.id, (project) => ({ ...project, entries: project.entries.filter((item) => item.id !== entry.id) }))} className="no-print rounded-lg px-2 py-1 text-xs font-semibold text-surface-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30" aria-label={`Remove ${entry.calculatorTitle}`}>
                        Remove
                      </button>
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
                    <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-surface-400" htmlFor={`note-${entry.id}`}>
                      Assumptions and notes
                    </label>
                    <textarea
                      id={`note-${entry.id}`}
                      value={entry.note}
                      onChange={(event) => updateProject(activeProject.id, (project) => ({
                        ...project,
                        entries: project.entries.map((item) => item.id === entry.id ? { ...item, note: event.target.value.slice(0, 4000) } : item),
                      }))}
                      placeholder="Record component tolerances, operating conditions, or why this result was selected."
                      className="mt-2 min-h-20 w-full rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 outline-none transition placeholder:text-surface-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-200 dark:focus:ring-brand-900/50"
                    />
                    <p className="mt-2 text-xs text-surface-400">Calculated {formattedDate(entry.createdAt)}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="no-print mt-4 flex justify-end">
            <button type="button" onClick={() => deleteProject(activeProject.id)} className="rounded-lg px-3 py-2 text-sm font-medium text-surface-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30">
              Delete this project
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
