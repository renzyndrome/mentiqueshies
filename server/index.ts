import { existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createApp } from './app';
import { loadConfig } from './config';
import { openDatabase } from './db';
import { mountClient } from './static';

// SSE heartbeats run every 25s, so the idle timeout must sit above that.
const IDLE_TIMEOUT_SECONDS = 60;

function main(): void {
  const config = loadConfig(process.env);

  mkdirSync(config.dataDir, { recursive: true });
  const dbPath = join(config.dataDir, 'respond.sqlite');
  const db = openDatabase(dbPath);

  const app = createApp({
    db,
    adminKey: config.adminKey,
    publicUrl: config.publicUrl,
    logRequests: true,
  });

  const distDir = resolve(import.meta.dir, '..', 'dist');
  if (existsSync(join(distDir, 'index.html'))) {
    mountClient(app, distDir);
  } else {
    console.warn('[server] dist/index.html not found. Serving the API only. Run bun run build.');
  }

  const server = Bun.serve({
    port: config.port,
    hostname: '0.0.0.0',
    idleTimeout: IDLE_TIMEOUT_SECONDS,
    fetch: app.fetch,
  });
  console.log(`[server] Quest Respond on port ${server.port}. Data at ${resolve(dbPath)}.`);

  const shutdown = () => {
    server.stop(true);
    db.close();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

try {
  main();
} catch (error) {
  console.error('[server] failed to start:', error instanceof Error ? error.message : error);
  process.exit(1);
}
