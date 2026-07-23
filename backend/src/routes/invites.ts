import { Router } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index';
import { projects, projectMembers, projectInvites } from '../db/schema';

export const invitesRouter = Router();

// POST /api/projects/:id/invite — owner generates a 7-day invite token
invitesRouter.post('/projects/:id/invite', async (req, res) => {
  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, req.params.id));
    if (!project) { res.status(404).json({ error: 'Project not found' }); return; }
    if (project.ownerId !== req.user.id) { res.status(403).json({ error: 'Forbidden' }); return; }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await db.insert(projectInvites).values({
      projectId: project.id,
      token,
      createdBy: req.user.id,
      expiresAt,
    });

    const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:5173';
    res.json({ inviteURL: `${baseURL}/?join=${token}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/join/:token — signed-in user accepts an invite
invitesRouter.post('/join/:token', async (req, res) => {
  try {
    const [invite] = await db.select().from(projectInvites).where(eq(projectInvites.token, req.params.token));
    if (!invite) { res.status(404).json({ error: 'Invite not found or expired' }); return; }
    if (new Date(invite.expiresAt) < new Date()) {
      res.status(410).json({ error: 'Invite has expired' }); return;
    }

    // Don't add the owner as a member
    const [project] = await db.select().from(projects).where(eq(projects.id, invite.projectId));
    if (project?.ownerId === req.user.id) {
      res.json({ projectId: invite.projectId, alreadyMember: true }); return;
    }

    // Idempotent — skip if already a member
    const [existing] = await db.select().from(projectMembers).where(
      and(eq(projectMembers.projectId, invite.projectId), eq(projectMembers.userId, req.user.id))
    );
    if (!existing) {
      await db.insert(projectMembers).values({
        projectId: invite.projectId,
        userId: req.user.id,
        role: 'member',
      });
    }

    res.json({ projectId: invite.projectId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/projects/:id/members
invitesRouter.get('/projects/:id/members', async (req, res) => {
  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, req.params.id));
    if (!project) { res.status(404).json({ error: 'Project not found' }); return; }
    const members = await db.select().from(projectMembers).where(eq(projectMembers.projectId, req.params.id));
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/projects/:id/members/:userId — owner removes a member
invitesRouter.delete('/projects/:id/members/:userId', async (req, res) => {
  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, req.params.id));
    if (!project) { res.status(404).json({ error: 'Project not found' }); return; }
    if (project.ownerId !== req.user.id) { res.status(403).json({ error: 'Forbidden' }); return; }
    await db.delete(projectMembers).where(
      and(eq(projectMembers.projectId, req.params.id), eq(projectMembers.userId, req.params.userId))
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
