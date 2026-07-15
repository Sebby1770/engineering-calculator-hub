import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { isSupabaseConfigured, insertRow, upsertRow, patchRows } from '@/lib/supabaseAdmin';
import { readTextWithLimit } from '@/lib/requestBody';

export const runtime = 'nodejs';

const MAX_WEBHOOK_BYTES = 1_000_000;

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return secretKey ? new Stripe(secretKey) : null;
}

// Stripe moved current_period_end from the subscription onto its items in
// newer API versions — read it from either location.
function getPeriodEnd(subscription: Stripe.Subscription): string | null {
  const item = subscription.items?.data?.[0] as unknown as
    | { current_period_end?: number }
    | undefined;
  const legacy = subscription as unknown as { current_period_end?: number };
  const timestamp = item?.current_period_end ?? legacy.current_period_end;
  return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}

function getCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  if (!customer) return null;
  return typeof customer === 'string' ? customer : customer.id;
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook is not configured.' }, { status: 503 });
  }

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const bodyResult = await readTextWithLimit(request, MAX_WEBHOOK_BYTES);
    if (!bodyResult.ok && bodyResult.reason === 'too_large') {
      return NextResponse.json({ error: 'Webhook payload is too large.' }, { status: 413 });
    }
    if (!bodyResult.ok) {
      return NextResponse.json({ error: 'Unable to read webhook payload.' }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(bodyResult.text, signature, webhookSecret);
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid Stripe webhook payload.' }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    // Fail closed so Stripe retries after a transient configuration incident;
    // acknowledging here would silently lose subscription entitlements.
    return NextResponse.json({ error: 'Webhook persistence is unavailable.' }, { status: 503 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.info('Stripe checkout completed:', session.id, 'mode:', session.mode);

    if (session.mode === 'payment') {
      // One-off support payment → donation log. Idempotent: retried
      // deliveries hit the unique stripe_session_id and are ignored.
      const stored = await insertRow(
        'donations',
        {
          stripe_session_id: session.id,
          amount_total: session.amount_total,
          currency: session.currency,
          payment_status: session.payment_status,
        },
        { onConflict: 'stripe_session_id' }
      );
      if (!stored.ok) {
        console.error('Failed to record donation, status:', stored.status);
        return NextResponse.json({ error: 'Failed to record event.' }, { status: 500 });
      }
    }

    if (session.mode === 'subscription' && session.client_reference_id) {
      // Pro subscription started → attach the Stripe customer + status to the
      // Supabase user (client_reference_id carries the user id we set at
      // checkout creation).
      const customerId = getCustomerId(session.customer);
      if (typeof session.subscription !== 'string' || !customerId) {
        console.error('Completed subscription checkout is missing its subscription or customer id.');
        return NextResponse.json({ error: 'Incomplete subscription event.' }, { status: 500 });
      }

      let subscription: Stripe.Subscription;
      try {
        subscription = await stripe.subscriptions.retrieve(session.subscription);
      } catch (error) {
        console.error('Failed to retrieve subscription after checkout:', error);
        return NextResponse.json({ error: 'Unable to verify subscription.' }, { status: 500 });
      }
      const priceId = subscription.items?.data?.[0]?.price?.id ?? null;
      const expectedPriceId = process.env.STRIPE_PRO_PRICE_ID;
      const metadataUserId = subscription.metadata?.supabase_user_id;
      if (!expectedPriceId) {
        return NextResponse.json({ error: 'Pro billing is not configured.' }, { status: 503 });
      }
      if (metadataUserId !== session.client_reference_id) {
        console.error('Subscription metadata does not match its Checkout session user.');
        return NextResponse.json({ error: 'Unexpected subscription owner.' }, { status: 500 });
      }
      if (priceId !== expectedPriceId) {
        console.error('Subscription checkout price does not match STRIPE_PRO_PRICE_ID.');
      }

      const stored = await upsertRow(
        'profiles',
        {
          id: session.client_reference_id,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status,
          price_id: priceId,
          current_period_end: getPeriodEnd(subscription),
          stripe_event_created_at: event.created,
          updated_at: new Date().toISOString(),
        },
        'id'
      );
      if (!stored.ok) {
        console.error('Failed to upsert profile after checkout, status:', stored.status);
        return NextResponse.json({ error: 'Failed to record event.' }, { status: 500 });
      }
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customerId = getCustomerId(subscription.customer);
    const priceId = subscription.items?.data?.[0]?.price?.id ?? null;
    if (customerId) {
      const status = event.type === 'customer.subscription.deleted' ? 'canceled' : subscription.status;
      const orderingOperator = event.type === 'customer.subscription.deleted' ? 'lte' : 'lt';
      const stored = await patchRows(
        'profiles',
        { stripe_subscription_id: subscription.id },
        {
          stripe_customer_id: customerId,
          subscription_status: status,
          price_id: priceId,
          current_period_end: getPeriodEnd(subscription),
          stripe_event_created_at: event.created,
          updated_at: new Date().toISOString(),
        },
        {
          or: `(stripe_event_created_at.is.null,stripe_event_created_at.${orderingOperator}.${event.created})`,
        },
      );
      if (!stored.ok) {
        console.error('Failed to sync subscription, status:', stored.status);
        return NextResponse.json({ error: 'Failed to record event.' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
