import { Eyebrow } from '../../components/Eyebrow';
import { AdminSidebar } from './AdminSidebar';
import { AnswersPanel } from './AnswersPanel';
import { QuestionPanel } from './QuestionPanel';
import { ResetPanel } from './ResetPanel';
import { ScreenPanel } from './ScreenPanel';
import { SharePanel } from './SharePanel';
import { useAdminState } from './useAdminState';

interface AdminDashboardProps {
  readonly adminKey: string;
  readonly onSignOut: () => void;
  readonly onUnauthorized: () => void;
}

export function AdminDashboard({ adminKey, onSignOut, onUnauthorized }: AdminDashboardProps) {
  const { state, loadError, connected, run } = useAdminState(adminKey, onUnauthorized);
  const isOpen = state?.session.questionStatus === 'open';

  return (
    <div className="flex min-h-dvh flex-col bg-cream-50 md:flex-row">
      <AdminSidebar onSignOut={onSignOut} />

      <main className="flex min-w-0 flex-1 flex-col gap-6 px-4 py-8 sm:px-10 sm:py-9">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2.5">
            <Eyebrow chevrons={false}>Presenter</Eyebrow>
            <h1 className="font-wordmark text-[32px] leading-[1.15] font-semibold tracking-[-0.01em]">
              {state?.session.title ?? 'Quest Respond'}
            </h1>
          </div>
          {state ? (
            <div className="flex flex-col items-end gap-1.5">
              <span
                className={`chip-label inline-flex items-center gap-2 rounded-pill px-4 py-2.5 tracking-[0.08em] ${
                  isOpen ? 'bg-red-100 text-red-700' : 'bg-white text-ink-700'
                }`}
              >
                <span aria-hidden="true" className={`size-2 rounded-full ${isOpen ? 'bg-red-500' : 'bg-ink-300'}`} />
                {isOpen ? 'Live · ' : ''}
                {state.counts.joined} joined
              </span>
              {connected ? null : <span className="text-xs font-semibold text-fg-faint">Live updates reconnecting.</span>}
            </div>
          ) : null}
        </header>

        {state ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="flex min-w-0 flex-col gap-5">
              <QuestionPanel session={state.session} run={run} />
              <AnswersPanel answers={state.answers} counts={state.counts} run={run} />
            </div>
            <div className="flex min-w-0 flex-col gap-5">
              <ScreenPanel session={state.session} run={run} />
              <SharePanel publicUrl={state.publicUrl} />
              <ResetPanel run={run} />
            </div>
          </div>
        ) : loadError ? (
          <p role="alert" className="text-sm font-semibold text-brand-text">
            {loadError}
          </p>
        ) : (
          <p className="text-sm text-fg-faint">Loading.</p>
        )}
      </main>
    </div>
  );
}
