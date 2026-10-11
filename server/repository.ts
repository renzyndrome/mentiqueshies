import type { Database } from 'bun:sqlite';
import type { AdminAnswer, QuestionStatus, ScreenView, SessionState } from '../shared/types';

/** Upper bound on stored rows, a guard against scripted floods. */
export const MAX_ROWS = 5_000;

interface SessionRow {
  readonly title: string;
  readonly question_text: string;
  readonly question_status: QuestionStatus;
  readonly screen_view: ScreenView;
  readonly updated_at: string;
}

interface AnswerRow {
  readonly id: number;
  readonly text: string;
  readonly hidden: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export type WriteResult = 'ok' | 'full';

export type SessionFields = Omit<SessionState, 'updatedAt'>;

export interface Repository {
  getSession(): SessionState;
  updateSession(fields: SessionFields): SessionState;
  join(deviceToken: string): WriteResult;
  upsertAnswer(deviceToken: string, text: string): WriteResult;
  listAnswers(options: { readonly includeHidden: boolean }): readonly AdminAnswer[];
  setAnswerHidden(id: number, hidden: boolean): boolean;
  countParticipants(): number;
  countAnswers(): { readonly total: number; readonly hidden: number };
  reset(): void;
}

const toSession = (row: SessionRow): SessionState => ({
  title: row.title,
  questionText: row.question_text,
  questionStatus: row.question_status,
  screenView: row.screen_view,
  updatedAt: row.updated_at,
});

const toAnswer = (row: AnswerRow): AdminAnswer => ({
  id: row.id,
  text: row.text,
  hidden: row.hidden === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function createRepository(db: Database, clock: () => Date): Repository {
  const now = () => clock().toISOString();

  const selectSession = db.query<SessionRow, []>(
    'SELECT title, question_text, question_status, screen_view, updated_at FROM session WHERE id = 1',
  );
  const updateSessionStmt = db.query(
    `UPDATE session SET title = ?, question_text = ?, question_status = ?, screen_view = ?, updated_at = ?
     WHERE id = 1`,
  );
  const insertParticipant = db.query('INSERT OR IGNORE INTO participants (device_token, joined_at) VALUES (?, ?)');
  const participantExists = db.query<{ found: number }, [string]>(
    'SELECT 1 AS found FROM participants WHERE device_token = ?',
  );
  const countParticipantsStmt = db.query<{ total: number }, []>('SELECT COUNT(*) AS total FROM participants');
  const answerExists = db.query<{ found: number }, [string]>('SELECT 1 AS found FROM answers WHERE device_token = ?');
  const upsertAnswerStmt = db.query(
    `INSERT INTO answers (device_token, text, hidden, created_at, updated_at) VALUES (?, ?, 0, ?, ?)
     ON CONFLICT (device_token) DO UPDATE SET text = excluded.text, updated_at = excluded.updated_at`,
  );
  const listAllAnswers = db.query<AnswerRow, []>(
    'SELECT id, text, hidden, created_at, updated_at FROM answers ORDER BY updated_at DESC, id DESC',
  );
  const listVisibleAnswers = db.query<AnswerRow, []>(
    'SELECT id, text, hidden, created_at, updated_at FROM answers WHERE hidden = 0 ORDER BY updated_at DESC, id DESC',
  );
  const setHiddenStmt = db.query('UPDATE answers SET hidden = ? WHERE id = ?');
  const countAnswersStmt = db.query<{ total: number; hidden: number | null }, []>(
    'SELECT COUNT(*) AS total, SUM(hidden) AS hidden FROM answers',
  );
  const deleteAnswers = db.query('DELETE FROM answers');
  const deleteParticipants = db.query('DELETE FROM participants');
  const hideQuestion = db.query("UPDATE session SET question_status = 'hidden', updated_at = ? WHERE id = 1");

  const getSession = (): SessionState => {
    const row = selectSession.get();
    if (!row) throw new Error('Session row missing. Database not migrated.');
    return toSession(row);
  };

  const countParticipants = () => countParticipantsStmt.get()?.total ?? 0;

  const countAnswers = () => {
    const row = countAnswersStmt.get();
    return { total: row?.total ?? 0, hidden: row?.hidden ?? 0 };
  };

  const ensureParticipant = (deviceToken: string): WriteResult => {
    if (participantExists.get(deviceToken)) return 'ok';
    if (countParticipants() >= MAX_ROWS) return 'full';
    insertParticipant.run(deviceToken, now());
    return 'ok';
  };

  const upsertTx = db.transaction((deviceToken: string, text: string): WriteResult => {
    if (!answerExists.get(deviceToken) && countAnswers().total >= MAX_ROWS) return 'full';
    if (ensureParticipant(deviceToken) === 'full') return 'full';
    const stamp = now();
    upsertAnswerStmt.run(deviceToken, text, stamp, stamp);
    return 'ok';
  });

  const resetTx = db.transaction(() => {
    deleteAnswers.run();
    deleteParticipants.run();
    hideQuestion.run(now());
  });

  return {
    getSession,
    updateSession(fields) {
      updateSessionStmt.run(fields.title, fields.questionText, fields.questionStatus, fields.screenView, now());
      return getSession();
    },
    join: ensureParticipant,
    upsertAnswer: (deviceToken, text) => upsertTx(deviceToken, text),
    listAnswers({ includeHidden }) {
      const rows = includeHidden ? listAllAnswers.all() : listVisibleAnswers.all();
      return rows.map(toAnswer);
    },
    setAnswerHidden(id, hidden) {
      const result = setHiddenStmt.run(hidden ? 1 : 0, id);
      return result.changes > 0;
    },
    countParticipants,
    countAnswers,
    reset: () => resetTx(),
  };
}
