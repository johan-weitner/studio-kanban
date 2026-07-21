"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksRouter = void 0;
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const index_1 = require("../db/index");
const schema_1 = require("../db/schema");
const tasks_1 = require("../schemas/tasks");
const subtasks_1 = require("../schemas/subtasks");
exports.tasksRouter = (0, express_1.Router)();
// GET /api/tasks/:id (with subtasks)
exports.tasksRouter.get('/:id', async (req, res) => {
    try {
        const [task] = await index_1.db.select().from(schema_1.tasks).where((0, drizzle_orm_1.eq)(schema_1.tasks.id, req.params.id));
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        const taskSubtasks = await index_1.db.select().from(schema_1.subtasks).where((0, drizzle_orm_1.eq)(schema_1.subtasks.taskId, task.id));
        res.json({ ...task, subtasks: taskSubtasks });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /api/tasks/:id
exports.tasksRouter.put('/:id', async (req, res) => {
    const parsed = tasks_1.UpdateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    try {
        const [task] = await index_1.db.select().from(schema_1.tasks).where((0, drizzle_orm_1.eq)(schema_1.tasks.id, req.params.id));
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        // Validate columnId if provided
        if (parsed.data.columnId) {
            const [song] = await index_1.db.select().from(schema_1.songs).where((0, drizzle_orm_1.eq)(schema_1.songs.id, task.songId));
            const [column] = await index_1.db.select().from(schema_1.columns).where((0, drizzle_orm_1.eq)(schema_1.columns.id, parsed.data.columnId));
            if (!column) {
                res.status(404).json({ error: 'Column not found' });
                return;
            }
            if (song && column.projectId !== song.projectId) {
                res.status(400).json({ error: 'Column does not belong to the same project as the song' });
                return;
            }
        }
        const [updated] = await index_1.db
            .update(schema_1.tasks)
            .set({ ...parsed.data, updatedAt: new Date().toISOString() })
            .where((0, drizzle_orm_1.eq)(schema_1.tasks.id, req.params.id))
            .returning();
        const taskSubtasks = await index_1.db.select().from(schema_1.subtasks).where((0, drizzle_orm_1.eq)(schema_1.subtasks.taskId, req.params.id));
        res.json({ ...updated, subtasks: taskSubtasks });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PATCH /api/tasks/:id/move
exports.tasksRouter.patch('/:id/move', async (req, res) => {
    const parsed = tasks_1.MoveTaskSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    try {
        const [task] = await index_1.db.select().from(schema_1.tasks).where((0, drizzle_orm_1.eq)(schema_1.tasks.id, req.params.id));
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        // Validate column belongs to the same project as the (possibly new) song
        const targetSongId = parsed.data.songId ?? task.songId;
        const [targetSong] = await index_1.db.select().from(schema_1.songs).where((0, drizzle_orm_1.eq)(schema_1.songs.id, targetSongId));
        if (!targetSong) {
            res.status(404).json({ error: 'Song not found' });
            return;
        }
        const [column] = await index_1.db.select().from(schema_1.columns).where((0, drizzle_orm_1.eq)(schema_1.columns.id, parsed.data.columnId));
        if (!column) {
            res.status(404).json({ error: 'Column not found' });
            return;
        }
        if (column.projectId !== targetSong.projectId) {
            res.status(400).json({ error: 'Column does not belong to the same project as the song' });
            return;
        }
        const updateData = {
            columnId: parsed.data.columnId,
            updatedAt: new Date().toISOString(),
        };
        if (parsed.data.songId !== undefined)
            updateData.songId = parsed.data.songId;
        if (parsed.data.order !== undefined)
            updateData.order = parsed.data.order;
        const [updated] = await index_1.db
            .update(schema_1.tasks)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.tasks.id, req.params.id))
            .returning();
        const taskSubtasks = await index_1.db.select().from(schema_1.subtasks).where((0, drizzle_orm_1.eq)(schema_1.subtasks.taskId, req.params.id));
        res.json({ ...updated, subtasks: taskSubtasks });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /api/tasks/:id
exports.tasksRouter.delete('/:id', async (req, res) => {
    try {
        const deleted = await index_1.db.delete(schema_1.tasks).where((0, drizzle_orm_1.eq)(schema_1.tasks.id, req.params.id)).returning();
        if (!deleted.length) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        res.status(204).send();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/tasks/:taskId/subtasks
exports.tasksRouter.get('/:taskId/subtasks', async (req, res) => {
    try {
        const result = await index_1.db.select().from(schema_1.subtasks).where((0, drizzle_orm_1.eq)(schema_1.subtasks.taskId, req.params.taskId));
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/tasks/:taskId/subtasks
exports.tasksRouter.post('/:taskId/subtasks', async (req, res) => {
    const parsed = subtasks_1.CreateSubtaskSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    try {
        const [task] = await index_1.db.select().from(schema_1.tasks).where((0, drizzle_orm_1.eq)(schema_1.tasks.id, req.params.taskId));
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        const [subtask] = await index_1.db
            .insert(schema_1.subtasks)
            .values({ ...parsed.data, taskId: req.params.taskId })
            .returning();
        res.status(201).json(subtask);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
