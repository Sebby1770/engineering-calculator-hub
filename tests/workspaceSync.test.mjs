import assert from 'node:assert/strict';
import test from 'node:test';
import { createWorkspaceDocument } from '../src/lib/workspace.ts';
import {
  canonicalJsonStringify,
  isPristineWorkspace,
  isWorkspaceRevision,
  parseWorkspaceSyncMetadata,
  workspaceDocumentsMatch,
  workspaceSyncFingerprint,
} from '../src/lib/workspaceSync.ts';

test('canonical JSON comparison ignores object key order', () => {
  assert.equal(
    canonicalJsonStringify({ z: 1, nested: { b: true, a: 'first' } }),
    canonicalJsonStringify({ nested: { a: 'first', b: true }, z: 1 }),
  );
});

test('workspace sync ignores device-local navigation but detects content changes', () => {
  const first = createWorkspaceDocument();
  const second = structuredClone(first);
  second.activeProjectId = 'another-device-selection';

  assert.equal(workspaceDocumentsMatch(first, second), true);
  second.projects[0].name = 'Changed design';
  assert.equal(workspaceDocumentsMatch(first, second), false);
  assert.notEqual(workspaceSyncFingerprint(first), workspaceSyncFingerprint(second));
});

test('pristine workspaces are distinguished from meaningful empty projects', () => {
  const pristine = createWorkspaceDocument();
  assert.equal(isPristineWorkspace(pristine), true);

  const renamed = structuredClone(pristine);
  renamed.projects[0].name = 'Motor sizing study';
  assert.equal(isPristineWorkspace(renamed), false);
});

test('workspace revisions reject unsafe and non-integral values', () => {
  assert.equal(isWorkspaceRevision(0), true);
  assert.equal(isWorkspaceRevision(1, false), true);
  assert.equal(isWorkspaceRevision(-1), false);
  assert.equal(isWorkspaceRevision(1.5), false);
  assert.equal(isWorkspaceRevision('1'), false);
  assert.equal(isWorkspaceRevision(Number.MAX_SAFE_INTEGER), false);
});

test('sync metadata parser fails closed', () => {
  assert.deepEqual(
    parseWorkspaceSyncMetadata({
      revision: 4,
      lastSyncedWorkspaceUpdatedAt: '2026-08-09T23:00:00.000Z',
      serverUpdatedAt: '2026-08-10T00:00:00.000Z',
    }),
    {
      revision: 4,
      lastSyncedWorkspaceUpdatedAt: '2026-08-09T23:00:00.000Z',
      serverUpdatedAt: '2026-08-10T00:00:00.000Z',
    },
  );
  assert.equal(parseWorkspaceSyncMetadata({ revision: '4' }), null);
  assert.equal(parseWorkspaceSyncMetadata({ revision: 4, lastSyncedWorkspaceUpdatedAt: '', serverUpdatedAt: 'never' }), null);
});
