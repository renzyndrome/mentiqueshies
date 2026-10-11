import { Eyebrow } from '../../components/Eyebrow';
import { PhoneTopBar } from './PhoneTopBar';

/** Shown on /answer before the media team opens the question. */
export function WaitingView({ title }: { readonly title: string }) {
  return (
    <main className="phone-shell bg-white">
      <PhoneTopBar live={false} />
      <Eyebrow className="mt-7 min-h-3">{title}</Eyebrow>
      <h1 className="mt-[18px] font-wordmark text-[28px] leading-[1.25] font-semibold tracking-[-0.01em] text-fg-default">
        The question opens after the message.
      </h1>
      <p className="mt-3 text-[15px] leading-[1.6] text-fg-muted">Keep this page open. It updates on its own.</p>
      <div className="mt-auto flex items-center justify-center gap-2.5 pt-10 text-sm leading-none font-medium text-fg-faint">
        <span aria-hidden="true" className="size-2 rounded-full bg-gold-500" />
        Waiting for the question
      </div>
    </main>
  );
}
