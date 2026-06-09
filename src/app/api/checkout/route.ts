import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSiteUrl } from '@/lib/site';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return secretKey ? new Stripe(secretKey) : null;
}

function isLocalHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '::1';
}

// CSRF defense: reject POSTs from a foreign origin. A missing Origin is allowed
// because browsers always attach Origin to genuine cross-site requests, so the
// classic cross-site form/fetch attack is still blocked, while non-browser callers
// and the occasional same-origin client that omits Origin keep working.
function isAllowedOrigin(origin: string | null) {
  if (!origin) return true;
  try {
    const url = new URL(origin);
    if (isLocalHost(url.hostname)) return true;
    return url.host === new URL(getSiteUrl()).host;
  } catch {
    return false;
  }
}

function getCheckoutOrigin(request: Request) {
  const origin = request.headers.get('origin');

  if (origin) {
    try {
      const url = new URL(origin);
      if (isLocalHost(url.hostname)) return origin.replace(/\/+$/, '');
    } catch {
      // fall through to the configured site URL
    }
  }

  return getSiteUrl();
}

export async function POST(request: Request) {
  // 1. Reject cross-site requests (CSRF protection).
  if (!isAllowedOrigin(request.headers.get('origin'))) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  // 2. Rate limit: max 5 checkout attempts per minute per client.
  const limit = rateLimit(`checkout:${getClientIp(request)}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a moment.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  const stripe = getStripeClient();
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!stripe || !priceId) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID in Vercel.' },
      { status: 503 }
    );
  }

  try {
    const origin = getCheckoutOrigin(request);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancelled`,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL.' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Unable to create checkout session.' }, { status: 500 });
  }
}
