"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initDb = initDb;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const better_sqlite3_2 = require("drizzle-orm/better-sqlite3");
const fs_1 = require("fs");
const path_1 = require("path");
const schema = __importStar(require("./schema"));
const dbPath = (0, path_1.resolve)(process.env.DATABASE_URL ?? './data/studio-kanban.db');
(0, fs_1.mkdirSync)((0, path_1.dirname)(dbPath), { recursive: true });
const sqlite = new better_sqlite3_1.default(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
exports.db = (0, better_sqlite3_2.drizzle)(sqlite, { schema });
function initDb() {
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
