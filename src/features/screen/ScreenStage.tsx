import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;

const fitScale = () =>
  typeof window === 'undefined'
    ? 1
    : Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT);

function useStageScale(): number {
  const [scale, setScale] = useState(fitScale);
  useEffect(() => {
    const onResize = () => setScale(fitScale());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return scale;
}

/** Renders the 1920x1080 artboard and scales it to fit any projector, letterboxed in black. */
export function ScreenStage({ children }: { readonly children: ReactNode }) {
  const scale = useStageScale();
  return (
    <div data-theme="dark" className="fixed inset-0 cursor-none overflow-hidden bg-ink-1000">
      <div
        className="absolute top-1/2 left-1/2 overflow-hidden"
        style={{
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>
    </div>
  );
}
