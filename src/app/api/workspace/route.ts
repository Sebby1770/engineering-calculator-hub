import { NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '@/lib/rateLimit';
import { isAllowedOrigin } from '@/lib/requestGuards';
import { readTextWithLimit } from '@/lib/requestBody';
import { getUserFromRequest } from '@/lib/supabaseAuth';
import {
  insertRowReturning,
  isSupabaseConfigured,
  patchRowsReturning,
  selectRows,
} from '@/lib/supabaseAdmin';
import { isWorkspaceDocument, type WorkspaceDocument } from '@/lib/workspace';
import {
  isWorkspaceRevision,
  workspaceDocumentsMatch,
} from '@/lib/workspaceSync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 512_000;
const ACTIVE_STATUSES = new Set(['active', 'trialing']);
const HISTORY_WINDOW_MS = 30 * 24 * 60 * 60 * 1_000;

interface ProfileRow {
  subscription_status: string | null;
  price_id: string | null;
}

interface WorkspaceRow {
  document: WorkspaceDocument;
  revision: number;
  updated_at: string;
}

interface WorkspaceVersionRow {
  document: WorkspaceDocument;
  revision: number;
  schema_version: number;
  saved_at: string;
  archived_at: string;
}

function workspaceResponse(body: unknown, status = 200, headers: HeadersInit = {}) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      ...headers,
    },
  });
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isValidWorkspaceRow(value: WorkspaceRow | undefined): value is WorkspaceRow {
  return Boolean(
    value &&
      isWorkspaceDocument(value.document) &&
      isWorkspaceRevision(value.revision, false) &&
      isIsoDate(value.updated_at),
  );
}

async function authorizePro(request: Request) {
  const expectedPriceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!isSupabaseConfigured() || !expectedPriceId) {
    return { error: workspaceResponse({ error: 'Cloud sync is not configured.' }, 503) };
  }
  const user = await getUserFromRequest(request);
  if (!user) {
    return { error: workspaceResponse({ error: 'Please sign in first.' }, 401) };
  }
  const profiles = await selectRows<ProfileRow>('profiles', { id: user.id }, 'subscription_status,price_id');
  if (profiles === null) {
    return { error: workspaceResponse({ error: 'Account data is temporarily unavailable.' }, 503) };
  }
  const status = profiles[0]?.subscription_status ?? null;
  const hasProPrice = profiles[0]?.price_id === expectedPriceId;
  if (!status || !ACTIVE_STATUSES.has(status) || !hasProPrice) {
    return {
      error: workspaceResponse({ error: 'Cloud workspace sync is available on Pro.' }, 402),
    };
  }
  return { user };
}

async function readCurrentWorkspace(userId: string) {
  const rows = await selectRows<WorkspaceRow>(
    'workspace_documents',
    { user_id: userId },
    'document,revision,updated_at',
  );
  if (rows === null) return { ok: false as const, row: null };
  if (rows.length === 0) return { ok: true as const, row: null };
  if (!isValidWorkspaceRow(rows[0])) return { ok: false as const, row: null };
  return { ok: true as const, row: rows[0] };
}

function conflictResponse(row: WorkspaceRow | null) {
  return workspaceResponse(
    {
      code: 'workspace_conflict',
      error: 'The cloud workspace changed on another device.',
      document: row?.document ?? null,
      revision: row?.revision ?? 0,
      updatedAt: row?.updated_at ?? null,
    },
    409,
  );
}

export async function GET(request: Request) {
  const limit = rateLimit(`workspace-read:${getClientIp(request)}`, 30, 60_000);
  if (!limit.ok) {
    return workspaceResponse(
      { error: 'Too many requests.' },
      429,
      { 'Retry-After': String(limit.retryAfterSeconds) },
    );
  }

  const auth = await authorizePro(request);
  if ('error' in auth) return auth.error;

  const url = new URL(request.url);
  if (url.searchParams.size > 0) {
    if (url.searchParams.size !== 1 || url.searchParams.get('versions') !== '1') {
      return workspaceResponse({ error: 'Invalid history request.' }, 400);
    }
    const rows = await selectRows<WorkspaceVersionRow>(
      'workspace_document_versions',
      { user_id: auth.user.id },
      'revision,saved_at,archived_at',
      { order: 'revision.desc', limit: 50 },
    );
    if (rows === null) {
      return workspaceResponse({ error: 'Unable to load workspace history.' }, 503);
    }
    const oldestAllowed = Date.now() - HISTORY_WINDOW_MS;
    const versions = rows
      .filter(
        (row) =>
          isWorkspaceRevision(row.revision, false) &&
          isIsoDate(row.saved_at) &&
          isIsoDate(row.archived_at) &&
          Date.parse(row.archived_at) >= oldestAllowed,
      )
      .slice(0, 20)
      .map((row) => ({
        revision: row.revision,
        savedAt: row.saved_at,
        archivedAt: row.archived_at,
      }));
    return workspaceResponse({ versions });
  }

  const current = await readCurrentWorkspace(auth.user.id);
  if (!current.ok) {
    return workspaceResponse({ error: 'Unable to load the cloud workspace.' }, 503);
  }
  return workspaceResponse({
    document: current.row?.document ?? null,
    revision: current.row?.revision ?? 0,
    updatedAt: current.row?.updated_at ?? null,
  });
}

export async function PUT(request: Request) {
  if (!isAllowedOrigin(request)) {
    return workspaceResponse({ error: 'Forbidden.' }, 403);
  }

  const limit = rateLimit(`workspace-write:${getClientIp(request)}`, 20, 60_000);
  if (!limit.ok) {
    return workspaceResponse(
      { error: 'Too many save requests. Your local copy is safe; please wait a moment.' },
      429,
      { 'Retry-After': String(limit.retryAfterSeconds) },
    );
  }

  const auth = await authorizePro(request);
  if ('error' in auth) return auth.error;

  const bodyResult = await readTextWithLimit(request, MAX_BODY_BYTES);
  if (!bodyResult.ok && bodyResult.reason === 'too_large') {
    return workspaceResponse({ error: 'Workspace is too large to sync.' }, 413);
  }
  if (!bodyResult.ok) {
    return workspaceResponse({ error: 'Unable to read the workspace.' }, 400);
  }

  let body: unknown;
  try {
    body = JSON.parse(bodyResult.text);
  } catch {
    return workspaceResponse({ error: 'Invalid JSON.' }, 400);
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return workspaceResponse({ error: 'Invalid workspace request.' }, 400);
  }

  const candidate = body as Record<string, unknown>;
  // Missing revisions are treated as zero for one safe transition from cached
  // pre-revision clients. They can create a row, but cannot overwrite one.
  const expectedRevision = candidate.expectedRevision ?? 0;
  if (!isWorkspaceRevision(expectedRevision)) {
    return workspaceResponse({ error: 'Invalid workspace revision.' }, 400);
  }

  const hasDocument = Object.hasOwn(candidate, 'document');
  const hasRestoreRevision = Object.hasOwn(candidate, 'restoreRevision');
  if (hasDocument === hasRestoreRevision) {
    return workspaceResponse({ error: 'Choose either a document save or a version restore.' }, 400);
  }

  let document: WorkspaceDocument;
  let restoredFromRevision: number | null = null;
  if (hasRestoreRevision) {
    if (
      expectedRevision === 0 ||
      !isWorkspaceRevision(candidate.restoreRevision, false)
    ) {
      return workspaceResponse({ error: 'Invalid workspace restore request.' }, 400);
    }
    const revision = candidate.restoreRevision;
    const rows = await selectRows<WorkspaceVersionRow>(
      'workspace_document_versions',
      { user_id: auth.user.id, revision: String(revision) },
      'document,revision,schema_version,saved_at,archived_at',
    );
    if (rows === null) {
      return workspaceResponse({ error: 'Unable to load that workspace version.' }, 503);
    }
    const version = rows[0];
    if (
      !version ||
      version.schema_version !== 1 ||
      !isWorkspaceDocument(version.document) ||
      !isIsoDate(version.archived_at) ||
      Date.parse(version.archived_at) < Date.now() - HISTORY_WINDOW_MS
    ) {
      return workspaceResponse({ error: 'That workspace version is no longer available.' }, 404);
    }
    document = { ...version.document, updatedAt: new Date().toISOString() };
    restoredFromRevision = revision;
  } else {
    if (!isWorkspaceDocument(candidate.document)) {
      return workspaceResponse({ error: 'Invalid workspace document.' }, 400);
    }
    document = candidate.document;
  }

  const updatedAt = new Date().toISOString();
  const result =
    expectedRevision === 0
      ? await insertRowReturning<WorkspaceRow>(
          'workspace_documents',
          {
            user_id: auth.user.id,
            document,
            schema_version: document.schemaVersion,
            revision: 1,
            updated_at: updatedAt,
          },
          { onConflict: 'user_id' },
        )
      : await patchRowsReturning<WorkspaceRow>(
          'workspace_documents',
          { user_id: auth.user.id },
          {
            document,
            schema_version: document.schemaVersion,
            revision: expectedRevision + 1,
            updated_at: updatedAt,
          },
          { revision: `eq.${expectedRevision}` },
        );

  if (!result.ok) {
    return workspaceResponse({ error: 'Unable to save the cloud workspace.' }, 503);
  }

  const saved = result.rows[0];
  if (saved) {
    if (!isValidWorkspaceRow(saved)) {
      return workspaceResponse({ error: 'The cloud workspace returned invalid data.' }, 503);
    }
    return workspaceResponse({
      saved: true,
      revision: saved.revision,
      updatedAt: saved.updated_at,
      ...(restoredFromRevision === null
        ? {}
        : { document: saved.document, restoredFromRevision }),
    });
  }

  const current = await readCurrentWorkspace(auth.user.id);
  if (!current.ok) {
    return workspaceResponse({ error: 'Unable to verify the cloud workspace.' }, 503);
  }
  if (current.row && workspaceDocumentsMatch(current.row.document, document)) {
    return workspaceResponse({
      saved: true,
      reconciled: true,
      revision: current.row.revision,
      updatedAt: current.row.updated_at,
      ...(restoredFromRevision === null
        ? {}
        : { document: current.row.document, restoredFromRevision }),
    });
  }
  return conflictResponse(current.row);
}
