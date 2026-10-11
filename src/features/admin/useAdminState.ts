import { useCallback, useEffect, useRef, useState } from 'react';
import type { AdminState } from '../../../shared/types';
import { useServerEvents } from '../../lib/useServerEvents';
import { fetchAdminState } from './adminApi';
import type { AdminResult } from './adminApi';

/** Runs one admin call. Resolves to an error message, or null on success. */
export type AdminRunner = (action: (adminKey: string) => Promise<AdminResult>) => Promise<string | null>;

const REFRESH_DEBOUNCE_MS = 250;

export function useAdminState(adminKey: string, onUnauthorized: () => void) {
  const [state, setState] = useState<AdminState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const unauthorized = useRef(onUnauthorized);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    unauthorized.current = onUnauthorized;
  }, [onUnauthorized]);

  const refresh = useCallback(async () => {
    const result = await fetchAdminState(adminKey);
    if (result.ok) {
      setState(result.data);
      setLoadError(null);
    } else if (result.status === 401) {
      unauthorized.current();
    } else {
      setLoadError(result.error);
    }
  }, [adminKey]);

  useEffect(() => {
    void refresh();
    return () => clearTimeout(refreshTimer.current);
  }, [refresh]);

  // Any public change (new answer, join) means admin data changed too. Refetch, debounced.
  const onEvent = useCallback(() => {
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => void refresh(), REFRESH_DEBOUNCE_MS);
  }, [refresh]);
  const connected = useServerEvents('/api/events?answers=0', onEvent);

  const run = useCallback<AdminRunner>(
    async (action) => {
      const result = await action(adminKey);
      if (result.ok) {
        setState(result.data);
        return null;
      }
      if (result.status === 401) {
        unauthorized.current();
        return null;
      }
      return result.error;
    },
    [adminKey],
  );

  return { state, loadError, connected, run };
}
