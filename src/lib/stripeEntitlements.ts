import type Stripe from 'stripe';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SUBSCRIPTION_LIFECYCLE_EVENTS = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.paused',
  'customer.subscription.resumed',
]);
const ACTIVE_STATUSES = new Set(['active', 'trialing']);
const TERMINAL_SUBSCRIPTION_STATUSES = new Set(['canceled', 'incomplete_expired']);

export const PRO_PRICE_CONTRACT = {
  unitAmount: 900,
  currency: 'usd',
  interval: 'month',
  intervalCount: 1,
} as const;

export interface SubscriptionProfileSnapshot {
  userId: string | null;
  customerId: string | null;
  subscriptionId: string;
  status: string;
  priceId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
}

function unixSecondsToIso(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? new Date(value * 1000).toISOString()
    : null;
}

function getCustomerId(customer: Stripe.Subscription['customer']) {
  if (!customer) return null;
  return typeof customer === 'string' ? customer : customer.id;
}

export function isSubscriptionLifecycleEvent(type: string) {
  return SUBSCRIPTION_LIFECYCLE_EVENTS.has(type);
}

export function matchesProPriceContract(price: Stripe.Price) {
  return (
    price.active &&
    price.type === 'recurring' &&
    price.billing_scheme === 'per_unit' &&
    price.unit_amount === PRO_PRICE_CONTRACT.unitAmount &&
    price.currency.toLowerCase() === PRO_PRICE_CONTRACT.currency &&
    price.recurring?.interval === PRO_PRICE_CONTRACT.interval &&
    price.recurring.interval_count === PRO_PRICE_CONTRACT.intervalCount &&
    price.recurring.usage_type === 'licensed'
  );
}

export function getStripeObjectId(event: { data?: { object?: unknown } }) {
  const object = event.data?.object;
  if (!object || typeof object !== 'object' || !('id' in object)) return null;
  const id = (object as { id?: unknown }).id;
  return typeof id === 'string' && id.length > 0 && id.length <= 255 ? id : null;
}

export function toSubscriptionProfileSnapshot(
  subscription: Stripe.Subscription,
  expectedPriceId: string,
): SubscriptionProfileSnapshot {
  const items = subscription.items?.data ?? [];
  const selectedItem =
    items.find((item) => item.price?.id === expectedPriceId) ?? items[0] ?? null;
  const itemPeriodEnd = selectedItem as unknown as { current_period_end?: number } | null;
  const legacySubscription = subscription as unknown as { current_period_end?: number };
  const metadataUserId = subscription.metadata?.supabase_user_id;

  return {
    userId:
      typeof metadataUserId === 'string' && UUID_RE.test(metadataUserId)
        ? metadataUserId
        : null,
    customerId: getCustomerId(subscription.customer),
    subscriptionId: subscription.id,
    status: subscription.status,
    priceId: selectedItem?.price?.id ?? null,
    currentPeriodEnd: unixSecondsToIso(
      itemPeriodEnd?.current_period_end ?? legacySubscription.current_period_end,
    ),
    cancelAtPeriodEnd: subscription.cancel_at_period_end === true,
    canceledAt: unixSecondsToIso(subscription.canceled_at),
  };
}

export function chooseCanonicalSubscription(
  subscriptions: Stripe.Subscription[],
  triggeringSubscription: Stripe.Subscription,
  currentSubscriptionId: string | null,
  expectedPriceId: string,
) {
  const activePro = subscriptions
    .filter((subscription) => {
      const snapshot = toSubscriptionProfileSnapshot(subscription, expectedPriceId);
      return ACTIVE_STATUSES.has(snapshot.status) && snapshot.priceId === expectedPriceId;
    })
    .sort((a, b) => b.created - a.created);
  if (activePro.length > 1) {
    throw new Error('Multiple active Pro subscriptions require manual billing resolution.');
  }
  if (activePro[0]) return activePro[0];

  const currentlyStored = currentSubscriptionId
    ? subscriptions.find((subscription) => subscription.id === currentSubscriptionId)
    : null;
  return currentlyStored ?? triggeringSubscription;
}

export function isNonTerminalProSubscription(
  subscription: Stripe.Subscription,
  expectedPriceId: string,
) {
  const snapshot = toSubscriptionProfileSnapshot(subscription, expectedPriceId);
  return (
    snapshot.priceId === expectedPriceId &&
    !TERMINAL_SUBSCRIPTION_STATUSES.has(snapshot.status)
  );
}
