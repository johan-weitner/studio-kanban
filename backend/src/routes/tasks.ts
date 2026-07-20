import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { tasks, subtasks, songs, columns } from '../db/schema';
import { UpdateTaskSchema, MoveTaskSchema } from '../schemas/tasks';
import { CreateSubtaskSchema } from '../schemas/subtasks';

export const tasksRouter = Router();

// GET /api/tasks/:id (with subtasks)
tasksRouter.get('/:id', async (req, res) => {
  try {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, req.params.id));
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    const taskSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, task.id));
    res.json({ ...task, subtasks: taskSubtasks });
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/tasks/:id
tasksRouter.put('/:id', async (req, res) => {
  const parsed = UpdateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, req.params.id));
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    // Validate columnId if provided
    if (parsed.data.columnId) {
      const [song] = await db.select().from(songs).where(eq(songs.id, task.songId));
      const [column] = await db.select().from(columns).where(eq(columns.id, parsed.data.columnId));
      if (!column) {
        res.status(404).json({ error: 'Column not found' });
        return;
      }
      if (song && column.projectId !== song.projectId) {
        res.status(400).json({ error: 'Column does not belong to the same project as the song' });
        return;
      }
    }
    const [updated] = await db
      .update(tasks)
      .set({ ...parsed.data, updatedAt: new Date().toISOString() })
      .where(eq(tasks.id, req.params.id))
      .returning();
    const taskSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, req.params.id));
    res.json({ ...updated, subtasks: taskSubtasks });
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/tasks/:id/move
tasksRouter.patch('/:id/move', async (req, res) => {
  const parsed = MoveTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, req.params.id));
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    // Validate column belongs to the same project as the (possibly new) song
    const targetSongId = parsed.data.songId ?? task.songId;
    const [targetSong] = await db.select().from(songs).where(eq(songs.id, targetSongId));
    if (!targetSong) {
      res.status(404).json({ error: 'Song not found' });
      return;
    }
    const [column] = await db.select().from(columns).where(eq(columns.id, parsed.data.columnId));
    if (!column) {
      res.status(404).json({ error: 'Column not found' });
      return;
    }
    if (column.projectId !== targetSong.projectId) {
      res.status(400).json({ error: 'Column does not belong to the same project as the song' });
      return;
    }
    const updateData: Partial<typeof task> = {
      columnId: parsed.data.columnId,
      updatedAt: new Date().toISOString(),
    };
    if (parsed.data.songId !== undefined) updateData.songId = parsed.data.songId;
    if (parsed.data.order !== undefined) updateData.order = parsed.data.order;

    const [updated] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, req.params.id))
      .returning();
    const taskSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, req.params.id));
    res.json({ ...updated, subtasks: taskSubtasks });
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/tasks/:id
tasksRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.delete(tasks).where(eq(tasks.id, req.params.id)).returning();
    if (!deleted.length) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.status(204).send();
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tasks/:taskId/subtasks
tasksRouter.get('/:taskId/subtasks', async (req, res) => {
  try {
    const result = await db.select().from(subtasks).where(eq(subtasks.taskId, req.params.taskId));
    res.json(result);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tasks/:taskId/subtasks
tasksRouter.post('/:taskId/subtasks', async (req, res) => {
  const parsed = CreateSubtaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, req.params.taskId));
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    const [subtask] = await db
      .insert(subtasks)
      .values({ ...parsed.data, taskId: req.params.taskId })
      .returning();
    res.status(201).json(subtask);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
