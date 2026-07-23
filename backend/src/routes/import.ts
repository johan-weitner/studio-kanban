import { Router } from 'express';
import { db } from '../db/index';
import { projects, columns, songs, tasks, subtasks } from '../db/schema';
import { z } from 'zod';

export const importRouter = Router();

const SubtaskSchema = z.object({
  title: z.string(),
  completed: z.boolean().default(false),
  order: z.number().default(0),
});

const TaskSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  assignee: z.string().nullable().optional(),
  order: z.number().default(0),
  columnName: z.string(),
  subtasks: z.array(SubtaskSchema).default([]),
});

const SongSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  order: z.number().default(0),
  tasks: z.array(TaskSchema).default([]),
});

const ColumnSchema = z.object({
  name: z.string(),
  color: z.string().default('#6B7280'),
  order: z.number().default(0),
});

const ProjectSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  columns: z.array(ColumnSchema),
  songs: z.array(SongSchema).default([]),
});

const ImportPayloadSchema = z.object({
  version: z.literal(1),
  projects: z.array(ProjectSchema),
});

// POST /api/import
importRouter.post('/', async (req, res) => {
  const parsed = ImportPayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid import file', details: parsed.error.message });
    return;
  }

  try {
    let importedProjects = 0;
    let importedSongs = 0;
    let importedTasks = 0;

    for (const projectData of parsed.data.projects) {
      // Create project
      const [project] = await db
        .insert(projects)
        .values({ name: projectData.name, description: projectData.description ?? null })
        .returning();

      // Create columns and build name → new ID map
      const columnMap = new Map<string, string>();
      for (const col of projectData.columns) {
        const [newCol] = await db
          .insert(columns)
          .values({ projectId: project.id, name: col.name, color: col.color ?? '#6B7280', order: col.order })
          .returning();
        columnMap.set(col.name, newCol.id);
      }

      // Create songs + tasks + subtasks
      for (const songData of projectData.songs) {
        const [song] = await db
          .insert(songs)
          .values({ projectId: project.id, title: songData.title, description: songData.description ?? null, order: songData.order })
          .returning();

        for (const taskData of songData.tasks) {
          const columnId = columnMap.get(taskData.columnName);
          if (!columnId) continue; // skip tasks whose column no longer exists

          const [task] = await db
            .insert(tasks)
            .values({
              songId: song.id,
              columnId,
              title: taskData.title,
              description: taskData.description ?? null,
              assignee: taskData.assignee ?? null,
              order: taskData.order,
            })
            .returning();

          for (const st of taskData.subtasks) {
            await db.insert(subtasks).values({
              taskId: task.id,
              title: st.title,
              completed: st.completed,
              order: st.order,
            });
          }
          importedTasks++;
        }
        importedSongs++;
      }
      importedProjects++;
    }

    res.json({ importedProjects, importedSongs, importedTasks });
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Import failed' });
  }
});
