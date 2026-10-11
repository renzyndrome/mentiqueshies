import { describe, expect, it } from 'vitest';
import { buildQrPath } from './qrPath';

describe('buildQrPath', () => {
  it('encodes the public URL into a square module path', () => {
    const qr = buildQrPath('https://mentiqueshie.questlaguna.org');
    expect(qr).not.toBeNull();
    expect(qr?.size).toBeGreaterThanOrEqual(21);
    expect(qr?.d.startsWith('M0 0h1v1h-1z')).toBe(true);
  });

  it('returns null for an empty value', () => {
    expect(buildQrPath('')).toBeNull();
  });
});
