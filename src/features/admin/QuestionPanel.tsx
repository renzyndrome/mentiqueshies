import { useEffect, useState } from 'react';
import { MAX_QUESTION_LENGTH, MAX_TITLE_LENGTH } from '../../../shared/limits';
import { charLength } from '../../../shared/text';
import type { QuestionStatus, SessionState } from '../../../shared/types';
import { updateSession } from './adminApi';
import { StatusLine } from './StatusLine';
import type { AdminRunner } from './useAdminState';
import { useActionStatus } from './useActionStatus';

const STATUS_TEXT: Readonly<Record<QuestionStatus, string>> = {
  hidden: 'Not open yet.',
  open: 'Open. Phones can answer.',
  closed: 'Closed. Answers locked.',
};

interface Draft {
  readonly title: string;
  readonly questionText: string;
  readonly dirty: boolean;
}

export function QuestionPanel({ session, run }: { readonly session: SessionState; readonly run: AdminRunner }) {
  const [draft, setDraft] = useState<Draft>({ title: session.title, questionText: session.questionText, dirty: false });
  const { status, track } = useActionStatus();

  // Follow server changes (another admin, a reset) unless there are unsaved edits.
  useEffect(() => {
    setDraft((current) =>
      current.dirty ? current : { title: session.title, questionText: session.questionText, dirty: false },
    );
  }, [session.title, session.questionText]);

  const edit = (field: 'title' | 'questionText', value: string) =>
    setDraft((current) => ({ ...current, [field]: value, dirty: true }));

  const titleMissing = draft.title.trim().length === 0;
  const questionMissing = draft.questionText.trim().length === 0;
  const isOpen = session.questionStatus === 'open';

  const save = (extra: { questionStatus?: QuestionStatus }, doneMessage: string) =>
    track(
      () => run((key) => updateSession(key, { title: draft.title, questionText: draft.questionText, ...extra })),
      doneMessage,
    ).then((saved) => {
      if (saved) setDraft((current) => ({ ...current, dirty: false }));
    });

  const close = () => track(() => run((key) => updateSession(key, { questionStatus: 'closed' })), 'Question closed.');

  return (
    <section aria-labelledby="question-heading" className="admin-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="question-heading" className="font-wordmark text-lg leading-[1.3] font-semibold">
          Service and question
        </h2>
        <span
          className={`chip-label rounded-pill px-3 py-2 ${isOpen ? 'bg-red-100 text-red-700' : 'bg-cream-50 text-ink-700'}`}
        >
          {session.questionStatus}
        </span>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-[13px] leading-none font-semibold">Service title</span>
        <input
          type="text"
          value={draft.title}
          maxLength={MAX_TITLE_LENGTH}
          onChange={(event) => edit('title', event.target.value)}
          className="field h-[52px]"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="flex justify-between text-[13px] leading-none font-semibold">
          <span>Question</span>
          <span className="font-medium text-fg-faint">
            {charLength(draft.questionText)} / {MAX_QUESTION_LENGTH}
          </span>
        </span>
        <textarea
          value={draft.questionText}
          maxLength={MAX_QUESTION_LENGTH}
          rows={3}
          onChange={(event) => edit('questionText', event.target.value)}
          className="field resize-y"
        />
      </label>

      <p className="text-sm text-fg-muted">{STATUS_TEXT[session.questionStatus]}</p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-outline btn-solid"
          disabled={status.busy || isOpen || questionMissing || titleMissing}
          onClick={() => void save({ questionStatus: 'open' }, 'Question open.')}
        >
          Open question
        </button>
        <button type="button" className="btn-outline" disabled={status.busy || !isOpen} onClick={() => void close()}>
          Close question
        </button>
        <button
          type="button"
          className="btn-outline"
          disabled={status.busy || !draft.dirty || titleMissing}
          onClick={() => void save({}, 'Saved.')}
        >
          Save changes
        </button>
      </div>
      {draft.dirty ? <p className="text-sm text-fg-faint">Unsaved changes.</p> : null}
      <StatusLine status={status} />
    </section>
  );
}
