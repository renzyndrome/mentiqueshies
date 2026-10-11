import { Database } from 'bun:sqlite';
import { describe, expect, it } from 'vitest';
import { migrate, openDatabase } from './db';
import { createRepository, toSessionFields } from './repository';

// The session, answers and participants tables as v0 shipped them, before question numbers.
const V0_SCHEMA = `
CREATE TABLE session (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  title TEXT NOT NULL,
  question_text TEXT NOT NULL DEFAULT '',
  question_status TEXT NOT NULL DEFAULT 'hidden' CHECK (question_status IN ('hidden', 'open', 'closed')),
  screen_view TEXT NOT NULL DEFAULT 'cloud' CHECK (screen_view IN ('cloud', 'wall', 'blank')),
  updated_at TEXT NOT NULL
);
CREATE TABLE answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_token TEXT NOT NULL UNIQUE,
  text TEXT NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0 CHECK (hidden IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE participants (
  device_token TEXT PRIMARY KEY,
  joined_at TEXT NOT NULL
);
`;

const STAMP = '2026-10-04T10:00:00.000Z';
const OLD_QUESTION = 'What is one promise you are holding on to?';

function createV0Database(): Database {
  const db = new Database(':memory:');
  db.exec(V0_SCHEMA);
  db.query(
    `INSERT INTO session (id, title, question_text, question_status, screen_view, updated_at)
     VALUES (1, 'Sunday Family Service', ?, 'closed', 'wall', ?)`,
  ).run(OLD_QUESTION, STAMP);
  db.query(
    `INSERT INTO answers (device_token, text, hidden, created_at, updated_at)
     VALUES ('device-token-0001-abcdef', 'Faithful', 0, ?, ?)`,
  ).run(STAMP, STAMP);
  db.query("INSERT INTO participants (device_token, joined_at) VALUES ('device-token-0001-abcdef', ?)").run(STAMP);
  return db;
}

const sessionColumns = (db: Database) =>
  db
    .query<{ name: string }, []>('PRAGMA table_info(session)')
    .all()
    .map((column) => column.name);

const clock = () => new Date(STAMP);

describe('migrate', () => {
  it('adds question_number and opened_text to a v0 database in place', () => {
    const db = createV0Database();
    expect(sessionColumns(db)).not.toContain('question_number');
    expect(sessionColumns(db)).not.toContain('opened_text');

    migrate(db);

    expect(sessionColumns(db)).toEqual(expect.arrayContaining(['question_number', 'opened_text']));
    const repo = createRepository(db, clock);
    expect(repo.getSession()).toMatchObject({
      title: 'Sunday Family Service',
      questionText: OLD_QUESTION,
      questionStatus: 'closed',
      screenView: 'wall',
      questionNumber: 1,
    });
    expect(db.query('SELECT opened_text FROM session WHERE id = 1').get()).toEqual({ opened_text: OLD_QUESTION });
    expect(repo.countAnswers().total).toBe(1);
    expect(repo.countParticipants()).toBe(1);
  });

  it('runs again on a migrated database without changes', () => {
    const db = createV0Database();
    migrate(db);
    migrate(db);
    const columns = sessionColumns(db);
    expect(columns.filter((name) => name === 'question_number')).toHaveLength(1);
    expect(columns.filter((name) => name === 'opened_text')).toHaveLength(1);
    expect(createRepository(db, clock).getSession().questionNumber).toBe(1);
  });

  it('gives a new database the new columns', () => {
    const db = openDatabase(':memory:');
    expect(sessionColumns(db)).toEqual(expect.arrayContaining(['question_number', 'opened_text']));
    expect(createRepository(db, clock).getSession().questionNumber).toBe(1);
  });

  it('keeps answers from before the upgrade when the same question reopens', () => {
    const db = createV0Database();
    migrate(db);
    const repo = createRepository(db, clock);

    const reopened = repo.updateSession({ ...toSessionFields(repo.getSession()), questionStatus: 'open' });
    expect(reopened.questionNumber).toBe(1);
    expect(repo.countAnswers().total).toBe(1);

    repo.updateSession({ ...toSessionFields(repo.getSession()), questionStatus: 'closed' });
    const next = repo.updateSession({
      ...toSessionFields(repo.getSession()),
      questionText: 'Who will you pray for this week?',
      questionStatus: 'open',
    });
    expect(next.questionNumber).toBe(2);
    expect(repo.countAnswers().total).toBe(0);
    expect(repo.countParticipants()).toBe(1);
  });
});
