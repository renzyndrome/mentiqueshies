import { relative, resolve } from 'node:path';
import type { Hono } from 'hono';
import { serveStatic } from 'hono/bun';

const IMMUTABLE = 'public, max-age=31536000, immutable';

/** Serves the built client from dist/ with an SPA fallback to index.html. Call after the API routes. */
export function mountClient(app: Hono, distDir: string): void {
  // serveStatic resolves paths against the working directory, so pass a relative root.
  const root = relative(process.cwd(), resolve(distDir)) || '.';

  app.use(
    '/assets/*',
    serveStatic({ root, onFound: (_path, c) => c.header('Cache-Control', IMMUTABLE) }),
  );
  app.use('*', serveStatic({ root }));
  app.get(
    '*',
    serveStatic({ path: `${root}/index.html`, onFound: (_path, c) => c.header('Cache-Control', 'no-cache') }),
  );
}
