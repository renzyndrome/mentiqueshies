import type { ScreenView, SessionState } from '../../../shared/types';
import { resolveScreenMode } from '../screen/screenMode';
import type { ScreenMode } from '../screen/screenMode';
import { updateSession } from './adminApi';
import { StatusLine } from './StatusLine';
import type { AdminRunner } from './useAdminState';
import { useActionStatus } from './useActionStatus';

const VIEWS: ReadonlyArray<{ readonly view: ScreenView; readonly label: string }> = [
  { view: 'cloud', label: 'Cloud' },
  { view: 'wall', label: 'Wall' },
  { view: 'blank', label: 'Blank screen' },
];

const ON_SCREEN: Readonly<Record<ScreenMode, string>> = {
  join: 'Join view. No question open.',
  cloud: 'Word cloud.',
  wall: 'Wall of answers.',
  blank: 'Black screen.',
};

export function ScreenPanel({ session, run }: { readonly session: SessionState; readonly run: AdminRunner }) {
  const { status, track } = useActionStatus();
  const choose = (screenView: ScreenView) => track(() => run((key) => updateSession(key, { screenView })));

  return (
    <section aria-labelledby="screen-heading" className="admin-card">
      <h2 id="screen-heading" className="font-wordmark text-base leading-[1.3] font-semibold">
        Big screen
      </h2>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Screen view">
        {VIEWS.map(({ view, label }) => {
          const active = session.screenView === view;
          return (
            <button
              key={view}
              type="button"
              aria-pressed={active}
              disabled={status.busy}
              onClick={() => void choose(view)}
              className={`btn-outline flex-1 whitespace-nowrap ${active ? 'btn-solid' : ''}`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-fg-muted">
        <span className="font-semibold text-fg-default">On screen now: </span>
        {ON_SCREEN[resolveScreenMode(session)]}
      </p>
      <a href="/screen" target="_blank" rel="noopener noreferrer" className="btn-outline">
        Open screen
      </a>
      <StatusLine status={status} />
    </section>
  );
}
