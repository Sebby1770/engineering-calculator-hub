import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Browser-side Supabase client used ONLY for authentication (magic-link
// sign-in and session handling). It uses the public anon key, which has no
// data access: every table denies the anon/authenticated roles, and all data
// reads/writes go through our own API routes.
let cached: SupabaseClient | null | undefined;

export function getSupabaseBrowser(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  cached = url && anonKey ? createClient(url, anonKey) : null;
  return cached;
}
