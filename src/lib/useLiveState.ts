import { useCallback, useEffect, useState } from 'react';
import type { PublicState } from '../../shared/types';
import { fetchPublicState } from './api';
import { useServerEvents } from './useServerEvents';

export interface LiveState {
  readonly state: PublicState | null;
  readonly connected: boolean;
}

/** Public state kept current over SSE. Phones pass answers: false to skip the answer list. */
export function useLiveState({ answers }: { readonly answers: boolean }): LiveState {
  const [state, setState] = useState<PublicState | null>(null);

  useEffect(() => {
    let active = true;
    void fetchPublicState(answers).then((initial) => {
      // SSE sends a fresh state on connect. The fetch only fills the gap before that.
      if (active && initial) setState((previous) => previous ?? initial);
    });
    return () => {
      active = false;
    };
  }, [answers]);

  const onState = useCallback((next: PublicState) => setState(next), []);
  const connected = useServerEvents(answers ? '/api/events' : '/api/events?answers=0', onState);

  return { state, connected };
}
