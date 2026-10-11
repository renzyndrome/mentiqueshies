import type { Database } from 'bun:sqlite';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { createAuthThrottle } from './authThrottle';
import { createBroadcaster } from './broadcaster';
import type { AppContext } from './context';
import { fail } from './http';
import { createRateLimiter } from './rateLimit';
import { createRepository } from './repository';
import { adminRoutes } from './routes/adminRoutes';
import { eventRoutes } from './routes/eventRoutes';
import { publicRoutes } from './routes/publicRoutes';
import { buildPublicState } from './state';

export interface AppOptions {
  readonly db: Database;
  readonly adminKey: string;
  readonly publicUrl: string;
  readonly clock?: () => Date;
  /** Coalescing window for SSE broadcasts. */
  readonly broadcastDelayMs?: number;
  readonly heartbeatMs?: number;
  /** One accepted answer per device per interval. */
  readonly answerIntervalMs?: number;
  readonly logRequests?: boolean;
}

const MAX_BODY_BYTES = 8 * 1024;
const ADMIN_MAX_FAILURES = 10;
const ADMIN_LOCK_WINDOW_MS = 15 * 60 * 1000;

export function createApp(options: AppOptions): Hono {
  const clock = options.clock ?? (() => new Date());
  const repo = createRepository(options.db, clock);
  const ctx: AppContext = {
    repo,
    publicUrl: options.publicUrl,
    heartbeatMs: options.heartbeatMs ?? 25_000,
    answerLimiter: createRateLimiter({ intervalMs: options.answerIntervalMs ?? 2_000, clock }),
    broadcaster: createBroadcaster({
      delayMs: options.broadcastDelayMs ?? 150,
      render: (variant) => JSON.stringify(buildPublicState(repo, options.publicUrl, variant)),
    }),
  };

  const app = new Hono();

  if (options.logRequests) app.use('*', logger());
  app.use('*', secureHeaders());
  app.use(
    '/api/*',
    bodyLimit({ maxSize: MAX_BODY_BYTES, onError: (c) => fail(c, 413, 'Request too large.') }),
  );

  app.route('/api', publicRoutes(ctx));
  app.route('/api', eventRoutes(ctx));
  const adminThrottle = createAuthThrottle({
    maxFailures: ADMIN_MAX_FAILURES,
    windowMs: ADMIN_LOCK_WINDOW_MS,
    clock,
  });
  app.route('/api/admin', adminRoutes(ctx, options.adminKey, adminThrottle));
  app.all('/api/*', (c) => fail(c, 404, 'Not found.'));

  app.onError((error, c) => {
    console.error('[api] unhandled error', error);
    return fail(c, 500, 'Server error. Retry.');
  });

  return app;
}
