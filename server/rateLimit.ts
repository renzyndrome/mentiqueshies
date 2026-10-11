export interface RateLimiter {
  /** True when the key may act now. */
  allows(key: string): boolean;
  /** Records an accepted action for the key. */
  record(key: string): void;
}

interface RateLimiterOptions {
  readonly intervalMs: number;
  readonly clock: () => Date;
  readonly maxKeys?: number;
}

export function createRateLimiter({ intervalMs, clock, maxKeys = 50_000 }: RateLimiterOptions): RateLimiter {
  const lastSeen = new Map<string, number>();

  const prune = (nowMs: number) => {
    for (const [key, at] of lastSeen) {
      if (nowMs - at >= intervalMs) lastSeen.delete(key);
    }
  };

  return {
    allows(key) {
      const at = lastSeen.get(key);
      return at === undefined || clock().getTime() - at >= intervalMs;
    },
    record(key) {
      const nowMs = clock().getTime();
      if (lastSeen.size >= maxKeys) prune(nowMs);
      lastSeen.set(key, nowMs);
    },
  };
}
