import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import * as schema from './schema';

const dbPath = resolve(process.env.DATABASE_URL ?? './data/studio-kanban.db');
mkdirSync(dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

export function initDb(): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
      updated_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS columns (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#6B7280',
      "order" INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
      updated_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      song_id TEXT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
      column_id TEXT NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      assignee TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
      updated_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      "order" INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL
    );
  `);
}
