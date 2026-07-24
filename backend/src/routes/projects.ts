import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { projects, columns, songs } from '../db/schema';
import { CreateProjectSchema, UpdateProjectSchema } from '../schemas/projects';
import { CreateColumnSchema } from '../schemas/columns';
import { CreateSongSchema } from '../schemas/songs';

export const projectsRouter = Router();

const DEFAULT_COLUMNS = [
  { name: 'Pending',     color: '#6B7280', order: 0 },
  { name: 'In Progress', color: '#3B82F6', order: 1 },
  { name: 'Done',        color: '#10B981', order: 2 },
  { name: 'Discarded',   color: '#EF4444', order: 3 },
];

// GET /api/projects
projectsRouter.get('/', async (_req, res) => {
  try {
    const result = await db.select().from(projects);
    res.json(result);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/projects
projectsRouter.post('/', async (req, res) => {
  const parsed = CreateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [project] = await db.insert(projects).values(parsed.data).returning();
    await db.insert(columns).values(
      DEFAULT_COLUMNS.map((col) => ({ ...col, projectId: project.id }))
    );
    res.status(201).json(project);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/projects/:id
projectsRouter.get('/:id', async (req, res) => {
  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, req.params.id));
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/projects/:id
projectsRouter.put('/:id', async (req, res) => {
  const parsed = UpdateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [existing] = await db.select().from(projects).where(eq(projects.id, req.params.id));
    if (!existing) { res.status(404).json({ error: 'Project not found' }); return; }
    const [updated] = await db
      .update(projects)
      .set({ ...parsed.data, updatedAt: new Date().toISOString() })
      .where(eq(projects.id, req.params.id))
      .returning();
    res.json(updated);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/projects/:id
projectsRouter.delete('/:id', async (req, res) => {
  try {
    const [existing] = await db.select().from(projects).where(eq(projects.id, req.params.id));
    if (!existing) { res.status(404).json({ error: 'Project not found' }); return; }
    await db.delete(projects).where(eq(projects.id, req.params.id));
    res.status(204).send();
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/projects/:projectId/columns
projectsRouter.get('/:projectId/columns', async (req, res) => {
  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, req.params.projectId));
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    const result = await db.select().from(columns).where(eq(columns.projectId, req.params.projectId));
    res.json(result);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/projects/:projectId/columns
projectsRouter.post('/:projectId/columns', async (req, res) => {
  const parsed = CreateColumnSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, req.params.projectId));
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    const [column] = await db
      .insert(columns)
      .values({ ...parsed.data, projectId: req.params.projectId })
      .returning();
    res.status(201).json(column);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/projects/:projectId/songs
projectsRouter.get('/:projectId/songs', async (req, res) => {
  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, req.params.projectId));
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    const result = await db.select().from(songs).where(eq(songs.projectId, req.params.projectId));
    res.json(result);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/projects/:projectId/songs
projectsRouter.post('/:projectId/songs', async (req, res) => {
  const parsed = CreateSongSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, req.params.projectId));
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    const [song] = await db
      .insert(songs)
      .values({ ...parsed.data, projectId: req.params.projectId })
      .returning();
    res.status(201).json(song);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
