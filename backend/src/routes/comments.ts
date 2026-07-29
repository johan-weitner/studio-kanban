import { Router } from 'express';
import { eq, and, isNull, isNotNull } from 'drizzle-orm';
import { db } from '../db/index';
import { comments, songs, projects } from '../db/schema';
import { z } from 'zod';

export const commentsRouter = Router();

// ── Shared helpers ─────────────────────────────────────────────────────────

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorImage: string | null;
  body: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ThreadResponse {
  topLevel: Comment[];
  replies: Record<string, Comment[]>;
}

function buildThread(rows: typeof comments.$inferSelect[]): ThreadResponse {
  const topLevel: Comment[] = [];
  const replies: Record<string, Comment[]> = {};
  for (const row of rows) {
    const c: Comment = {
      id: row.id,
      authorId: row.authorId,
      authorName: row.authorName,
      authorImage: row.authorImage,
      body: row.body,
      parentId: row.parentId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    if (!row.parentId) {
      topLevel.push(c);
    } else {
      if (!replies[row.parentId]) replies[row.parentId] = [];
      replies[row.parentId].push(c);
    }
  }
  return { topLevel, replies };
}

const PostBodySchema = z.object({
  body: z.string().min(1).max(4000),
  parentId: z.string().optional(),
});

// ── GET /api/songs/:songId/comments ───────────────────────────────────────

commentsRouter.get('/songs/:songId/comments', async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(comments)
      .where(eq(comments.songId, req.params.songId))
      .orderBy(comments.createdAt);
    res.json(buildThread(rows));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/songs/:songId/comments ──────────────────────────────────────

commentsRouter.post('/songs/:songId/comments', async (req, res) => {
  const parsed = PostBodySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [song] = await db.select().from(songs).where(eq(songs.id, req.params.songId));
    if (!song) { res.status(404).json({ error: 'Song not found' }); return; }

    // Enforce one level — parent must itself be top-level
    if (parsed.data.parentId) {
      const [parent] = await db.select().from(comments).where(eq(comments.id, parsed.data.parentId));
      if (!parent || parent.parentId) {
        res.status(400).json({ error: 'Replies can only be made on top-level comments' });
        return;
      }
    }

    const [inserted] = await db.insert(comments).values({
      projectId: song.projectId,
      songId: req.params.songId,
      authorId: req.user.id,
      authorName: req.user.name,
      authorImage: req.user.image ?? null,
      body: parsed.data.body,
      parentId: parsed.data.parentId ?? null,
    }).returning();
    res.status(201).json(inserted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/projects/:projectId/sequence/comments ────────────────────────

commentsRouter.get('/projects/:projectId/sequence/comments', async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.projectId, req.params.projectId),
          isNull(comments.songId)
        )
      )
      .orderBy(comments.createdAt);
    res.json(buildThread(rows));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/projects/:projectId/sequence/comments ───────────────────────

commentsRouter.post('/projects/:projectId/sequence/comments', async (req, res) => {
  const parsed = PostBodySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, req.params.projectId));
    if (!project) { res.status(404).json({ error: 'Project not found' }); return; }

    if (parsed.data.parentId) {
      const [parent] = await db.select().from(comments).where(eq(comments.id, parsed.data.parentId));
      if (!parent || parent.parentId) {
        res.status(400).json({ error: 'Replies can only be made on top-level comments' });
        return;
      }
    }

    const [inserted] = await db.insert(comments).values({
      projectId: req.params.projectId,
      songId: null,
      authorId: req.user.id,
      authorName: req.user.name,
      authorImage: req.user.image ?? null,
      body: parsed.data.body,
      parentId: parsed.data.parentId ?? null,
    }).returning();
    res.status(201).json(inserted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── PUT /api/comments/:id ─────────────────────────────────────────────────

commentsRouter.put('/comments/:id', async (req, res) => {
  const parsed = z.object({ body: z.string().min(1).max(4000) }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [comment] = await db.select().from(comments).where(eq(comments.id, req.params.id));
    if (!comment) { res.status(404).json({ error: 'Comment not found' }); return; }
    if (comment.authorId !== req.user.id) { res.status(403).json({ error: 'Forbidden' }); return; }
    const [updated] = await db
      .update(comments)
      .set({ body: parsed.data.body, updatedAt: new Date().toISOString() })
      .where(eq(comments.id, req.params.id))
      .returning();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── DELETE /api/comments/:id ──────────────────────────────────────────────

commentsRouter.delete('/comments/:id', async (req, res) => {
  try {
    const [comment] = await db.select().from(comments).where(eq(comments.id, req.params.id));
    if (!comment) { res.status(404).json({ error: 'Comment not found' }); return; }
    if (comment.authorId !== req.user.id) { res.status(403).json({ error: 'Forbidden' }); return; }
    await db.delete(comments).where(eq(comments.id, req.params.id)); // cascades replies
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
