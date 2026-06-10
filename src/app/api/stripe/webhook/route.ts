import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { isSupabaseConfigured, insertRow, upsertRow, patchRows } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

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
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid Stripe webhook payload.' }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    // Nothing to persist into; acknowledge so Stripe doesn't retry forever.
    console.info('Stripe event received (persistence skipped, Supabase not configured):', event.type);
    return NextResponse.json({ received: true });
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
      let status: string | null = 'active';
      let priceId: string | null = null;
      let periodEnd: string | null = null;

      if (typeof session.subscription === 'string') {
        try {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          status = subscription.status;
          priceId = subscription.items?.data?.[0]?.price?.id ?? null;
          periodEnd = getPeriodEnd(subscription);
        } catch (error) {
          console.error('Failed to retrieve subscription after checkout:', error);
        }
      }

      const stored = await upsertRow(
        'profiles',
        {
          id: session.client_reference_id,
          stripe_customer_id: customerId,
          subscription_status: status,
          price_id: priceId,
          current_period_end: periodEnd,
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
    if (customerId) {
      const status = event.type === 'customer.subscription.deleted' ? 'canceled' : subscription.status;
      const stored = await patchRows(
        'profiles',
        { stripe_customer_id: customerId },
        {
          subscription_status: status,
          price_id: subscription.items?.data?.[0]?.price?.id ?? null,
          current_period_end: getPeriodEnd(subscription),
          updated_at: new Date().toISOString(),
        }
      );
      if (!stored.ok) {
        console.error('Failed to sync subscription, status:', stored.status);
        return NextResponse.json({ error: 'Failed to record event.' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
