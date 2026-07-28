import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  insertRowReturning,
  isSupabaseConfigured,
  patchRowsReturning,
  selectRows,
  upsertRowReturning,
} from '@/lib/supabaseAdmin';
import { readTextWithLimit } from '@/lib/requestBody';
import {
  chooseCanonicalSubscription,
  getStripeObjectId,
  isSubscriptionLifecycleEvent,
  toSubscriptionProfileSnapshot,
  type SubscriptionProfileSnapshot,
} from '@/lib/stripeEntitlements';

export const runtime = 'nodejs';

const MAX_WEBHOOK_BYTES = 1_000_000;

type EventStatus = 'pending' | 'processed' | 'ignored' | 'failed';

interface StripeEventRow {
  event_id: string;
  status: EventStatus;
}

interface ProfileOwnerRow {
  id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

interface StoredProfileRow {
  id: string;
  stripe_subscription_id: string | null;
}

interface DonationRow {
  stripe_session_id: string;
}

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return secretKey ? new Stripe(secretKey) : null;
}

function safeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown processing error.';
  return message.slice(0, 1000);
}

async function registerEvent(event: Stripe.Event) {
  const inserted = await insertRowReturning<StripeEventRow>(
    'stripe_events',
    {
      event_id: event.id,
      event_type: event.type,
      object_id: getStripeObjectId(event),
      event_created_at: event.created,
      livemode: event.livemode,
      status: 'pending',
    },
    { onConflict: 'event_id' },
  );

  if (!inserted.ok) {
    throw new Error(`Unable to persist Stripe event (database status ${inserted.status}).`);
  }
  if (inserted.rows.length === 1) return { terminal: false };
  if (inserted.rows.length > 1) throw new Error('Stripe event insert returned multiple rows.');

  const existing = await selectRows<StripeEventRow>(
    'stripe_events',
    { event_id: event.id },
    'event_id,status',
  );
  if (existing === null || existing.length !== 1) {
    throw new Error('Unable to load the existing Stripe event record.');
  }

  return {
    terminal: existing[0].status === 'processed' || existing[0].status === 'ignored',
  };
}

async function markEvent(
  eventId: string,
  status: Exclude<EventStatus, 'pending'>,
  lastError: string | null = null,
) {
  const terminal = status === 'processed' || status === 'ignored';
  const updated = await patchRowsReturning<StripeEventRow>(
    'stripe_events',
    { event_id: eventId },
    {
      status,
      last_error: lastError,
      processed_at: terminal ? new Date().toISOString() : null,
    },
    { status: 'in.(pending,failed)' },
  );
  if (updated.ok && updated.rows.length === 1 && updated.rows[0].event_id === eventId) {
    return;
  }

  // Concurrent duplicate deliveries can finish in either order. Never let a
  // later failure downgrade an event that another delivery already completed.
  if (updated.ok && updated.rows.length === 0) {
    const existing = await selectRows<StripeEventRow>(
      'stripe_events',
      { event_id: eventId },
      'event_id,status',
    );
    if (
      existing?.length === 1 &&
      (existing[0].status === 'processed' || existing[0].status === 'ignored')
    ) {
      return;
    }
  }
  throw new Error(`Unable to mark Stripe event ${status} (database status ${updated.status}).`);
}

async function loadOwnerBySnapshot(snapshot: SubscriptionProfileSnapshot) {
  const columns = 'id,stripe_customer_id,stripe_subscription_id';
  let rows: ProfileOwnerRow[] | null = null;

  if (snapshot.userId) {
    rows = await selectRows<ProfileOwnerRow>('profiles', { id: snapshot.userId }, columns);
  } else if (snapshot.subscriptionId) {
    rows = await selectRows<ProfileOwnerRow>(
      'profiles',
      { stripe_subscription_id: snapshot.subscriptionId },
      columns,
    );
  }
  if ((rows?.length ?? 0) === 0 && snapshot.customerId) {
    rows = await selectRows<ProfileOwnerRow>(
      'profiles',
      { stripe_customer_id: snapshot.customerId },
      columns,
    );
  }

  if (rows === null) throw new Error('Unable to resolve the subscription owner.');
  if (rows.length !== 1) throw new Error('Subscription owner profile was not found or was ambiguous.');

  const profile = rows[0];
  if (snapshot.userId && profile.id !== snapshot.userId) {
    throw new Error('Subscription metadata does not match the stored account owner.');
  }
  if (
    profile.stripe_customer_id &&
    snapshot.customerId &&
    profile.stripe_customer_id !== snapshot.customerId
  ) {
    throw new Error('Subscription customer does not match the stored billing account.');
  }
  return profile;
}

async function syncCurrentSubscription(
  stripe: Stripe,
  subscriptionId: string,
  expectedUserId: string | null,
) {
  const expectedPriceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!expectedPriceId) throw new Error('STRIPE_PRO_PRICE_ID is not configured.');

  const triggeringSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  const triggeringSnapshot = toSubscriptionProfileSnapshot(
    triggeringSubscription,
    expectedPriceId,
  );
  if (!triggeringSnapshot.customerId) throw new Error('Subscription has no Stripe customer.');
  if (expectedUserId && triggeringSnapshot.userId !== expectedUserId) {
    throw new Error('Checkout and subscription ownership metadata do not match.');
  }

  const owner = await loadOwnerBySnapshot(triggeringSnapshot);
  if (expectedUserId && owner.id !== expectedUserId) {
    throw new Error('Checkout owner does not match the stored account owner.');
  }

  // Stripe does not guarantee webhook order. Re-read all current subscriptions
  // for this customer and select the current active Pro subscription, rather
  // than applying the potentially stale event payload.
  const subscriptions = await stripe.subscriptions.list({
    customer: triggeringSnapshot.customerId,
    status: 'all',
    limit: 100,
  });
  const canonicalSubscription = chooseCanonicalSubscription(
    subscriptions.data,
    triggeringSubscription,
    owner.stripe_subscription_id,
    expectedPriceId,
  );
  const snapshot = toSubscriptionProfileSnapshot(canonicalSubscription, expectedPriceId);
  if (!snapshot.customerId || snapshot.customerId !== triggeringSnapshot.customerId) {
    throw new Error('Canonical subscription customer is inconsistent.');
  }
  if (snapshot.userId && snapshot.userId !== owner.id) {
    throw new Error('Canonical subscription metadata belongs to a different account.');
  }

  const stored = await upsertRowReturning<StoredProfileRow>(
    'profiles',
    {
      id: owner.id,
      stripe_customer_id: snapshot.customerId,
      stripe_subscription_id: snapshot.subscriptionId,
      subscription_status: snapshot.status,
      price_id: snapshot.priceId,
      current_period_end: snapshot.currentPeriodEnd,
      cancel_at_period_end: snapshot.cancelAtPeriodEnd,
      canceled_at: snapshot.canceledAt,
      updated_at: new Date().toISOString(),
    },
    'id',
  );
  if (
    !stored.ok ||
    stored.rows.length !== 1 ||
    stored.rows[0].id !== owner.id ||
    stored.rows[0].stripe_subscription_id !== snapshot.subscriptionId
  ) {
    throw new Error(`Subscription profile mutation was not verified (database status ${stored.status}).`);
  }
}

async function processCheckoutSession(stripe: Stripe, sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.mode === 'payment') {
    const stored = await upsertRowReturning<DonationRow>(
      'donations',
      {
        stripe_session_id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        payment_status: session.payment_status,
      },
      'stripe_session_id',
    );
    if (
      !stored.ok ||
      stored.rows.length !== 1 ||
      stored.rows[0].stripe_session_id !== session.id
    ) {
      throw new Error(`Donation mutation was not verified (database status ${stored.status}).`);
    }
    return 'processed' as const;
  }

  if (session.mode === 'subscription') {
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id ?? null;
    if (!subscriptionId || !session.client_reference_id) {
      throw new Error('Completed subscription checkout is missing ownership identifiers.');
    }
    await syncCurrentSubscription(
      stripe,
      subscriptionId,
      session.client_reference_id,
    );
    return 'processed' as const;
  }

  return 'ignored' as const;
}

async function processEvent(stripe: Stripe, event: Stripe.Event) {
  const objectId = getStripeObjectId(event);

  if (event.type === 'checkout.session.completed') {
    if (!objectId) throw new Error('Checkout event has no object identifier.');
    return processCheckoutSession(stripe, objectId);
  }

  if (isSubscriptionLifecycleEvent(event.type)) {
    if (!objectId) throw new Error('Subscription event has no object identifier.');
    await syncCurrentSubscription(stripe, objectId, null);
    return 'processed' as const;
  }

  return 'ignored' as const;
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
    console.error('Stripe webhook signature verification failed:', safeErrorMessage(error));
    return NextResponse.json({ error: 'Invalid Stripe webhook payload.' }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Webhook persistence is unavailable.' }, { status: 503 });
  }

  try {
    const registration = await registerEvent(event);
    if (registration.terminal) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const outcome = await processEvent(stripe, event);
    await markEvent(event.id, outcome);
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = safeErrorMessage(error);
    try {
      await markEvent(event.id, 'failed', message);
    } catch (markError) {
      console.error('Unable to record Stripe webhook failure:', event.id, safeErrorMessage(markError));
    }
    console.error('Stripe webhook processing failed:', event.id, event.type, message);
    // A non-2xx response asks Stripe to retry. Every mutation above is
    // idempotent, so a failure after the business write remains safe to replay.
    return NextResponse.json({ error: 'Failed to process Stripe event.' }, { status: 500 });
  }
}
