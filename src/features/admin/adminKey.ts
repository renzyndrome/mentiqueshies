import { readStorage, removeStorage, writeStorage } from '../../lib/storage';

const STORAGE_KEY = 'quest-respond:admin-key';

export const loadAdminKey = (): string | null => readStorage(STORAGE_KEY);
export const saveAdminKey = (key: string): void => writeStorage(STORAGE_KEY, key);
export const clearAdminKey = (): void => removeStorage(STORAGE_KEY);
