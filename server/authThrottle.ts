/** Blocks a client after repeated wrong admin keys, for the rest of the window. */
export interface AuthThrottle {
  isBlocked(client: string): boolean;
  recordFailure(client: string): void;
  recordSuccess(client: string): void;
}

interface AuthThrottleOptions {
  readonly maxFailures: number;
  readonly windowMs: number;
  readonly clock: () => Date;
  readonly maxClients?: number;
}

interface Window {
  readonly startedAt: number;
  readonly failures: number;
}

export function createAuthThrottle({
  maxFailures,
  windowMs,
  clock,
  maxClients = 10_000,
}: AuthThrottleOptions): AuthThrottle {
  const windows = new Map<string, Window>();
  const now = () => clock().getTime();
  const expired = (window: Window, at: number) => at - window.startedAt >= windowMs;

  const prune = (at: number) => {
    for (const [client, window] of windows) {
      if (expired(window, at)) windows.delete(client);
    }
  };

  return {
    isBlocked(client) {
      const window = windows.get(client);
      return window !== undefined && !expired(window, now()) && window.failures >= maxFailures;
    },
    recordFailure(client) {
      const at = now();
      const current = windows.get(client);
      if (windows.size >= maxClients) prune(at);
      windows.set(
        client,
        current && !expired(current, at)
          ? { startedAt: current.startedAt, failures: current.failures + 1 }
          : { startedAt: at, failures: 1 },
      );
    },
    recordSuccess(client) {
      windows.delete(client);
    },
  };
}
