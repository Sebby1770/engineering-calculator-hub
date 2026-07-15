import { NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { getUserFromRequest } from '@/lib/supabaseAuth';
import { isSupabaseConfigured, selectRows } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ProfileRow {
  subscription_status: string | null;
  price_id: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
}

const ACTIVE_STATUSES = new Set(['active', 'trialing']);

// Returns the signed-in user's subscription state, verified server-side.
// This is the single source of truth the UI uses for Pro gating.
export async function GET(request: Request) {
  const limit = rateLimit(`me-sub:${getClientIp(request)}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ configured: false, active: false });
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const profiles = await selectRows<ProfileRow>(
    'profiles',
    { id: user.id },
    'subscription_status,price_id,current_period_end,stripe_customer_id'
  );
  if (profiles === null) {
    return NextResponse.json({ error: 'Subscription data is temporarily unavailable.' }, { status: 503 });
  }
  const profile = profiles?.[0];
  const status = profile?.subscription_status ?? null;
  const expectedPriceId = process.env.STRIPE_PRO_PRICE_ID;
  const hasProPrice = Boolean(expectedPriceId && profile?.price_id === expectedPriceId);

  return NextResponse.json({
    configured: Boolean(expectedPriceId),
    email: user.email,
    active: status !== null && ACTIVE_STATUSES.has(status) && hasProPrice,
    status,
    priceId: profile?.price_id ?? null,
    currentPeriodEnd: profile?.current_period_end ?? null,
    hasBilling: Boolean(profile?.stripe_customer_id),
  });
}
