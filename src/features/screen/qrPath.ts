import { create } from 'qrcode';

export interface QrPath {
  /** Modules per side. */
  readonly size: number;
  /** SVG path data, one unit square per dark module. */
  readonly d: string;
}

export function buildQrPath(value: string): QrPath | null {
  if (value.length === 0) return null;
  try {
    const { size, data } = create(value, { errorCorrectionLevel: 'M' }).modules;
    const squares = Array.from(data, (dark, index) =>
      dark ? `M${index % size} ${Math.floor(index / size)}h1v1h-1z` : '',
    );
    return { size, d: squares.join('') };
  } catch (error) {
    console.error('[qr] could not encode', error);
    return null;
  }
}
