'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  isWorkspaceDocument,
  mergeWorkspaceDocumentsWithResult,
  type WorkspaceDocument,
} from '@/lib/workspace';
import {
  isPristineWorkspace,
  isWorkspaceRevision,
  parseWorkspaceSyncMetadata,
  workspaceDocumentsMatch,
  workspaceSyncMetadataKey,
  type WorkspaceSyncMetadata,
} from '@/lib/workspaceSync';

type SyncState = 'idle' | 'checking' | 'saving' | 'saved' | 'conflict' | 'error';

interface CloudSnapshot {
  document: WorkspaceDocument | null;
  revision: number;
  updatedAt: string | null;
}

interface WorkspaceVersion {
  revision: number;
  savedAt: string;
  archivedAt: string;
}

interface WorkspaceCloudSyncProps {
  workspace: WorkspaceDocument;
  session: Session | null;
  isPro: boolean;
  onReplace: (document: WorkspaceDocument) => boolean;
}

const AUTOSAVE_DELAY_MS = 5_000;

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function parseCloudSnapshot(value: unknown): CloudSnapshot | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (!isWorkspaceRevision(candidate.revision)) return null;
  if (candidate.document === null && candidate.revision === 0 && candidate.updatedAt === null) {
    return { document: null, revision: 0, updatedAt: null };
  }
  if (
    candidate.revision > 0 &&
    isWorkspaceDocument(candidate.document) &&
    isIsoDate(candidate.updatedAt)
  ) {
    return {
      document: candidate.document,
      revision: candidate.revision,
      updatedAt: candidate.updatedAt,
    };
  }
  return null;
}

function readMetadata(userId: string) {
  try {
    const raw = window.localStorage.getItem(workspaceSyncMetadataKey(userId));
    return raw ? parseWorkspaceSyncMetadata(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function writeMetadata(userId: string, metadata: WorkspaceSyncMetadata) {
  try {
    window.localStorage.setItem(workspaceSyncMetadataKey(userId), JSON.stringify(metadata));
  } catch {
    // Cloud sync remains safe without this convenience cursor. The next visit
    // performs a conservative comparison before enabling autosave.
  }
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function WorkspaceCloudSync({
  workspace,
  session,
  isPro,
  onReplace,
}: WorkspaceCloudSyncProps) {
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [cloudRevision, setCloudRevision] = useState<number | null>(null);
  const [serverUpdatedAt, setServerUpdatedAt] = useState<string | null>(null);
  const [conflict, setConflict] = useState<CloudSnapshot | null>(null);
  const [needsLink, setNeedsLink] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<WorkspaceVersion[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [lastSyncedWorkspaceUpdatedAt, setLastSyncedWorkspaceUpdatedAt] = useState<string | null>(null);
  const workspaceRef = useRef(workspace);
  const replaceRef = useRef(onReplace);
  const activeUserRef = useRef<string | null>(session?.user.id ?? null);
  const initializedUserRef = useRef<string | null>(null);
  const saveInFlightRef = useRef(false);

  useEffect(() => {
    workspaceRef.current = workspace;
  }, [workspace]);

  useEffect(() => {
    replaceRef.current = onReplace;
  }, [onReplace]);

  useEffect(() => {
    activeUserRef.current = session?.user.id ?? null;
  }, [session?.user.id]);

  const isDirty =
    cloudRevision !== null &&
    workspace.updatedAt !== lastSyncedWorkspaceUpdatedAt;

  const acknowledge = useCallback(
    (
      userId: string,
      document: WorkspaceDocument,
      revision: number,
      updatedAt: string | null,
    ) => {
      setLastSyncedWorkspaceUpdatedAt(document.updatedAt);
      setCloudRevision(revision);
      setServerUpdatedAt(updatedAt);
      setConflict(null);
      setNeedsLink(false);
      writeMetadata(userId, {
        revision,
        lastSyncedWorkspaceUpdatedAt: document.updatedAt,
        serverUpdatedAt: updatedAt,
      });
    },
    [],
  );

  useEffect(() => {
    const userId = session?.user.id ?? null;
    const accessToken = session?.access_token ?? null;
    if (!userId || !accessToken || !isPro) {
      initializedUserRef.current = null;
      setLastSyncedWorkspaceUpdatedAt(null);
      setCloudRevision(null);
      setServerUpdatedAt(null);
      setConflict(null);
      setNeedsLink(false);
      setShowHistory(false);
      setHistory([]);
      setSyncState('idle');
      setSyncMessage('');
      return;
    }
    if (initializedUserRef.current === userId) return;
    initializedUserRef.current = userId;

    let cancelled = false;
    setSyncState('checking');
    setSyncMessage('Checking this account’s cloud copy…');

    void (async () => {
      try {
        const response = await fetch('/api/workspace', {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: 'no-store',
        });
        const data: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const error =
            typeof data === 'object' && data !== null && 'error' in data
              ? String((data as { error: unknown }).error)
              : 'Cloud sync is unavailable.';
          throw new Error(error);
        }
        const remote = parseCloudSnapshot(data);
        if (!remote) throw new Error('The cloud returned an invalid workspace response.');
        if (cancelled || activeUserRef.current !== userId) return;

        const local = workspaceRef.current;
        const metadata = readMetadata(userId);
        if (!remote.document) {
          setCloudRevision(0);
          setServerUpdatedAt(null);
          setLastSyncedWorkspaceUpdatedAt(null);
          if (isPristineWorkspace(local)) {
            setSyncState('idle');
            setSyncMessage('Cloud sync is ready. This workspace will autosave.');
          } else {
            setNeedsLink(true);
            setSyncState('idle');
            setSyncMessage('This account has no cloud copy. Confirm before uploading this device.');
          }
          return;
        }

        if (workspaceDocumentsMatch(local, remote.document)) {
          acknowledge(userId, remote.document, remote.revision, remote.updatedAt);
          setSyncState('saved');
          setSyncMessage('Cloud is up to date.');
          return;
        }

        if (isPristineWorkspace(local)) {
          if (!replaceRef.current(remote.document)) {
            throw new Error('The cloud copy could not be written to local storage.');
          }
          acknowledge(userId, remote.document, remote.revision, remote.updatedAt);
          setSyncState('saved');
          setSyncMessage('Cloud workspace loaded on this device.');
          return;
        }

        const localUnchanged =
          metadata?.lastSyncedWorkspaceUpdatedAt === local.updatedAt;
        const remoteUnchanged =
          metadata?.revision === remote.revision &&
          metadata.serverUpdatedAt === remote.updatedAt;

        if (metadata && localUnchanged && remote.revision >= metadata.revision) {
          if (!replaceRef.current(remote.document)) {
            throw new Error('The cloud copy could not be written to local storage.');
          }
          acknowledge(userId, remote.document, remote.revision, remote.updatedAt);
          setSyncState('saved');
          setSyncMessage('Newer cloud changes loaded on this device.');
          return;
        }

        if (metadata && remoteUnchanged && !localUnchanged) {
          setLastSyncedWorkspaceUpdatedAt(remote.document.updatedAt);
          setCloudRevision(remote.revision);
          setServerUpdatedAt(remote.updatedAt);
          setSyncState('idle');
          setSyncMessage('Offline changes found. Autosave will update the cloud copy.');
          return;
        }

        setCloudRevision(remote.revision);
        setServerUpdatedAt(remote.updatedAt);
        setConflict(remote);
        setSyncState('conflict');
        setSyncMessage('This device and the cloud both have changes. Nothing was overwritten.');
      } catch (error) {
        if (cancelled || activeUserRef.current !== userId) return;
        setCloudRevision(null);
        setSyncState('error');
        setSyncMessage(error instanceof Error ? error.message : 'Cloud sync failed.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [acknowledge, isPro, session?.access_token, session?.user.id]);

  const saveDocument = useCallback(
    async (document: WorkspaceDocument, expectedRevision: number) => {
      const userId = session?.user.id;
      const accessToken = session?.access_token;
      if (!userId || !accessToken || !isPro || saveInFlightRef.current) return false;

      saveInFlightRef.current = true;
      setSyncState('saving');
      setSyncMessage('Saving securely to the cloud…');
      try {
        const response = await fetch('/api/workspace', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ document, expectedRevision }),
        });
        const data: unknown = await response.json().catch(() => null);
        if (activeUserRef.current !== userId) return false;

        if (response.status === 409) {
          const remote = parseCloudSnapshot(data);
          if (!remote) throw new Error('The cloud changed, but its latest copy could not be loaded.');
          if (remote.document && workspaceDocumentsMatch(remote.document, document)) {
            acknowledge(userId, document, remote.revision, remote.updatedAt);
            setSyncState('saved');
            setSyncMessage('Cloud save confirmed after reconnecting.');
            return true;
          }
          setCloudRevision(remote.revision);
          setServerUpdatedAt(remote.updatedAt);
          setConflict(remote);
          setSyncState('conflict');
          setSyncMessage('Another device saved first. Your local changes are still safe.');
          return false;
        }

        if (!response.ok) {
          const message =
            typeof data === 'object' && data !== null && 'error' in data
              ? String((data as { error: unknown }).error)
              : 'Cloud save failed. Your local copy is safe.';
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            throw new Error(
              retryAfter
                ? `${message} Try again in ${retryAfter} seconds.`
                : message,
            );
          }
          throw new Error(message);
        }

        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
          throw new Error('The cloud returned an invalid save response.');
        }
        const saved = data as Record<string, unknown>;
        if (!isWorkspaceRevision(saved.revision, false) || !isIsoDate(saved.updatedAt)) {
          throw new Error('The cloud returned an invalid save revision.');
        }
        acknowledge(userId, document, saved.revision, saved.updatedAt);
        setSyncState('saved');
        setSyncMessage('Cloud saved automatically.');
        return true;
      } catch (error) {
        if (activeUserRef.current === userId) {
          setSyncState('error');
          setSyncMessage(
            error instanceof Error ? error.message : 'Cloud save failed. Your local copy is safe.',
          );
        }
        return false;
      } finally {
        saveInFlightRef.current = false;
      }
    },
    [acknowledge, isPro, session?.access_token, session?.user.id],
  );

  useEffect(() => {
    if (
      !session?.user.id ||
      !isPro ||
      cloudRevision === null ||
      needsLink ||
      conflict ||
      !isDirty ||
      syncState === 'checking' ||
      syncState === 'saving' ||
      syncState === 'error'
    ) {
      return;
    }
    const document = workspace;
    const revision = cloudRevision;
    const timer = window.setTimeout(() => {
      void saveDocument(document, revision);
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [cloudRevision, conflict, isDirty, isPro, needsLink, saveDocument, session?.user.id, syncState, workspace]);

  const useCloudCopy = () => {
    if (!conflict?.document || !session) return;
    if (
      !window.confirm(
        'Replace this device’s workspace with the cloud copy? Download a local backup first if you may need these changes.',
      )
    ) {
      return;
    }
    if (!onReplace(conflict.document)) {
      setSyncState('error');
      setSyncMessage('The cloud copy could not be written to local storage.');
      return;
    }
    acknowledge(session.user.id, conflict.document, conflict.revision, conflict.updatedAt);
    setSyncState('saved');
    setSyncMessage('Cloud copy loaded.');
  };

  const keepBoth = async () => {
    if (!conflict?.document) return;
    const outcome = mergeWorkspaceDocumentsWithResult(conflict.document, workspace);
    if (outcome.skippedCount > 0 || outcome.importedCount === 0) {
      setSyncState('error');
      setSyncMessage('There is not enough project capacity to keep both copies. Export a local backup first.');
      return;
    }
    if (!onReplace(outcome.document)) {
      setSyncState('error');
      setSyncMessage('The merged workspace could not be written to local storage.');
      return;
    }
    await saveDocument(outcome.document, conflict.revision);
  };

  const keepThisDevice = async () => {
    if (!conflict) return;
    if (
      !window.confirm(
        'Replace the latest cloud copy with this device? The replaced cloud copy will remain in recent version history.',
      )
    ) {
      return;
    }
    await saveDocument(workspace, conflict.revision);
  };

  const enableSync = async () => {
    setNeedsLink(false);
    setCloudRevision(0);
    setLastSyncedWorkspaceUpdatedAt(null);
    await saveDocument(workspace, 0);
  };

  const loadHistory = useCallback(async () => {
    const userId = session?.user.id;
    const accessToken = session?.access_token;
    if (!userId || !accessToken || !isPro) return;
    setHistoryLoading(true);
    try {
      const response = await fetch('/api/workspace?versions=1', {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          typeof data === 'object' && data !== null && 'error' in data
            ? String((data as { error: unknown }).error)
            : 'Version history is unavailable.';
        throw new Error(message);
      }
      if (activeUserRef.current !== userId) return;
      const candidate = data as { versions?: unknown } | null;
      if (!candidate || !Array.isArray(candidate.versions)) {
        throw new Error('The cloud returned invalid version history.');
      }
      const versions = candidate.versions.filter((value): value is WorkspaceVersion => {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
        const row = value as Record<string, unknown>;
        return (
          isWorkspaceRevision(row.revision, false) &&
          isIsoDate(row.savedAt) &&
          isIsoDate(row.archivedAt)
        );
      });
      setHistory(versions.slice(0, 20));
    } catch (error) {
      if (activeUserRef.current === userId) {
        setSyncState('error');
        setSyncMessage(error instanceof Error ? error.message : 'Version history failed to load.');
      }
    } finally {
      if (activeUserRef.current === userId) setHistoryLoading(false);
    }
  }, [isPro, session?.access_token, session?.user.id]);

  const toggleHistory = () => {
    const next = !showHistory;
    setShowHistory(next);
    if (next) void loadHistory();
  };

  const restoreVersion = async (version: WorkspaceVersion) => {
    const userId = session?.user.id;
    const accessToken = session?.access_token;
    if (!userId || !accessToken || cloudRevision === null || isDirty || conflict) return;
    if (
      !window.confirm(
        `Restore cloud version ${version.revision}? It becomes a new revision, and its previous review statuses will also be restored.`,
      )
    ) {
      return;
    }

    saveInFlightRef.current = true;
    setSyncState('saving');
    setSyncMessage(`Restoring version ${version.revision}…`);
    try {
      const response = await fetch('/api/workspace', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restoreRevision: version.revision,
          expectedRevision: cloudRevision,
        }),
      });
      const data: unknown = await response.json().catch(() => null);
      if (activeUserRef.current !== userId) return;
      if (response.status === 409) {
        const remote = parseCloudSnapshot(data);
        if (!remote) throw new Error('The cloud changed before the restore could finish.');
        setCloudRevision(remote.revision);
        setServerUpdatedAt(remote.updatedAt);
        setConflict(remote);
        setSyncState('conflict');
        setSyncMessage('Another device saved first. Resolve that change before restoring.');
        return;
      }
      if (!response.ok) {
        const message =
          typeof data === 'object' && data !== null && 'error' in data
            ? String((data as { error: unknown }).error)
            : 'That version could not be restored.';
        throw new Error(message);
      }
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        throw new Error('The cloud returned an invalid restore response.');
      }
      const restored = data as Record<string, unknown>;
      if (
        !isWorkspaceDocument(restored.document) ||
        !isWorkspaceRevision(restored.revision, false) ||
        !isIsoDate(restored.updatedAt)
      ) {
        throw new Error('The restored workspace is invalid.');
      }
      if (!onReplace(restored.document)) {
        throw new Error('The restored cloud copy could not be saved on this device.');
      }
      acknowledge(userId, restored.document, restored.revision, restored.updatedAt);
      setSyncState('saved');
      setSyncMessage(`Version ${version.revision} restored as revision ${restored.revision}.`);
      await loadHistory();
    } catch (error) {
      if (activeUserRef.current === userId) {
        setSyncState('error');
        setSyncMessage(error instanceof Error ? error.message : 'Version restore failed.');
      }
    } finally {
      saveInFlightRef.current = false;
    }
  };

  const messageClass =
    syncState === 'error'
      ? 'text-red-600 dark:text-red-400'
      : syncState === 'conflict'
        ? 'text-amber-700 dark:text-amber-300'
        : 'text-surface-500 dark:text-surface-400';
  const statusMessage =
    isDirty && syncState !== 'saving' && !conflict && !needsLink
      ? 'Saved locally. Cloud autosave is pending.'
      : syncMessage;

  return (
    <div className="mt-5 border-t border-surface-200 pt-4 dark:border-surface-800">
      <p className="px-2 text-xs font-bold uppercase tracking-[0.16em] text-surface-400">Cloud sync</p>
      {!session ? (
        <Link href="/account" className="mt-3 block rounded-lg border border-surface-200 px-3 py-2 text-center text-sm font-semibold text-surface-700 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800">Sign in to sync</Link>
      ) : !isPro ? (
        <Link href="/pricing" className="mt-3 block rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700">Unlock Pro sync</Link>
      ) : (
        <div className="mt-3 space-y-3">
          {needsLink ? (
            <button type="button" onClick={() => void enableSync()} className="w-full rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">
              Sync this device
            </button>
          ) : conflict ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/70 dark:bg-amber-950/30">
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">Choose how to resolve this safely:</p>
              <div className="mt-2 grid gap-2">
                {conflict.document && (
                  <button type="button" onClick={useCloudCopy} className="rounded-lg border border-amber-300 bg-white px-2.5 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-surface-900 dark:text-amber-200">Use cloud copy</button>
                )}
                {conflict.document && (
                  <button type="button" onClick={() => void keepBoth()} className="rounded-lg border border-amber-300 bg-white px-2.5 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-surface-900 dark:text-amber-200">Keep both as draft copies</button>
                )}
                <button type="button" onClick={() => void keepThisDevice()} className="rounded-lg bg-amber-700 px-2.5 py-2 text-xs font-semibold text-white hover:bg-amber-800">Keep this device</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => cloudRevision !== null && void saveDocument(workspace, cloudRevision)}
                disabled={cloudRevision === null || syncState === 'saving' || !isDirty}
                className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {syncState === 'saving' ? 'Saving…' : isDirty ? 'Save now' : 'Cloud saved'}
              </button>
              <button type="button" onClick={toggleHistory} aria-expanded={showHistory} disabled={cloudRevision === null || cloudRevision === 0} className="rounded-lg border border-surface-300 px-3 py-2 text-xs font-semibold text-surface-700 hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-700 dark:text-surface-200 dark:hover:bg-surface-800">
                {showHistory ? 'Hide versions' : 'Recent versions'}
              </button>
            </div>
          )}

          {statusMessage && <p className={`px-2 text-xs leading-relaxed ${messageClass}`} role="status">{statusMessage}</p>}
          {serverUpdatedAt && !isDirty && !conflict && (
            <p className="px-2 text-[11px] text-surface-400">Revision {cloudRevision} · {displayDate(serverUpdatedAt)}</p>
          )}

          {showHistory && !conflict && (
            <div className="rounded-xl border border-surface-200 bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-800/70">
              <p className="text-xs font-semibold text-surface-700 dark:text-surface-200">Recovery points</p>
              <p className="mt-1 text-[11px] leading-relaxed text-surface-400">Up to 50 superseded copies are retained for 30 days.</p>
              {historyLoading ? (
                <p className="mt-3 text-xs text-surface-400">Loading versions…</p>
              ) : history.length === 0 ? (
                <p className="mt-3 text-xs text-surface-400">No earlier cloud versions yet.</p>
              ) : (
                <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto">
                  {history.map((version) => (
                    <li key={version.revision} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-2 dark:bg-surface-900">
                      <span className="min-w-0 text-[11px] text-surface-500 dark:text-surface-400">
                        <span className="block font-semibold text-surface-700 dark:text-surface-200">Revision {version.revision}</span>
                        {displayDate(version.savedAt)}
                      </span>
                      <button type="button" onClick={() => void restoreVersion(version)} disabled={isDirty || syncState === 'saving'} className="shrink-0 rounded-md border border-surface-300 px-2 py-1 text-[11px] font-semibold text-surface-700 hover:bg-surface-100 disabled:opacity-40 dark:border-surface-600 dark:text-surface-200 dark:hover:bg-surface-800">Restore</button>
                    </li>
                  ))}
                </ul>
              )}
              {isDirty && <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">Save current changes before restoring a version.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
