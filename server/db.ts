import { Database } from 'bun:sqlite';

export const DEFAULT_TITLE = 'Sunday Family Service';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS session (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  title TEXT NOT NULL,
  question_text TEXT NOT NULL DEFAULT '',
  question_status TEXT NOT NULL DEFAULT 'hidden' CHECK (question_status IN ('hidden', 'open', 'closed')),
  screen_view TEXT NOT NULL DEFAULT 'cloud' CHECK (screen_view IN ('cloud', 'wall', 'blank')),
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_token TEXT NOT NULL UNIQUE,
  text TEXT NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0 CHECK (hidden IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS answers_updated_at ON answers (updated_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS participants (
  device_token TEXT PRIMARY KEY,
  joined_at TEXT NOT NULL
);
`;

interface AddedColumn {
  readonly name: string;
  readonly definition: string;
}

// Session columns added after v0. New and existing databases both get them through ALTER TABLE,
// so a production file from v0 upgrades in place. Constants only: never build these from input.
const ADDED_SESSION_COLUMNS: readonly AddedColumn[] = [
  { name: 'question_number', definition: 'INTEGER NOT NULL DEFAULT 1' },
  { name: 'opened_text', definition: "TEXT NOT NULL DEFAULT ''" },
];

function addMissingSessionColumns(db: Database): void {
  const existing = new Set(
    db
      .query<{ name: string }, []>('PRAGMA table_info(session)')
      .all()
      .map((column) => column.name),
  );
  for (const column of ADDED_SESSION_COLUMNS) {
    if (!existing.has(column.name)) db.exec(`ALTER TABLE session ADD COLUMN ${column.name} ${column.definition}`);
  }
  // A v0 file keeps its answers: the question on file counts as the last opened one.
  if (!existing.has('opened_text')) {
    db.exec("UPDATE session SET opened_text = question_text WHERE question_status <> 'hidden'");
  }
}

/** Creates missing tables and columns and the single session row. Safe to run on every start. */
export function migrate(db: Database): void {
  // IMMEDIATE takes the write lock up front, so a second process waits on busy_timeout instead of failing.
  db.transaction(() => {
    db.exec(SCHEMA);
    addMissingSessionColumns(db);
    db.query(
      `INSERT OR IGNORE INTO session (id, title, question_text, question_status, screen_view, updated_at)
       VALUES (1, ?, '', 'hidden', 'cloud', ?)`,
    ).run(DEFAULT_TITLE, new Date().toISOString());
  }).immediate();
}

/** Opens (or creates) the SQLite file and applies the schema. Pass ':memory:' for tests. */
export function openDatabase(path: string): Database {
  const db = new Database(path, { create: true, strict: true });
  if (path !== ':memory:') db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA busy_timeout = 5000;');
  migrate(db);
  return db;
}
