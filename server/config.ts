export interface Config {
  readonly adminKey: string;
  readonly publicUrl: string;
  readonly dataDir: string;
  readonly port: number;
}

export const DEFAULT_PUBLIC_URL = 'https://mentiqueshie.questlaguna.org';

type Env = Readonly<Record<string, string | undefined>>;

function parsePublicUrl(raw: string | undefined): string {
  const value = (raw ?? '').trim() || DEFAULT_PUBLIC_URL;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`PUBLIC_URL is not a valid URL: ${value}`);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('PUBLIC_URL must start with https:// or http://');
  }
  return url.toString().replace(/\/+$/, '');
}

function parsePort(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === '') return 3000;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) throw new Error(`PORT is not a valid port: ${raw}`);
  return port;
}

/** Reads and validates env. Throws with a clear message when something required is missing. */
export function loadConfig(env: Env): Config {
  const adminKey = (env.ADMIN_KEY ?? '').trim();
  if (adminKey.length === 0) throw new Error('ADMIN_KEY is required. Set it in the environment.');
  if (adminKey.length < 16) console.warn('[config] ADMIN_KEY is short. Use 16 or more random characters.');

  return {
    adminKey,
    publicUrl: parsePublicUrl(env.PUBLIC_URL),
    dataDir: (env.DATA_DIR ?? '').trim() || './data',
    port: parsePort(env.PORT),
  };
}
