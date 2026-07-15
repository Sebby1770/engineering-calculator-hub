import { NextResponse } from 'next/server';
import { getClientIp, rateLimit } from '@/lib/rateLimit';
import { isAllowedOrigin } from '@/lib/requestGuards';
import { readTextWithLimit } from '@/lib/requestBody';
import { getUserFromRequest } from '@/lib/supabaseAuth';
import { isSupabaseConfigured, selectRows, upsertRow } from '@/lib/supabaseAdmin';
import { isWorkspaceDocument, type WorkspaceDocument } from '@/lib/workspace';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 512_000;
const ACTIVE_STATUSES = new Set(['active', 'trialing']);

interface ProfileRow {
  subscription_status: string | null;
  price_id: string | null;
}

interface WorkspaceRow {
  document: WorkspaceDocument;
  updated_at: string;
}

async function authorizePro(request: Request) {
  const expectedPriceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!isSupabaseConfigured() || !expectedPriceId) {
    return { error: NextResponse.json({ error: 'Cloud sync is not configured.' }, { status: 503 }) };
  }
  const user = await getUserFromRequest(request);
  if (!user) {
    return { error: NextResponse.json({ error: 'Please sign in first.' }, { status: 401 }) };
  }
  const profiles = await selectRows<ProfileRow>('profiles', { id: user.id }, 'subscription_status,price_id');
  if (profiles === null) {
    return { error: NextResponse.json({ error: 'Account data is temporarily unavailable.' }, { status: 503 }) };
  }
  const status = profiles?.[0]?.subscription_status ?? null;
  const hasProPrice = profiles?.[0]?.price_id === expectedPriceId;
  if (!status || !ACTIVE_STATUSES.has(status) || !hasProPrice) {
    return {
      error: NextResponse.json(
        { error: 'Cloud workspace backup is available on Pro.' },
        { status: 402 },
      ),
    };
  }
  return { user };
}

export async function GET(request: Request) {
  const limit = rateLimit(`workspace-read:${getClientIp(request)}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  const auth = await authorizePro(request);
  if ('error' in auth) return auth.error;

  const rows = await selectRows<WorkspaceRow>(
    'workspace_documents',
    { user_id: auth.user.id },
    'document,updated_at',
  );
  if (rows === null) {
    return NextResponse.json({ error: 'Unable to load the cloud workspace.' }, { status: 503 });
  }
  return NextResponse.json({ document: rows[0]?.document ?? null, updatedAt: rows[0]?.updated_at ?? null });
}

export async function PUT(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const limit = rateLimit(`workspace-write:${getClientIp(request)}`, 12, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many save requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  const auth = await authorizePro(request);
  if ('error' in auth) return auth.error;

  const bodyResult = await readTextWithLimit(request, MAX_BODY_BYTES);
  if (!bodyResult.ok && bodyResult.reason === 'too_large') {
    return NextResponse.json({ error: 'Workspace is too large to sync.' }, { status: 413 });
  }
  if (!bodyResult.ok) {
    return NextResponse.json({ error: 'Unable to read the workspace.' }, { status: 400 });
  }
  const raw = bodyResult.text;

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const document =
    typeof body === 'object' && body !== null && 'document' in body
      ? (body as { document?: unknown }).document
      : null;
  if (!isWorkspaceDocument(document)) {
    return NextResponse.json({ error: 'Invalid workspace document.' }, { status: 400 });
  }

  const updatedAt = new Date().toISOString();
  const stored = await upsertRow(
    'workspace_documents',
    {
      user_id: auth.user.id,
      document,
      schema_version: document.schemaVersion,
      updated_at: updatedAt,
    },
    'user_id',
  );
  if (!stored.ok) {
    return NextResponse.json({ error: 'Unable to save the cloud workspace.' }, { status: 503 });
  }

  return NextResponse.json({ saved: true, updatedAt });
}
