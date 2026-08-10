// Supabase's current secret keys are opaque `sb_secret_...` values, not JWTs.
// PostgREST receives them through `apikey`; only legacy JWT-based service-role
// keys belong in the Authorization header.
export function buildSupabaseRestHeaders(apiKey: string, prefer = '') {
  const headers: Record<string, string> = {
    apikey: apiKey,
    'Content-Type': 'application/json',
  };

  if (!apiKey.startsWith('sb_')) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  if (prefer) {
    headers.Prefer = prefer;
  }

  return headers;
}
