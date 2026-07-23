import { Router } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index';
import { projects, projectSequences, projectMembers } from '../db/schema';
import { scGet } from '../soundcloud/tokenManager';
import { z } from 'zod';

export const soundcloudRouter = Router();

// ── Types returned by SoundCloud resolve endpoint ─────────────────────────────

interface SCTrack {
  id: number;
  title: string;
  artwork_url: string | null;
  permalink_url: string;
  streamable: boolean;
  kind: string;
}

interface SCPlaylist {
  kind: string;
  id: number;
  title: string;
  tracks: SCTrack[];
  secret_token?: string;
}

// ── PATCH /api/projects/:id/soundcloud ───────────────────────────────────────
// Save the SoundCloud playlist URL (and optional secret token) on the project.

soundcloudRouter.patch('/projects/:id/soundcloud', async (req, res) => {
  try {
    const { playlistUrl, secretToken } = z.object({
      playlistUrl: z.string().url(),
      secretToken: z.string().optional(),
    }).parse(req.body);

    const [project] = await db.select().from(projects).where(eq(projects.id, req.params.id));
    if (!project) { res.status(404).json({ error: 'Project not found' }); return; }
    // Allow if the project is unowned, owned by this user, or this user is a member
    const isOwner = !project.ownerId || project.ownerId === req.user?.id;
    const [membership] = isOwner ? [true] : await db.select().from(projectMembers)
      .where(and(eq(projectMembers.projectId, project.id), eq(projectMembers.userId, req.user?.id ?? '')));
    if (!isOwner && !membership) { res.status(403).json({ error: 'Forbidden' }); return; }

    // Auto-extract the secret token if it's embedded in the URL path (/s-TOKEN)
    // and strip tracking query params — SC only cares about the path
    const parsed = new URL(playlistUrl);
    const tokenInPath = parsed.pathname.match(/\/s-([A-Za-z0-9]+)$/);
    const resolvedToken = secretToken || (tokenInPath ? `s-${tokenInPath[1]}` : null);
    // Store the clean base URL (no token in path, no query params)
    const baseUrl = tokenInPath
      ? `${parsed.origin}${parsed.pathname.replace(/\/s-[A-Za-z0-9]+$/, '')}`
      : `${parsed.origin}${parsed.pathname}`;

    const [updated] = await db
      .update(projects)
      .set({ soundcloudPlaylistUrl: baseUrl, soundcloudSecretToken: resolvedToken })
      .where(eq(projects.id, req.params.id))
      .returning();
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.message }); return; }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/projects/:id/soundcloud/sync ────────────────────────────────────
// Resolve the configured playlist via the SC API and upsert tracks into
// project_sequences, preserving any existing status/position decisions.

soundcloudRouter.post('/projects/:id/soundcloud/sync', async (req, res) => {
  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, req.params.id));
    if (!project) { res.status(404).json({ error: 'Project not found' }); return; }
    if (!project.soundcloudPlaylistUrl) {
      res.status(400).json({ error: 'No SoundCloud playlist configured for this project' });
      return;
    }

    // Build the clean SC URL:
    // 1. Strip tracking params (si=, utm_*, etc) — SC doesn't need them
    // 2. If a secret token is stored separately, append it to the path
    const parsed = new URL(project.soundcloudPlaylistUrl);
    let cleanPath = parsed.pathname; // e.g. /monsieur-ministre/sets/workspace-for-debris or /…/s-TOKEN

    // If the secret token isn't already in the path, append it
    const storedToken = project.soundcloudSecretToken;
    if (storedToken && !cleanPath.includes(storedToken)) {
      cleanPath = `${cleanPath.replace(/\/$/, '')}/${storedToken}`;
    }
    const cleanUrl = `${parsed.origin}${cleanPath}`;
    const resolveUrl = `https://api.soundcloud.com/resolve?url=${encodeURIComponent(cleanUrl)}`;
    const scRes = await scGet(resolveUrl);

    if (!scRes.ok) {
      const text = await scRes.text();
      res.status(502).json({ error: `SoundCloud resolve failed: ${scRes.status} ${text}` });
      return;
    }

    const playlist = await scRes.json() as SCPlaylist;

    if (playlist.kind !== 'playlist') {
      res.status(400).json({ error: 'URL does not point to a SoundCloud playlist' });
      return;
    }

    // Fetch existing sequence entries for this project
    const existing = await db.select().from(projectSequences).where(eq(projectSequences.projectId, req.params.id));
    const existingMap = new Map(existing.map((e) => [e.scTrackId, e]));

    // Upsert each track — preserve status/position of existing ones
    const results = [];
    for (const track of playlist.tracks) {
      const id = String(track.id);
      const existingEntry = existingMap.get(id);

      if (existingEntry) {
        // Update metadata in case it changed; keep status/position
        const [updated] = await db
          .update(projectSequences)
          .set({
            title: track.title,
            artworkUrl: track.artwork_url ?? null,
            permalinkUrl: track.permalink_url,
          })
          .where(and(eq(projectSequences.projectId, req.params.id), eq(projectSequences.scTrackId, id)))
          .returning();
        results.push(updated);
      } else {
        // New track — insert as unapproved
        const [inserted] = await db
          .insert(projectSequences)
          .values({
            projectId: req.params.id,
            scTrackId: id,
            title: track.title,
            artworkUrl: track.artwork_url ?? null,
            permalinkUrl: track.permalink_url,
            status: 'unapproved',
            position: 0,
          })
          .returning();
        results.push(inserted);
      }
    }

    res.json({ synced: results.length, tracks: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/projects/:id/sequence ────────────────────────────────────────────
// Returns { approved: [...], unapproved: [...], secretToken: string | null }

soundcloudRouter.get('/projects/:id/sequence', async (req, res) => {
  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, req.params.id));
    if (!project) { res.status(404).json({ error: 'Project not found' }); return; }

    const all = await db.select().from(projectSequences).where(eq(projectSequences.projectId, req.params.id));

    const approved = all
      .filter((t) => t.status === 'approved')
      .sort((a, b) => a.position - b.position);

    const unapproved = all.filter((t) => t.status !== 'approved');

    res.json({
      approved,
      unapproved,
      playlistUrl: project.soundcloudPlaylistUrl,
      secretToken: project.soundcloudSecretToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── PUT /api/projects/:id/sequence ────────────────────────────────────────────
// Accepts { approved: string[], unapproved: string[] } (arrays of sequence IDs)
// and updates status + position accordingly.

soundcloudRouter.put('/projects/:id/sequence', async (req, res) => {
  const { approved, unapproved } = z.object({
    approved: z.array(z.string()),
    unapproved: z.array(z.string()),
  }).parse(req.body);

  try {
    // Update approved tracks with their new positions
    for (let i = 0; i < approved.length; i++) {
      await db
        .update(projectSequences)
        .set({ status: 'approved', position: i })
        .where(and(eq(projectSequences.id, approved[i]), eq(projectSequences.projectId, req.params.id)));
    }
    // Mark unapproved tracks
    for (const id of unapproved) {
      await db
        .update(projectSequences)
        .set({ status: 'unapproved', position: 0 })
        .where(and(eq(projectSequences.id, id), eq(projectSequences.projectId, req.params.id)));
    }

    res.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.message }); return; }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
