import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSupabaseRestHeaders } from '../src/lib/supabaseApiKey.ts';

test('opaque Supabase secret keys are never sent as bearer tokens', () => {
  const headers = buildSupabaseRestHeaders('sb_secret_example_key', 'return=minimal');

  assert.equal(headers.apikey, 'sb_secret_example_key');
  assert.equal(headers.Authorization, undefined);
  assert.equal(headers.Prefer, 'return=minimal');
});

test('legacy service-role JWT keys retain bearer authorization', () => {
  const legacyKey = 'eyJlegacy.service-role.signature';
  const headers = buildSupabaseRestHeaders(legacyKey);

  assert.equal(headers.apikey, legacyKey);
  assert.equal(headers.Authorization, `Bearer ${legacyKey}`);
  assert.equal(headers.Prefer, undefined);
});
