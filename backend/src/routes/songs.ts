import { Router } from 'express';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../db/index';
import { songs, tasks, subtasks } from '../db/schema';
import { UpdateSongSchema, UpdateSongOrderSchema } from '../schemas/songs';
import { CreateTaskSchema } from '../schemas/tasks';
import { columns } from '../db/schema';

export const songsRouter = Router();

// PUT /api/songs/:id
songsRouter.put('/:id', async (req, res) => {
  const parsed = UpdateSongSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [updated] = await db
      .update(songs)
      .set({ ...parsed.data, updatedAt: new Date().toISOString() })
      .where(eq(songs.id, req.params.id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: 'Song not found' });
      return;
    }
    res.json(updated);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/songs/:id
songsRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.delete(songs).where(eq(songs.id, req.params.id)).returning();
    if (!deleted.length) {
      res.status(404).json({ error: 'Song not found' });
      return;
    }
    res.status(204).send();
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/songs/:songId/tasks (with subtasks)
songsRouter.get('/:songId/tasks', async (req, res) => {
  try {
    const taskList = await db.select().from(tasks).where(eq(tasks.songId, req.params.songId));
    const taskIds = taskList.map((t) => t.id);
    const subtaskList =
      taskIds.length > 0
        ? await db.select().from(subtasks).where(inArray(subtasks.taskId, taskIds))
        : [];
    const result = taskList.map((task) => ({
      ...task,
      subtasks: subtaskList.filter((st) => st.taskId === task.id),
    }));
    res.json(result);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/songs/:songId/tasks
songsRouter.post('/:songId/tasks', async (req, res) => {
  const parsed = CreateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [song] = await db.select().from(songs).where(eq(songs.id, req.params.songId));
    if (!song) {
      res.status(404).json({ error: 'Song not found' });
      return;
    }
    const [column] = await db.select().from(columns).where(eq(columns.id, parsed.data.columnId));
    if (!column) {
      res.status(404).json({ error: 'Column not found' });
      return;
    }
    if (column.projectId !== song.projectId) {
      res.status(400).json({ error: 'Column does not belong to the same project as the song' });
      return;
    }
    const [task] = await db
      .insert(tasks)
      .values({ ...parsed.data, songId: req.params.songId })
      .returning();
    res.status(201).json({ ...task, subtasks: [] });
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/songs/:id/order
songsRouter.patch('/:id/order', async (req, res) => {
  const parsed = UpdateSongOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [updated] = await db
      .update(songs)
      .set({ order: parsed.data.order })
      .where(eq(songs.id, req.params.id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: 'Song not found' });
      return;
    }
    res.json(updated);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
