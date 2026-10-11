import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import type { AppContext } from '../context';
import { wantsAnswers } from '../http';
import { buildPublicState } from '../state';

const RETRY_MS = 3_000;

export function eventRoutes(ctx: AppContext): Hono {
  const routes = new Hono();

  routes.get('/events', (c) => {
    const variant = wantsAnswers(c) ? 'full' : 'lite';
    c.header('Cache-Control', 'no-cache, no-transform');
    c.header('X-Accel-Buffering', 'no');

    return streamSSE(
      c,
      async (stream) => {
        // Register abort handling first, so a client that leaves during the first write still cleans up.
        const closed = new Promise<void>((resolve) => {
          stream.onAbort(resolve);
          c.req.raw.signal.addEventListener('abort', () => resolve(), { once: true });
        });
        const send = (payload: string) =>
          stream.writeSSE({ event: 'state', data: payload }).catch(() => undefined);

        await stream.writeSSE({
          event: 'state',
          retry: RETRY_MS,
          data: JSON.stringify(buildPublicState(ctx.repo, ctx.publicUrl, variant)),
        });

        const unsubscribe = ctx.broadcaster.subscribe(variant, (payload) => {
          void send(payload);
        });
        const heartbeat = setInterval(() => {
          void stream.write(': heartbeat\n\n').catch(() => undefined);
        }, ctx.heartbeatMs);

        await closed;

        clearInterval(heartbeat);
        unsubscribe();
      },
      async (error) => {
        console.error('[sse] stream error', error);
      },
    );
  });

  return routes;
}
