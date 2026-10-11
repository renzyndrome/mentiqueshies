import { Eyebrow } from '../../components/Eyebrow';
import { Lockup } from '../../components/Lockup';
import { QrCode } from './QrCode';

interface ScreenJoinViewProps {
  readonly joined: number;
  readonly publicUrl: string;
  readonly host: string;
}

/** Big screen Join (ScreenJoin.dc.html). Real QR to the site root, site address instead of a code. */
export function ScreenJoinView({ joined, publicUrl, host }: ScreenJoinViewProps) {
  return (
    <div
      className="flex size-full items-center gap-24 px-[120px] py-24"
      style={{ background: 'radial-gradient(60% 60% at 30% 40%, rgba(216,30,47,.55) 0%, #0B0B0C 75%)' }}
    >
      <div className="flex flex-1 flex-col">
        <Lockup size="screen" />
        <Eyebrow size="screen" className="mt-24">
          Before you go
        </Eyebrow>
        <h1 className="mt-7 font-display text-[150px] leading-[0.95] tracking-[-0.01em] text-white uppercase">
          Scan.
          <br />
          Answer.
          <br />
          Watch.
        </h1>
        <p className="mt-9 max-w-[640px] text-[28px] leading-[1.5] text-fg-muted">
          One question after the message. Your answers show up here, together.
        </p>
        <div className="mt-16 flex items-center gap-3">
          <span aria-hidden="true" className="size-3.5 rounded-full bg-gold-500" />
          <span className="font-wordmark text-[26px] leading-none font-semibold text-white">{joined}</span>
          <span className="text-[22px] leading-none font-medium text-fg-muted">joined so far</span>
        </div>
      </div>

      <div data-theme="light" className="flex flex-col items-center gap-8 rounded-2xl bg-cream-50 p-14 shadow-pop">
        <QrCode value={publicUrl} size={440} />
        <div className="flex flex-col items-center gap-3">
          <div className="text-base leading-none font-bold tracking-[0.2em] text-red-700 uppercase">Or go to</div>
          <div className="font-wordmark text-[30px] leading-none font-semibold tracking-[0.02em] text-ink-800">
            {host}
          </div>
        </div>
      </div>
    </div>
  );
}
