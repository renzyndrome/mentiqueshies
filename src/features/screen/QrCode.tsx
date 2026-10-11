import { useMemo } from 'react';
import { buildQrPath } from './qrPath';

const QUIET_ZONE = 2;

/** QR code as an inline SVG on a white card. No innerHTML. */
export function QrCode({ value, size }: { readonly value: string; readonly size: number }) {
  const qr = useMemo(() => buildQrPath(value), [value]);
  const box = { width: size, height: size };

  if (!qr) return <div className="rounded-md bg-white" style={box} />;

  const extent = qr.size + QUIET_ZONE * 2;
  return (
    <svg
      role="img"
      aria-label={`QR code for ${value}`}
      width={size}
      height={size}
      viewBox={`${-QUIET_ZONE} ${-QUIET_ZONE} ${extent} ${extent}`}
      shapeRendering="crispEdges"
      className="box-border rounded-md bg-white p-3"
      style={box}
    >
      <path d={qr.d} fill="#141315" />
    </svg>
  );
}
