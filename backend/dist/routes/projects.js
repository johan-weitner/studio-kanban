"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectsRouter = void 0;
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const index_1 = require("../db/index");
const schema_1 = require("../db/schema");
const projects_1 = require("../schemas/projects");
const columns_1 = require("../schemas/columns");
const songs_1 = require("../schemas/songs");
exports.projectsRouter = (0, express_1.Router)();
const DEFAULT_COLUMNS = [
    { name: 'Pending', color: '#6B7280', order: 0 },
    { name: 'In Progress', color: '#3B82F6', order: 1 },
    { name: 'Done', color: '#10B981', order: 2 },
    { name: 'Discarded', color: '#EF4444', order: 3 },
];
// GET /api/projects
exports.projectsRouter.get('/', async (_req, res) => {
    try {
        const result = await index_1.db.select().from(schema_1.projects);
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/projects
exports.projectsRouter.post('/', async (req, res) => {
    const parsed = projects_1.CreateProjectSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    try {
        const [project] = await index_1.db.insert(schema_1.projects).values(parsed.data).returning();
        await index_1.db.insert(schema_1.columns).values(DEFAULT_COLUMNS.map((col) => ({ ...col, projectId: project.id })));
        res.status(201).json(project);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/projects/:id
exports.projectsRouter.get('/:id', async (req, res) => {
    try {
        const [project] = await index_1.db.select().from(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.id, req.params.id));
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        res.json(project);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /api/projects/:id
exports.projectsRouter.put('/:id', async (req, res) => {
    const parsed = projects_1.UpdateProjectSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    try {
        const [updated] = await index_1.db
            .update(schema_1.projects)
            .set({ ...parsed.data, updatedAt: new Date().toISOString() })
            .where((0, drizzle_orm_1.eq)(schema_1.projects.id, req.params.id))
            .returning();
        if (!updated) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /api/projects/:id
exports.projectsRouter.delete('/:id', async (req, res) => {
    try {
        const deleted = await index_1.db.delete(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.id, req.params.id)).returning();
        if (!deleted.length) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        res.status(204).send();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/projects/:projectId/columns
exports.projectsRouter.get('/:projectId/columns', async (req, res) => {
    try {
        const [project] = await index_1.db.select().from(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.id, req.params.projectId));
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        const result = await index_1.db.select().from(schema_1.columns).where((0, drizzle_orm_1.eq)(schema_1.columns.projectId, req.params.projectId));
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/projects/:projectId/columns
exports.projectsRouter.post('/:projectId/columns', async (req, res) => {
    const parsed = columns_1.CreateColumnSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    try {
        const [project] = await index_1.db.select().from(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.id, req.params.projectId));
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        const [column] = await index_1.db
            .insert(schema_1.columns)
            .values({ ...parsed.data, projectId: req.params.projectId })
            .returning();
        res.status(201).json(column);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/projects/:projectId/songs
exports.projectsRouter.get('/:projectId/songs', async (req, res) => {
    try {
        const [project] = await index_1.db.select().from(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.id, req.params.projectId));
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        const result = await index_1.db.select().from(schema_1.songs).where((0, drizzle_orm_1.eq)(schema_1.songs.projectId, req.params.projectId));
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/projects/:projectId/songs
exports.projectsRouter.post('/:projectId/songs', async (req, res) => {
    const parsed = songs_1.CreateSongSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    try {
        const [project] = await index_1.db.select().from(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.id, req.params.projectId));
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        const [song] = await index_1.db
            .insert(schema_1.songs)
            .values({ ...parsed.data, projectId: req.params.projectId })
            .returning();
        res.status(201).json(song);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
