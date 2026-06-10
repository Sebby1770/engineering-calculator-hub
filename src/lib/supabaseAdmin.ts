// Minimal server-only Supabase REST client (no extra dependencies).
//
// SECURITY MODEL: every table denies the anon/authenticated client roles
// (RLS with no write policies + revoked grants), so the browser can never
// touch data directly. All access goes through these helpers using the
// SERVICE ROLE key, which must only ever live in server-side environment
// variables (never NEXT_PUBLIC_*, never shipped to the browser).

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

type TableName = 'donations' | 'feedback' | 'profiles';

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);
}

export interface DbResult {
  ok: boolean;
  status: number;
}

async function restRequest(
  method: 'POST' | 'PATCH' | 'GET',
  table: TableName,
  params: Record<string, string>,
  body: unknown,
  prefer: string
): Promise<{ ok: boolean; status: number; json: unknown }> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return { ok: false, status: 0, json: null };
  }

  const url = new URL(`/rest/v1/${table}`, SUPABASE_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        ...(prefer ? { Prefer: prefer } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
    const json = response.status === 204 ? null : await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, json };
  } catch {
    return { ok: false, status: 0, json: null };
  }
}

export async function insertRow(
  table: TableName,
  row: Record<string, unknown>,
  options?: { onConflict?: string }
): Promise<DbResult> {
  // "ignore-duplicates" makes retried webhook deliveries idempotent.
  const params: Record<string, string> = {};
  if (options?.onConflict) params.on_conflict = options.onConflict;
  const prefer = options?.onConflict
    ? 'return=minimal,resolution=ignore-duplicates'
    : 'return=minimal';
  const { ok, status } = await restRequest('POST', table, params, row, prefer);
  return { ok, status };
}

// Insert-or-update keyed on a unique column.
export async function upsertRow(
  table: TableName,
  row: Record<string, unknown>,
  onConflict: string
): Promise<DbResult> {
  const { ok, status } = await restRequest(
    'POST',
    table,
    { on_conflict: onConflict },
    row,
    'return=minimal,resolution=merge-duplicates'
  );
  return { ok, status };
}

// Update rows matching simple equality filters, e.g. { id: userId }.
export async function patchRows(
  table: TableName,
  match: Record<string, string>,
  values: Record<string, unknown>
): Promise<DbResult> {
  const params: Record<string, string> = {};
  for (const [column, value] of Object.entries(match)) {
    params[column] = `eq.${value}`;
  }
  const { ok, status } = await restRequest('PATCH', table, params, values, 'return=minimal');
  return { ok, status };
}

// Read rows matching simple equality filters. Returns null on failure.
export async function selectRows<T = Record<string, unknown>>(
  table: TableName,
  match: Record<string, string>,
  columns = '*'
): Promise<T[] | null> {
  const params: Record<string, string> = { select: columns };
  for (const [column, value] of Object.entries(match)) {
    params[column] = `eq.${value}`;
  }
  const { ok, json } = await restRequest('GET', table, params, undefined, '');
  return ok && Array.isArray(json) ? (json as T[]) : null;
}
