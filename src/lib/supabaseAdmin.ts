// Minimal server-only Supabase REST client (no extra dependencies).
//
// SECURITY MODEL: both tables (donations, feedback) have row-level security
// enabled with ZERO policies and revoked grants for the client roles, so the
// public anon key cannot read or write anything. All access goes through this
// helper using the SERVICE ROLE key, which must only ever live in server-side
// environment variables (never NEXT_PUBLIC_*, never shipped to the browser).

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

type TableName = 'donations' | 'feedback';

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);
}

export interface InsertResult {
  ok: boolean;
  status: number;
}

export async function insertRow(
  table: TableName,
  row: Record<string, unknown>,
  options?: { onConflict?: string }
): Promise<InsertResult> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return { ok: false, status: 0 };
  }

  const url = new URL(`/rest/v1/${table}`, SUPABASE_URL);
  if (options?.onConflict) {
    url.searchParams.set('on_conflict', options.onConflict);
  }

  // "resolution=ignore-duplicates" makes retried webhook deliveries idempotent.
  const prefer = options?.onConflict
    ? 'return=minimal,resolution=ignore-duplicates'
    : 'return=minimal';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: prefer,
      },
      body: JSON.stringify(row),
      cache: 'no-store',
    });
    return { ok: response.ok, status: response.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
