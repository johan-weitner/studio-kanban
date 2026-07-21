"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subtasks = exports.tasks = exports.songs = exports.columns = exports.projects = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.projects = (0, sqlite_core_1.sqliteTable)('projects', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: (0, sqlite_core_1.text)('name').notNull(),
    description: (0, sqlite_core_1.text)('description'),
    createdAt: (0, sqlite_core_1.text)('created_at').notNull().default((0, drizzle_orm_1.sql) `(CURRENT_TIMESTAMP)`),
    updatedAt: (0, sqlite_core_1.text)('updated_at').notNull().default((0, drizzle_orm_1.sql) `(CURRENT_TIMESTAMP)`),
});
exports.columns = (0, sqlite_core_1.sqliteTable)('columns', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    projectId: (0, sqlite_core_1.text)('project_id').notNull().references(() => exports.projects.id, { onDelete: 'cascade' }),
    name: (0, sqlite_core_1.text)('name').notNull(),
    color: (0, sqlite_core_1.text)('color').default('#6B7280'),
    order: (0, sqlite_core_1.integer)('order').notNull().default(0),
    createdAt: (0, sqlite_core_1.text)('created_at').notNull().default((0, drizzle_orm_1.sql) `(CURRENT_TIMESTAMP)`),
});
exports.songs = (0, sqlite_core_1.sqliteTable)('songs', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    projectId: (0, sqlite_core_1.text)('project_id').notNull().references(() => exports.projects.id, { onDelete: 'cascade' }),
    title: (0, sqlite_core_1.text)('title').notNull(),
    description: (0, sqlite_core_1.text)('description'),
    order: (0, sqlite_core_1.integer)('order').notNull().default(0),
    createdAt: (0, sqlite_core_1.text)('created_at').notNull().default((0, drizzle_orm_1.sql) `(CURRENT_TIMESTAMP)`),
    updatedAt: (0, sqlite_core_1.text)('updated_at').notNull().default((0, drizzle_orm_1.sql) `(CURRENT_TIMESTAMP)`),
});
exports.tasks = (0, sqlite_core_1.sqliteTable)('tasks', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    songId: (0, sqlite_core_1.text)('song_id').notNull().references(() => exports.songs.id, { onDelete: 'cascade' }),
    columnId: (0, sqlite_core_1.text)('column_id').notNull().references(() => exports.columns.id, { onDelete: 'cascade' }),
    title: (0, sqlite_core_1.text)('title').notNull(),
    description: (0, sqlite_core_1.text)('description'),
    assignee: (0, sqlite_core_1.text)('assignee'),
    order: (0, sqlite_core_1.integer)('order').notNull().default(0),
    createdAt: (0, sqlite_core_1.text)('created_at').notNull().default((0, drizzle_orm_1.sql) `(CURRENT_TIMESTAMP)`),
    updatedAt: (0, sqlite_core_1.text)('updated_at').notNull().default((0, drizzle_orm_1.sql) `(CURRENT_TIMESTAMP)`),
});
exports.subtasks = (0, sqlite_core_1.sqliteTable)('subtasks', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    taskId: (0, sqlite_core_1.text)('task_id').notNull().references(() => exports.tasks.id, { onDelete: 'cascade' }),
    title: (0, sqlite_core_1.text)('title').notNull(),
    completed: (0, sqlite_core_1.integer)('completed', { mode: 'boolean' }).notNull().default(false),
    order: (0, sqlite_core_1.integer)('order').notNull().default(0),
    createdAt: (0, sqlite_core_1.text)('created_at').notNull().default((0, drizzle_orm_1.sql) `(CURRENT_TIMESTAMP)`),
});
