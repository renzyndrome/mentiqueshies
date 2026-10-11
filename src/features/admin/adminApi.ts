import type { AdminState, SessionUpdate } from '../../../shared/types';
import { requestJson } from '../../lib/api';
import type { ClientResult } from '../../lib/api';

export type AdminResult = ClientResult<AdminState>;

const withKey = (adminKey: string, init: RequestInit = {}): RequestInit => ({
  ...init,
  headers: { 'x-admin-key': adminKey },
});

export const fetchAdminState = (adminKey: string): Promise<AdminResult> =>
  requestJson<AdminState>('/api/admin/state', withKey(adminKey));

export const updateSession = (adminKey: string, update: SessionUpdate): Promise<AdminResult> =>
  requestJson<AdminState>('/api/admin/session', withKey(adminKey, { method: 'PUT', body: JSON.stringify(update) }));

export const setAnswerHidden = (adminKey: string, id: number, hidden: boolean): Promise<AdminResult> =>
  requestJson<AdminState>(`/api/admin/answers/${id}`, withKey(adminKey, { method: 'PUT', body: JSON.stringify({ hidden }) }));

export const resetSession = (adminKey: string): Promise<AdminResult> =>
  requestJson<AdminState>('/api/admin/reset', withKey(adminKey, { method: 'POST' }));
