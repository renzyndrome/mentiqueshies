import { Check } from 'lucide-react';
import type { MouseEvent } from 'react';
import { AppMark } from '../../components/AppMark';

export interface SentViewProps {
  /** What this phone sent last, or null when nothing was sent. */
  readonly text: string | null;
  readonly closed: boolean;
  readonly onChangeAnswer: () => void;
}

const EDIT_HREF = '/answer?edit=true';

/** Phone Sent (Sent.dc.html). Also the closed state of the question. */
export function SentView({ text, closed, onChangeAnswer }: SentViewProps) {
  const handleChange = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onChangeAnswer();
  };

  return (
    <div data-theme="dark" className="min-h-dvh bg-[linear-gradient(180deg,#2E0408_0%,#0B0B0C_100%)] text-white">
      <main className="phone-shell items-center text-center">
        <div className="self-start">
          <AppMark />
        </div>

        <div className="mt-[120px] flex size-[88px] items-center justify-center rounded-full bg-red-500 shadow-red-glow">
          <Check aria-hidden="true" size={40} strokeWidth={2.5} color="#ffffff" />
        </div>

        {closed ? (
          <h1 className="mt-8 font-wordmark text-[32px] leading-[1.2] font-semibold tracking-[-0.015em] text-white">
            Salamat. The question is closed.
          </h1>
        ) : (
          <>
            <div className="eyebrow mt-8 justify-center">Salamat.</div>
            <h1 className="mt-4 font-wordmark text-[32px] leading-[1.2] font-semibold tracking-[-0.015em] text-white">
              Your answer is on the screen.
            </h1>
          </>
        )}

        {text ? (
          <div className="mt-9 w-full rounded-lg border border-white/10 bg-white/[0.06] px-[22px] py-5 text-left">
            <div className="chip-label text-red-300">You wrote</div>
            <div className="mt-2.5 font-wordmark text-lg leading-[1.4] font-semibold break-words text-white">
              {`"${text}"`}
            </div>
          </div>
        ) : null}

        <div className="mt-auto flex w-full flex-col items-center gap-2.5 pt-10">
          <div className="flex items-center justify-center gap-2.5 text-sm leading-none font-medium text-fg-muted">
            <span aria-hidden="true" className="size-2 rounded-full bg-gold-500" />
            Waiting for the next question
          </div>
          {closed ? null : (
            <a href={EDIT_HREF} onClick={handleChange} className="text-link inline-flex min-h-11 items-center">
              Change my answer
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
