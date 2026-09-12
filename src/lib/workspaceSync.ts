import type { WorkspaceDocument } from '@/lib/workspace';

export const WORKSPACE_SYNC_METADATA_PREFIX = 'engcalc.workspace.sync.v1';
export const MAX_WORKSPACE_REVISION = Number.MAX_SAFE_INTEGER - 1;

export interface WorkspaceSyncMetadata {
  revision: number;
  lastSyncedWorkspaceUpdatedAt: string;
  serverUpdatedAt: string | null;
}

function normalizeJson(value: unknown): unknown {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (Array.isArray(value)) return value.map((item) => normalizeJson(item));
  if (typeof value !== 'object') return null;

  const normalized: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort()) {
    const item = (value as Record<string, unknown>)[key];
    if (item !== undefined) normalized[key] = normalizeJson(item);
  }
  return normalized;
}

// PostgreSQL jsonb may return object keys in a different order from the
// browser. Canonical ordering prevents false conflicts after a lost response.
export function canonicalJsonStringify(value: unknown) {
  return JSON.stringify(normalizeJson(value));
}

// The selected project is device-local navigation state. It must not create a
// cloud revision or a cross-device conflict merely because a user browsed.
export function workspaceSyncFingerprint(document: WorkspaceDocument) {
  return canonicalJsonStringify({
    schemaVersion: document.schemaVersion,
    updatedAt: document.updatedAt,
    projects: document.projects,
  });
}

export function workspaceDocumentsMatch(
  first: WorkspaceDocument,
  second: WorkspaceDocument,
) {
  return workspaceSyncFingerprint(first) === workspaceSyncFingerprint(second);
}

export function isPristineWorkspace(document: WorkspaceDocument) {
  if (document.projects.length !== 1) return false;
  const project = document.projects[0];
  return (
    project.name === 'My first design' &&
    project.description === 'Collect related calculations, assumptions, and design decisions here.' &&
    (project.status === undefined || project.status === 'draft') &&
    project.reviewedBy === undefined &&
    project.reviewedAt === undefined &&
    project.workflow === undefined &&
    project.entries.length === 0
  );
}

export function isWorkspaceRevision(value: unknown, allowZero = true): value is number {
  return (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value <= MAX_WORKSPACE_REVISION &&
    value >= (allowZero ? 0 : 1)
  );
}

export function workspaceSyncMetadataKey(userId: string) {
  return `${WORKSPACE_SYNC_METADATA_PREFIX}:${userId}`;
}

export function parseWorkspaceSyncMetadata(value: unknown): WorkspaceSyncMetadata | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (
    !isWorkspaceRevision(candidate.revision) ||
    typeof candidate.lastSyncedWorkspaceUpdatedAt !== 'string' ||
    !Number.isFinite(Date.parse(candidate.lastSyncedWorkspaceUpdatedAt)) ||
    (candidate.serverUpdatedAt !== null &&
      (typeof candidate.serverUpdatedAt !== 'string' ||
        !Number.isFinite(Date.parse(candidate.serverUpdatedAt))))
  ) {
    return null;
  }
  return {
    revision: candidate.revision,
    lastSyncedWorkspaceUpdatedAt: candidate.lastSyncedWorkspaceUpdatedAt,
    serverUpdatedAt: candidate.serverUpdatedAt,
  };
}
