import { readStorage, removeStorage, writeStorage } from './storage';

const STORAGE_KEY = 'quest-respond:last-answer';

export function saveLastAnswer(text: string): void {
  writeStorage(STORAGE_KEY, text);
}

export function loadLastAnswer(): string | null {
  const value = readStorage(STORAGE_KEY);
  return value && value.trim().length > 0 ? value : null;
}

export function clearLastAnswer(): void {
  removeStorage(STORAGE_KEY);
}
