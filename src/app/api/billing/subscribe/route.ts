import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { isAllowedOrigin, getPublicOrigin } from '@/lib/requestGuards';
import { getUserFromRequest } from '@/lib/supabaseAuth';
import { isSupabaseConfigured, selectRows, upsertRow } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ProfileRow {
  id: string;
  stripe_customer_id: string | null;
  subscription_status: string | null;
  price_id: string | null;
}

const ACTIVE_STATUSES = new Set(['active', 'trialing']);

// Creates a Stripe Checkout session (subscription mode) for the signed-in
// user's Pro upgrade. The price always comes from server config — the client
// sends nothing but its identity.
export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const limit = rateLimit(`subscribe:${getClientIp(request)}`, 5, 60_000);
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
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!secretKey || !proPriceId || !isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Subscriptions are not configured. Set STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID, and the Supabase server keys.' },
      { status: 503 }
    );
  }

  const stripe = new Stripe(secretKey);

  try {
    // Reuse the user's Stripe customer if they already have one.
    const profiles = await selectRows<ProfileRow>(
      'profiles',
      { id: user.id },
      'id,stripe_customer_id,subscription_status,price_id'
    );
    if (profiles === null) {
      return NextResponse.json({ error: 'Account data is temporarily unavailable.' }, { status: 503 });
    }
    if (
      profiles[0]?.subscription_status &&
      ACTIVE_STATUSES.has(profiles[0].subscription_status) &&
      profiles[0].price_id === proPriceId
    ) {
      return NextResponse.json({ error: 'This account already has an active Pro subscription.' }, { status: 409 });
    }
    let customerId = profiles?.[0]?.stripe_customer_id ?? null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      }, { idempotencyKey: `supabase-user-${user.id}` });
      customerId = customer.id;
      const stored = await upsertRow(
        'profiles',
        {
          id: user.id,
          email: user.email,
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        },
        'id'
      );
      if (!stored.ok) {
        return NextResponse.json({ error: 'Unable to prepare the billing account.' }, { status: 503 });
      }
    }

    const origin = getPublicOrigin(request);
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: proPriceId, quantity: 1 }],
        client_reference_id: user.id,
        success_url: `${origin}/account?upgraded=1`,
        cancel_url: `${origin}/account`,
        allow_promotion_codes: true,
        metadata: { source: 'pro-upgrade' },
        subscription_data: { metadata: { supabase_user_id: user.id } },
      },
      {
        // Collapse double-clicks and concurrent requests while still allowing a
        // fresh Checkout session after the five-minute window.
        idempotencyKey: `pro-checkout-${user.id}-${Math.floor(Date.now() / 300_000)}`,
      },
    );

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL.' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe subscription checkout error:', error);
    return NextResponse.json({ error: 'Unable to start the upgrade.' }, { status: 500 });
  }
}
