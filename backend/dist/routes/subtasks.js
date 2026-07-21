"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subtasksRouter = void 0;
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const index_1 = require("../db/index");
const schema_1 = require("../db/schema");
const subtasks_1 = require("../schemas/subtasks");
exports.subtasksRouter = (0, express_1.Router)();
// PUT /api/subtasks/:id
exports.subtasksRouter.put('/:id', async (req, res) => {
    const parsed = subtasks_1.UpdateSubtaskSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    try {
        const [updated] = await index_1.db
            .update(schema_1.subtasks)
            .set(parsed.data)
            .where((0, drizzle_orm_1.eq)(schema_1.subtasks.id, req.params.id))
            .returning();
        if (!updated) {
            res.status(404).json({ error: 'Subtask not found' });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /api/subtasks/:id
exports.subtasksRouter.delete('/:id', async (req, res) => {
    try {
        const deleted = await index_1.db.delete(schema_1.subtasks).where((0, drizzle_orm_1.eq)(schema_1.subtasks.id, req.params.id)).returning();
        if (!deleted.length) {
            res.status(404).json({ error: 'Subtask not found' });
            return;
        }
        res.status(204).send();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
