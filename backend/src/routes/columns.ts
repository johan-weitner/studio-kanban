import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { columns } from '../db/schema';
import { UpdateColumnSchema, UpdateColumnOrderSchema } from '../schemas/columns';

export const columnsRouter = Router();

// PUT /api/columns/:id
columnsRouter.put('/:id', async (req, res) => {
  const parsed = UpdateColumnSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [updated] = await db
      .update(columns)
      .set(parsed.data)
      .where(eq(columns.id, req.params.id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: 'Column not found' });
      return;
    }
    res.json(updated);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/columns/:id
columnsRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.delete(columns).where(eq(columns.id, req.params.id)).returning();
    if (!deleted.length) {
      res.status(404).json({ error: 'Column not found' });
      return;
    }
    res.status(204).send();
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/columns/:id/order
columnsRouter.patch('/:id/order', async (req, res) => {
  const parsed = UpdateColumnOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [updated] = await db
      .update(columns)
      .set({ order: parsed.data.order })
      .where(eq(columns.id, req.params.id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: 'Column not found' });
      return;
    }
    res.json(updated);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
