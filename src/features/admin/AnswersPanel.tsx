import type { AdminState } from '../../../shared/types';
import { setAnswerHidden } from './adminApi';
import { StatusLine } from './StatusLine';
import type { AdminRunner } from './useAdminState';
import { useActionStatus } from './useActionStatus';

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

const formatTime = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : timeFormat.format(date);
};

interface AnswersPanelProps {
  readonly answers: AdminState['answers'];
  readonly counts: AdminState['counts'];
  readonly run: AdminRunner;
}

export function AnswersPanel({ answers, counts, run }: AnswersPanelProps) {
  const { status, track } = useActionStatus();
  const toggle = (id: number, hidden: boolean) => track(() => run((key) => setAnswerHidden(key, id, hidden)));

  return (
    <section aria-labelledby="answers-heading" className="admin-card">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="answers-heading" className="font-wordmark text-lg leading-[1.3] font-semibold">
          Answers
        </h2>
        <span className="text-[13px] font-semibold text-fg-muted">
          {counts.answers} total {'·'} {counts.hidden} hidden {'·'} {counts.joined} joined
        </span>
      </div>
      <StatusLine status={status} />
      {answers.length === 0 ? (
        <p className="text-sm text-fg-faint">No answers yet.</p>
      ) : (
        <ul className="flex max-h-[640px] flex-col divide-y divide-line overflow-y-auto">
          {answers.map((answer) => (
            <li key={answer.id} className="flex items-start justify-between gap-4 py-3">
              <div className="flex min-w-0 flex-col gap-1">
                <p className={`break-words ${answer.hidden ? 'text-fg-faint line-through' : 'text-fg-default'}`}>
                  {answer.text}
                </p>
                <span className="text-xs text-fg-faint">
                  {formatTime(answer.updatedAt)}
                  {answer.hidden ? ` · Hidden` : ''}
                </span>
              </div>
              <button
                type="button"
                className="btn-outline min-h-10 shrink-0"
                disabled={status.busy}
                onClick={() => void toggle(answer.id, !answer.hidden)}
              >
                {answer.hidden ? 'Show' : 'Hide'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
