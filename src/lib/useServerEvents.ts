import { useEffect, useRef, useState } from 'react';
import type { PublicState } from '../../shared/types';
import { parseStateJson } from './parseState';

const RECONNECT_MS = 5_000;

/**
 * Subscribes to /api/events. EventSource retries network drops on its own but gives up
 * after an HTTP error (a deploy or a proxy 502), so a closed stream is reopened here.
 */
export function useServerEvents(path: string, onState: (state: PublicState) => void): boolean {
  const handler = useRef(onState);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    handler.current = onState;
  }, [onState]);

  useEffect(() => {
    if (typeof EventSource === 'undefined') return undefined;
    let source: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const connect = () => {
      const current = new EventSource(path);
      source = current;
      current.addEventListener('state', (event) => {
        const state = parseStateJson((event as MessageEvent<string>).data);
        if (state) handler.current(state);
      });
      current.onopen = () => setConnected(true);
      current.onerror = () => {
        setConnected(false);
        if (current.readyState === EventSource.CLOSED && !stopped) {
          current.close();
          retryTimer = setTimeout(connect, RECONNECT_MS);
        }
      };
    };

    connect();
    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      source?.close();
    };
  }, [path]);

  return connected;
}
