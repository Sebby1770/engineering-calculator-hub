import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { isSupabaseConfigured, insertRow } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return secretKey ? new Stripe(secretKey) : null;
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.info('Stripe checkout completed:', session.id);

    // Record the donation in Supabase (server-only table, RLS deny-all for
    // clients). Idempotent: retried deliveries hit the unique
    // stripe_session_id and are ignored.
    if (isSupabaseConfigured()) {
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
        // Non-2xx makes Stripe retry the delivery, so a transient database
        // outage doesn't lose the record.
        console.error('Failed to record donation, status:', stored.status);
        return NextResponse.json({ error: 'Failed to record event.' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
