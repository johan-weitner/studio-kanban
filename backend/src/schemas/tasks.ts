import { registry, z } from './registry';
import { SubtaskSchema } from './subtasks';

export const TaskSchema = registry.register(
  'Task',
  z.object({
    id: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440003' }),
    songId: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440002' }),
    columnId: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440001' }),
    title: z.string().openapi({ example: 'Record drums' }),
    description: z.string().nullable().openapi({ example: 'Record kick and snare tracks' }),
    assignee: z.string().nullable().openapi({ example: 'Alice' }),
    order: z.number().int().openapi({ example: 0 }),
    createdAt: z.string().openapi({ example: '2024-01-01 12:00:00' }),
    updatedAt: z.string().openapi({ example: '2024-01-01 12:00:00' }),
    subtasks: z.array(SubtaskSchema).openapi({ description: 'Subtasks for this task' }),
  })
);

export const CreateTaskSchema = z.object({
  columnId: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440001' }),
  title: z.string().min(1).openapi({ example: 'Record drums' }),
  description: z.string().optional().openapi({ example: 'Record kick and snare' }),
  assignee: z.string().optional().openapi({ example: 'Alice' }),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).optional().openapi({ example: 'Updated Title' }),
  description: z.string().optional().openapi({ example: 'Updated description' }),
  assignee: z.string().optional().openapi({ example: 'Bob' }),
  columnId: z.string().optional().openapi({ example: '550e8400-e29b-41d4-a716-446655440001' }),
  order: z.number().int().optional().openapi({ example: 1 }),
});

export const MoveTaskSchema = z.object({
  columnId: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440001' }),
  songId: z.string().optional().openapi({ example: '550e8400-e29b-41d4-a716-446655440002' }),
  order: z.number().int().optional().openapi({ example: 0 }),
});

const songIdParam = z.object({ songId: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440002' }) });
const idParam = z.object({ id: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440003' }) });
const errSchema = z.object({ error: z.string() });

registry.registerPath({
  method: 'get',
  path: '/api/songs/{songId}/tasks',
  tags: ['Tasks'],
  summary: 'List tasks for a song (with subtasks)',
  request: { params: songIdParam },
  responses: {
    200: { description: 'List of tasks with subtasks', content: { 'application/json': { schema: z.array(TaskSchema) } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/songs/{songId}/tasks',
  tags: ['Tasks'],
  summary: 'Create a task for a song',
  request: { params: songIdParam, body: { content: { 'application/json': { schema: CreateTaskSchema } } } },
  responses: {
    201: { description: 'Created task', content: { 'application/json': { schema: TaskSchema } } },
    400: { description: 'Validation error', content: { 'application/json': { schema: errSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/tasks/{id}',
  tags: ['Tasks'],
  summary: 'Get a task by ID (with subtasks)',
  request: { params: idParam },
  responses: {
    200: { description: 'Task with subtasks', content: { 'application/json': { schema: TaskSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/tasks/{id}',
  tags: ['Tasks'],
  summary: 'Update a task',
  request: { params: idParam, body: { content: { 'application/json': { schema: UpdateTaskSchema } } } },
  responses: {
    200: { description: 'Updated task', content: { 'application/json': { schema: TaskSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/tasks/{id}/move',
  tags: ['Tasks'],
  summary: 'Move a task to a different column or song',
  request: { params: idParam, body: { content: { 'application/json': { schema: MoveTaskSchema } } } },
  responses: {
    200: { description: 'Moved task', content: { 'application/json': { schema: TaskSchema } } },
    400: { description: 'Column/project mismatch', content: { 'application/json': { schema: errSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/tasks/{id}',
  tags: ['Tasks'],
  summary: 'Delete a task',
  request: { params: idParam },
  responses: {
    204: { description: 'Deleted' },
    404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
  },
});
