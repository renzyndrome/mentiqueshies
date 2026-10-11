import { LogoMark } from './LogoMark';

const SIZES = {
  phone: { logo: 30, gap: 10, text: 14 },
  screen: { logo: 36, gap: 12, text: 18 },
} as const;

/** Logo disc plus "Quest Respond". */
export function AppMark({ size = 'phone' }: { readonly size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <div className="flex items-center" style={{ gap: s.gap }}>
      <LogoMark size={s.logo} />
      <span className="font-wordmark font-semibold leading-none text-fg-default" style={{ fontSize: s.text }}>
        Quest Respond
      </span>
    </div>
  );
}
