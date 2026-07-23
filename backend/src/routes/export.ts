import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { projects, columns, songs, tasks, subtasks } from '../db/schema';

export const exportRouter = Router();

// GET /api/export
// Returns a full snapshot of all data, suitable for re-import.
exportRouter.get('/', async (_req, res) => {
  try {
    const allProjects = await db.select().from(projects);

    const payload = await Promise.all(
      allProjects.map(async (project) => {
        const cols = await db.select().from(columns).where(eq(columns.projectId, project.id));
        const projectSongs = await db.select().from(songs).where(eq(songs.projectId, project.id));

        const songsWithTasks = await Promise.all(
          projectSongs.map(async (song) => {
            const songTasks = await db.select().from(tasks).where(eq(tasks.songId, song.id));

            const tasksWithSubtasks = await Promise.all(
              songTasks.map(async (task) => {
                const taskSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, task.id));
                // Store column name instead of ID so import can remap it
                const col = cols.find((c) => c.id === task.columnId);
                return {
                  title: task.title,
                  description: task.description,
                  assignee: task.assignee,
                  order: task.order,
                  columnName: col?.name ?? '',
                  subtasks: taskSubtasks.map((st) => ({
                    title: st.title,
                    completed: st.completed,
                    order: st.order,
                  })),
                };
              })
            );

            return {
              title: song.title,
              description: song.description,
              order: song.order,
              tasks: tasksWithSubtasks,
            };
          })
        );

        return {
          name: project.name,
          description: project.description,
          columns: cols.map((c) => ({ name: c.name, color: c.color, order: c.order })),
          songs: songsWithTasks,
        };
      })
    );

    res.json({
      version: 1,
      exportedAt: new Date().toISOString(),
      projects: payload,
    });
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Export failed' });
  }
});
