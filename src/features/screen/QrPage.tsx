import { useEffect, useState } from 'react';
import type { PublicState } from '../../../shared/types';
import { Eyebrow } from '../../components/Eyebrow';
import { Lockup } from '../../components/Lockup';
import { fetchPublicState } from '../../lib/api';
import { publicHost } from '../../lib/publicHost';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { answerUrl } from './answerUrl';
import { QrCode } from './QrCode';

const QR_MAX = 560;
const QR_MIN = 200;

/** Fits the QR to the window so the address below it stays in view. */
function qrSize(): number {
  const fit = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.55);
  return Math.max(QR_MIN, Math.min(QR_MAX, Math.floor(fit)));
}

/** Public page with one big QR to the phone answer page. Any computer can show it. */
export function QrPage() {
  useDocumentTitle('QR code | Quest Respond');
  const [state, setState] = useState<PublicState | null>(null);

  useEffect(() => {
    let active = true;
    void fetchPublicState(false).then((next) => {
      if (active && next) setState(next);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!state) {
    return (
      <main className="fixed inset-0 flex items-center justify-center bg-cream-50">
        <p className="text-sm text-fg-faint">Loading.</p>
      </main>
    );
  }

  const target = answerUrl(state.publicUrl);

  return (
    <main
      data-theme="light"
      className="fixed inset-0 flex flex-col items-center justify-center gap-8 overflow-auto bg-cream-50 px-6 py-12 text-center"
    >
      <Lockup />
      <Eyebrow chevrons>{state.session.title}</Eyebrow>
      <div className="rounded-2xl bg-white p-6 shadow-pop">
        <QrCode value={target} size={qrSize()} />
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="text-base leading-none font-bold tracking-[0.2em] text-red-700 uppercase">Or go to</div>
        <div className="font-wordmark text-[28px] leading-none font-semibold tracking-[0.02em] text-ink-800">
          {publicHost(state.publicUrl)}/answer
        </div>
      </div>
    </main>
  );
}
