import type { PublicState } from '../../shared/types';
import { parsePublicState } from './parseState';

export type ClientResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string; readonly status: number };

const NETWORK_ERROR = 'Connection lost. Retry.';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** fetch wrapper for the { ok, data | error } envelope. Never throws. */
export async function requestJson<T>(path: string, init: RequestInit = {}): Promise<ClientResult<T>> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: { 'content-type': 'application/json', ...init.headers },
    });
  } catch {
    return { ok: false, error: NETWORK_ERROR, status: 0 };
  }

  const body: unknown = await response.json().catch(() => null);
  if (isRecord(body) && body.ok === true && response.ok) return { ok: true, data: body.data as T };
  const error = isRecord(body) && typeof body.error === 'string' ? body.error : `Request failed (${response.status}).`;
  return { ok: false, error, status: response.status };
}

export async function fetchPublicState(includeAnswers: boolean): Promise<PublicState | null> {
  const result = await requestJson<unknown>(includeAnswers ? '/api/state' : '/api/state?answers=0');
  return result.ok ? parsePublicState(result.data) : null;
}

export function postJoin(deviceToken: string): Promise<ClientResult<{ joined: boolean }>> {
  return requestJson('/api/join', { method: 'POST', body: JSON.stringify({ deviceToken }) });
}

export function postAnswer(deviceToken: string, text: string): Promise<ClientResult<{ text: string }>> {
  return requestJson('/api/answer', { method: 'POST', body: JSON.stringify({ deviceToken, text }) });
}
