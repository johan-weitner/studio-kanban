"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.songsRouter = void 0;
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const index_1 = require("../db/index");
const schema_1 = require("../db/schema");
const songs_1 = require("../schemas/songs");
const tasks_1 = require("../schemas/tasks");
const schema_2 = require("../db/schema");
exports.songsRouter = (0, express_1.Router)();
// PUT /api/songs/:id
exports.songsRouter.put('/:id', async (req, res) => {
    const parsed = songs_1.UpdateSongSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    try {
        const [updated] = await index_1.db
            .update(schema_1.songs)
            .set({ ...parsed.data, updatedAt: new Date().toISOString() })
            .where((0, drizzle_orm_1.eq)(schema_1.songs.id, req.params.id))
            .returning();
        if (!updated) {
            res.status(404).json({ error: 'Song not found' });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /api/songs/:id
exports.songsRouter.delete('/:id', async (req, res) => {
    try {
        const deleted = await index_1.db.delete(schema_1.songs).where((0, drizzle_orm_1.eq)(schema_1.songs.id, req.params.id)).returning();
        if (!deleted.length) {
            res.status(404).json({ error: 'Song not found' });
            return;
        }
        res.status(204).send();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/songs/:songId/tasks (with subtasks)
exports.songsRouter.get('/:songId/tasks', async (req, res) => {
    try {
        const taskList = await index_1.db.select().from(schema_1.tasks).where((0, drizzle_orm_1.eq)(schema_1.tasks.songId, req.params.songId));
        const taskIds = taskList.map((t) => t.id);
        const subtaskList = taskIds.length > 0
            ? await index_1.db.select().from(schema_1.subtasks).where((0, drizzle_orm_1.inArray)(schema_1.subtasks.taskId, taskIds))
            : [];
        const result = taskList.map((task) => ({
            ...task,
            subtasks: subtaskList.filter((st) => st.taskId === task.id),
        }));
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/songs/:songId/tasks
exports.songsRouter.post('/:songId/tasks', async (req, res) => {
    const parsed = tasks_1.CreateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    try {
        const [song] = await index_1.db.select().from(schema_1.songs).where((0, drizzle_orm_1.eq)(schema_1.songs.id, req.params.songId));
        if (!song) {
            res.status(404).json({ error: 'Song not found' });
            return;
        }
        const [column] = await index_1.db.select().from(schema_2.columns).where((0, drizzle_orm_1.eq)(schema_2.columns.id, parsed.data.columnId));
        if (!column) {
            res.status(404).json({ error: 'Column not found' });
            return;
        }
        if (column.projectId !== song.projectId) {
            res.status(400).json({ error: 'Column does not belong to the same project as the song' });
            return;
        }
        const [task] = await index_1.db
            .insert(schema_1.tasks)
            .values({ ...parsed.data, songId: req.params.songId })
            .returning();
        res.status(201).json({ ...task, subtasks: [] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PATCH /api/songs/:id/order
exports.songsRouter.patch('/:id/order', async (req, res) => {
    const parsed = songs_1.UpdateSongOrderSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    try {
        const [updated] = await index_1.db
            .update(schema_1.songs)
            .set({ order: parsed.data.order })
            .where((0, drizzle_orm_1.eq)(schema_1.songs.id, req.params.id))
            .returning();
        if (!updated) {
            res.status(404).json({ error: 'Song not found' });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
