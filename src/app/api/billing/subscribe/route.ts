import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { isAllowedOrigin, getPublicOrigin } from '@/lib/requestGuards';
import { getUserFromRequest } from '@/lib/supabaseAuth';
import { isSupabaseConfigured, selectRows, upsertRow } from '@/lib/supabaseAdmin';
import {
  isNonTerminalProSubscription,
  matchesProPriceContract,
} from '@/lib/stripeEntitlements';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ProfileRow {
  id: string;
  stripe_customer_id: string | null;
}

async function openCheckoutForPrice(
  stripe: Stripe,
  customerId: string,
  userId: string,
  priceId: string,
) {
  const sessions = await stripe.checkout.sessions.list({
    customer: customerId,
    status: 'open',
    limit: 100,
  });
  if (sessions.has_more) {
    throw new Error('Too many open Checkout sessions to verify safely.');
  }

  for (const session of sessions.data) {
    if (
      session.mode !== 'subscription' ||
      session.client_reference_id !== userId ||
      session.metadata?.source !== 'pro-upgrade' ||
      !session.url
    ) {
      continue;
    }
    if (session.metadata?.pro_price_id === priceId) return session;

    // Compatibility with open sessions created before price metadata was
    // recorded: inspect their line items before deciding whether to reuse.
    const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
    if (items.data.some((item) => item.price?.id === priceId)) return session;
  }
  return null;
}

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
    const configuredPrice = await stripe.prices.retrieve(proPriceId);
    if (!matchesProPriceContract(configuredPrice)) {
      console.error('Configured Stripe Pro price does not match the advertised price contract.');
      return NextResponse.json(
        { error: 'Subscriptions are temporarily unavailable because pricing is misconfigured.' },
        { status: 503 },
      );
    }

    // Reuse the user's Stripe customer if they already have one.
    const profiles = await selectRows<ProfileRow>(
      'profiles',
      { id: user.id },
      'id,stripe_customer_id'
    );
    if (profiles === null) {
      return NextResponse.json({ error: 'Account data is temporarily unavailable.' }, { status: 503 });
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

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 100,
    });
    if (subscriptions.has_more) {
      return NextResponse.json(
        { error: 'Unable to verify the complete billing history. Contact support before upgrading.' },
        { status: 409 },
      );
    }
    const liveProSubscriptions = subscriptions.data.filter((subscription) =>
      isNonTerminalProSubscription(subscription, proPriceId),
    );
    if (liveProSubscriptions.length > 0) {
      return NextResponse.json(
        {
          error:
            liveProSubscriptions.length > 1
              ? 'Multiple Pro subscriptions were detected. Contact support so billing can be corrected.'
              : 'A Pro subscription already exists for this billing account. Use the Billing Portal or wait for account status to refresh.',
        },
        { status: 409 },
      );
    }

    const openSession = await openCheckoutForPrice(stripe, customerId, user.id, proPriceId);
    if (openSession?.url) return NextResponse.json({ url: openSession.url, reused: true });

    const origin = getPublicOrigin(request);
    const latestSubscriptionId = subscriptions.data
      .slice()
      .sort((a, b) => b.created - a.created)[0]?.id ?? 'initial';
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: proPriceId, quantity: 1 }],
        client_reference_id: user.id,
        success_url: `${origin}/account?upgraded=1`,
        cancel_url: `${origin}/account`,
        allow_promotion_codes: true,
        metadata: { source: 'pro-upgrade', pro_price_id: proPriceId },
        subscription_data: { metadata: { supabase_user_id: user.id } },
      },
      {
        // Collapse concurrent attempts. A terminal subscription ID advances
        // the generation so a genuinely canceled customer can subscribe again.
        idempotencyKey: `pro-checkout-${user.id}-${latestSubscriptionId}`,
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
