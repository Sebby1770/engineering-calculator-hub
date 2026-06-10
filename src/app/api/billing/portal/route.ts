import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { isAllowedOrigin, getPublicOrigin } from '@/lib/requestGuards';
import { getUserFromRequest } from '@/lib/supabaseAuth';
import { isSupabaseConfigured, selectRows } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ProfileRow {
  stripe_customer_id: string | null;
}

// Opens the Stripe Billing Portal so subscribers can manage or cancel their
// plan themselves. Requires the Billing Portal to be enabled in Stripe.
export async function POST(request: Request) {
  if (!isAllowedOrigin(request.headers.get('origin'))) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const limit = rateLimit(`portal:${getClientIp(request)}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a moment.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || !isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Billing is not configured.' }, { status: 503 });
  }

  const profiles = await selectRows<ProfileRow>('profiles', { id: user.id }, 'stripe_customer_id');
  const customerId = profiles?.[0]?.stripe_customer_id;
  if (!customerId) {
    return NextResponse.json({ error: 'No billing history for this account yet.' }, { status: 400 });
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getPublicOrigin(request)}/account`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe billing portal error:', error);
    return NextResponse.json({ error: 'Unable to open the billing portal.' }, { status: 500 });
  }
}
