import { createHash, timingSafeEqual } from 'node:crypto';
import type { Context, MiddlewareHandler } from 'hono';
import type { AuthThrottle } from './authThrottle';

const digest = (value: string) => createHash('sha256').update(value, 'utf8').digest();

/**
 * Client id for throttling. Behind Traefik the last X-Forwarded-For entry is the address the
 * proxy saw, which the client cannot forge. Without a proxy every caller shares one bucket.
 */
export function clientId(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for');
  const last = forwarded?.split(',').pop()?.trim();
  return last && last.length > 0 ? last : 'direct';
}

/** Checks the x-admin-key header against ADMIN_KEY in constant time. Wrong keys are throttled per client. */
export function adminAuth(adminKey: string, throttle: AuthThrottle): MiddlewareHandler {
  const expected = digest(adminKey);
  return async (c, next) => {
    const client = clientId(c);
    if (throttle.isBlocked(client)) {
      return c.json({ ok: false, error: 'Too many attempts. Retry in 15 minutes.' }, 429);
    }
    const provided = c.req.header('x-admin-key');
    if (!provided) return c.json({ ok: false, error: 'Admin key required.' }, 401);
    if (!timingSafeEqual(digest(provided), expected)) {
      throttle.recordFailure(client);
      return c.json({ ok: false, error: 'Admin key incorrect.' }, 401);
    }
    throttle.recordSuccess(client);
    await next();
  };
}
