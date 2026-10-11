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

function migrate(db: Database): void {
  db.exec(SCHEMA);
  db.query(
    `INSERT OR IGNORE INTO session (id, title, question_text, question_status, screen_view, updated_at)
     VALUES (1, ?, '', 'hidden', 'cloud', ?)`,
  ).run(DEFAULT_TITLE, new Date().toISOString());
}

/** Opens (or creates) the SQLite file and applies the schema. Pass ':memory:' for tests. */
export function openDatabase(path: string): Database {
  const db = new Database(path, { create: true, strict: true });
  if (path !== ':memory:') db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA busy_timeout = 5000;');
  migrate(db);
  return db;
}
