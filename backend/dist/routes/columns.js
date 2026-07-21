"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.columnsRouter = void 0;
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const index_1 = require("../db/index");
const schema_1 = require("../db/schema");
const columns_1 = require("../schemas/columns");
exports.columnsRouter = (0, express_1.Router)();
// PUT /api/columns/:id
exports.columnsRouter.put('/:id', async (req, res) => {
    const parsed = columns_1.UpdateColumnSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    try {
        const [updated] = await index_1.db
            .update(schema_1.columns)
            .set(parsed.data)
            .where((0, drizzle_orm_1.eq)(schema_1.columns.id, req.params.id))
            .returning();
        if (!updated) {
            res.status(404).json({ error: 'Column not found' });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /api/columns/:id
exports.columnsRouter.delete('/:id', async (req, res) => {
    try {
        const deleted = await index_1.db.delete(schema_1.columns).where((0, drizzle_orm_1.eq)(schema_1.columns.id, req.params.id)).returning();
        if (!deleted.length) {
            res.status(404).json({ error: 'Column not found' });
            return;
        }
        res.status(204).send();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PATCH /api/columns/:id/order
exports.columnsRouter.patch('/:id/order', async (req, res) => {
    const parsed = columns_1.UpdateColumnOrderSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    try {
        const [updated] = await index_1.db
            .update(schema_1.columns)
            .set({ order: parsed.data.order })
            .where((0, drizzle_orm_1.eq)(schema_1.columns.id, req.params.id))
            .returning();
        if (!updated) {
            res.status(404).json({ error: 'Column not found' });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
