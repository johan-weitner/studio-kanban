import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { subtasks } from '../db/schema';
import { UpdateSubtaskSchema } from '../schemas/subtasks';

export const subtasksRouter = Router();

// PUT /api/subtasks/:id
subtasksRouter.put('/:id', async (req, res) => {
  const parsed = UpdateSubtaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [updated] = await db
      .update(subtasks)
      .set(parsed.data)
      .where(eq(subtasks.id, req.params.id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: 'Subtask not found' });
      return;
    }
    res.json(updated);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/subtasks/:id
subtasksRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.delete(subtasks).where(eq(subtasks.id, req.params.id)).returning();
    if (!deleted.length) {
      res.status(404).json({ error: 'Subtask not found' });
      return;
    }
    res.status(204).send();
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
