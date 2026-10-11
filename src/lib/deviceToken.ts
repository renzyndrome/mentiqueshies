import { DEVICE_TOKEN_PATTERN } from '../../shared/limits';
import { readStorage, writeStorage } from './storage';

const STORAGE_KEY = 'quest-respond:device-token';

// Fallback for browsers that block storage: one token per page load.
let memoryToken: string | null = null;

function createToken(): string {
  // getRandomValues works on plain http too, unlike crypto.randomUUID.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Random per-device id kept in localStorage. Never shown in the UI. */
export function getDeviceToken(): string {
  const stored = readStorage(STORAGE_KEY);
  if (stored && DEVICE_TOKEN_PATTERN.test(stored)) return stored;
  if (memoryToken) return memoryToken;
  const token = createToken();
  memoryToken = token;
  writeStorage(STORAGE_KEY, token);
  return token;
}
