import { Lock } from 'lucide-react';
import { Eyebrow } from '../../components/Eyebrow';
import { Lockup } from '../../components/Lockup';

export interface JoinViewProps {
  readonly title: string;
  readonly host: string;
  readonly joining: boolean;
  readonly error: string | null;
  readonly onJoin: () => void;
}

/** Phone Join (Main.dc.html without the name and location fields). */
export function JoinView({ title, host, joining, error, onJoin }: JoinViewProps) {
  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#FBF5E9_0%,#ffffff_55%)]">
      <main className="phone-shell pt-16">
        <Lockup />

        <Eyebrow className="mt-12 min-h-3">{title}</Eyebrow>
        <h1 className="mt-[22px] font-wordmark text-[36px] leading-[1.15] font-semibold tracking-[-0.015em] text-fg-default">
          Welcome home.
        </h1>
        <p className="mt-3.5 text-base leading-[1.65] text-fg-muted">
          One question. Your answer goes on the big screen.
        </p>

        <button type="button" className="btn-primary mt-9" onClick={onJoin} disabled={joining} aria-busy={joining}>
          Join today&apos;s question
        </button>
        {error ? (
          <p role="alert" className="mt-3 text-center text-sm font-semibold text-brand-text">
            {error}
          </p>
        ) : null}

        <footer className="mt-auto flex flex-col gap-3 pt-12">
          <div className="flex items-center gap-2.5 text-[13px] leading-[1.4] font-medium text-fg-faint">
            <Lock aria-hidden="true" size={18} strokeWidth={2} color="#8E0E1E" className="shrink-0" />
            <span>No name. No login.</span>
          </div>
          <div className="text-[13px] leading-[1.4] font-medium text-fg-faint">{host}</div>
        </footer>
      </main>
    </div>
  );
}
