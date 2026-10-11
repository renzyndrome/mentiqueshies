import type { StateVariant } from './state';

type Listener = (payload: string) => void;

export interface StateBroadcaster {
  subscribe(variant: StateVariant, listener: Listener): () => void;
  /** Schedules one broadcast. Calls inside the delay window coalesce. */
  notify(): void;
}

interface BroadcasterOptions {
  readonly delayMs: number;
  readonly render: (variant: StateVariant) => string;
}

export function createBroadcaster({ delayMs, render }: BroadcasterOptions): StateBroadcaster {
  // Copy-on-write lists, so a listener that unsubscribes during a flush cannot disturb iteration.
  let listeners: Readonly<Record<StateVariant, readonly Listener[]>> = { full: [], lite: [] };
  let pending: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    pending = null;
    const snapshot = listeners;
    for (const variant of ['full', 'lite'] as const) {
      const group = snapshot[variant];
      if (group.length === 0) continue;
      let payload: string;
      try {
        payload = render(variant);
      } catch (error) {
        // A throw inside a timer would end the process. Skip this round; the next change retries.
        console.error('[sse] could not build state', error);
        continue;
      }
      for (const listener of group) {
        try {
          listener(payload);
        } catch (error) {
          console.error('[sse] listener failed', error);
        }
      }
    }
  };

  return {
    subscribe(variant, listener) {
      listeners = { ...listeners, [variant]: [...listeners[variant], listener] };
      return () => {
        listeners = { ...listeners, [variant]: listeners[variant].filter((item) => item !== listener) };
      };
    },
    notify() {
      if (pending !== null) return;
      pending = setTimeout(flush, delayMs);
    },
  };
}
