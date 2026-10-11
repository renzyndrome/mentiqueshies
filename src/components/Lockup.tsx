import { LogoMark } from './LogoMark';

const SIZES = {
  phone: { logo: 38, gap: 12, word: 17, sub: 10, stack: 3 },
  screen: { logo: 56, gap: 16, word: 24, sub: 13, stack: 4 },
} as const;

interface LockupProps {
  readonly size?: keyof typeof SIZES;
  /** Second line under "Quest". */
  readonly sub?: string;
}

/** Logo disc plus the "Quest / LAGUNA" wordmark. Colours follow the surrounding theme. */
export function Lockup({ size = 'phone', sub = 'LAGUNA' }: LockupProps) {
  const s = SIZES[size];
  return (
    <div className="flex items-center" style={{ gap: s.gap }}>
      <LogoMark size={s.logo} />
      <div className="flex flex-col" style={{ gap: s.stack }}>
        <div className="font-wordmark font-semibold leading-none text-fg-default" style={{ fontSize: s.word }}>
          Quest
        </div>
        <div
          className="font-wordmark font-semibold leading-none tracking-[0.26em] text-brand-text"
          style={{ fontSize: s.sub }}
        >
          {sub}
        </div>
      </div>
    </div>
  );
}
