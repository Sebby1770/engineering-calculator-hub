import { NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { isAllowedOrigin } from '@/lib/requestGuards';
import { readTextWithLimit } from '@/lib/requestBody';
import { isSupabaseConfigured, insertRow } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;
const EMAIL_MAX = 320;
const MAX_BODY_BYTES = 16_384;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  // 1. Reject cross-site requests (CSRF protection).
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  // 2. Rate limit: max 3 submissions per minute per client.
  const limit = rateLimit(`feedback:${getClientIp(request)}`, 3, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again in a moment.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Feedback is not configured on this deployment.' },
      { status: 503 }
    );
  }

  const bodyResult = await readTextWithLimit(request, MAX_BODY_BYTES);
  if (!bodyResult.ok && bodyResult.reason === 'too_large') {
    return NextResponse.json({ error: 'Request body is too large.' }, { status: 413 });
  }
  if (!bodyResult.ok) {
    return NextResponse.json({ error: 'Unable to read request body.' }, { status: 400 });
  }
  const raw = bodyResult.text;

  let body: Record<string, unknown> | null = null;
  try {
    const parsed: unknown = JSON.parse(raw);
    body = typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    body = null;
  }
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // 3. Honeypot: real users never fill this hidden field. Pretend success so
  //    bots get no signal, but store nothing.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ received: true });
  }

  // 4. Validate input.
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) {
    return NextResponse.json(
      { error: `Message must be between ${MESSAGE_MIN} and ${MESSAGE_MAX} characters.` },
      { status: 400 }
    );
  }

  let email: string | null = null;
  if (typeof body.email === 'string' && body.email.trim() !== '') {
    email = body.email.trim();
    if (email.length > EMAIL_MAX || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
  }

  const stored = await insertRow('feedback', { message, email });
  if (!stored.ok) {
    console.error('Failed to store feedback, status:', stored.status);
    return NextResponse.json(
      { error: 'Unable to save feedback right now. Please try again later.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
