// Best-effort, in-memory fixed-window rate limiter.
//
// NOTE: On serverless / multi-instance platforms (e.g. Vercel) each instance has
// its own memory, so this is a *soft* limit that resets on cold starts and is not
// shared across regions. It meaningfully slows down abuse from a single client but
// is not a hard global guarantee. For strict global limits, back this with a shared
// store such as Upstash Redis or Vercel KV.

interface WindowEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, WindowEntry>();

// Guard against unbounded memory growth on long-lived instances.
const MAX_TRACKED_KEYS = 10_000;

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit = 5, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    if (store.size > MAX_TRACKED_KEYS) {
      store.forEach((value, k) => {
        if (value.resetAt <= now) store.delete(k);
      });
    }
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, limit, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (entry.count >= limit) {
    return {
      ok: false,
      limit,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  return { ok: true, limit, remaining: limit - entry.count, retryAfterSeconds: 0 };
}

// Resolve a best-effort client identifier from proxy headers.
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}
