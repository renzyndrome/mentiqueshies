import type { ReactNode } from 'react';

const SIZES = {
  phone: { text: 12, chevrons: 14, gap: 10 },
  screen: { text: 20, chevrons: 24, gap: 14 },
  'screen-sm': { text: 18, chevrons: 22, gap: 14 },
} as const;

interface EyebrowProps {
  readonly children: ReactNode;
  readonly chevrons?: boolean;
  readonly size?: keyof typeof SIZES;
  readonly className?: string;
}

/** Uppercase section label in brand-text, optionally opened with the brand chevrons. */
export function Eyebrow({ children, chevrons = true, size = 'phone', className = '' }: EyebrowProps) {
  const s = SIZES[size];
  return (
    <div className={`eyebrow ${className}`} style={{ fontSize: s.text, gap: s.gap }}>
      {chevrons ? (
        <span aria-hidden="true" className="eyebrow-chevrons" style={{ fontSize: s.chevrons }}>
          {'›››'}
        </span>
      ) : null}
      <span>{children}</span>
    </div>
  );
}
