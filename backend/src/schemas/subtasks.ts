import { registry, z } from './registry';

export const SubtaskSchema = registry.register(
  'Subtask',
  z.object({
    id: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440004' }),
    taskId: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440003' }),
    title: z.string().openapi({ example: 'Set up microphones' }),
    completed: z.boolean().openapi({ example: false }),
    order: z.number().int().openapi({ example: 0 }),
    createdAt: z.string().openapi({ example: '2024-01-01 12:00:00' }),
  })
);

export const CreateSubtaskSchema = z.object({
  title: z.string().min(1).openapi({ example: 'Set up microphones' }),
  order: z.number().int().optional().openapi({ example: 0 }),
});

export const UpdateSubtaskSchema = z.object({
  title: z.string().min(1).optional().openapi({ example: 'Updated title' }),
  completed: z.boolean().optional().openapi({ example: true }),
});

const taskIdParam = z.object({ taskId: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440003' }) });
const idParam = z.object({ id: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440004' }) });
const errSchema = z.object({ error: z.string() });

registry.registerPath({
  method: 'get',
  path: '/api/tasks/{taskId}/subtasks',
  tags: ['Subtasks'],
  summary: 'List subtasks for a task',
  request: { params: taskIdParam },
  responses: {
    200: { description: 'List of subtasks', content: { 'application/json': { schema: z.array(SubtaskSchema) } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/tasks/{taskId}/subtasks',
  tags: ['Subtasks'],
  summary: 'Create a subtask',
  request: { params: taskIdParam, body: { content: { 'application/json': { schema: CreateSubtaskSchema } } } },
  responses: {
    201: { description: 'Created subtask', content: { 'application/json': { schema: SubtaskSchema } } },
    400: { description: 'Validation error', content: { 'application/json': { schema: errSchema } } },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/subtasks/{id}',
  tags: ['Subtasks'],
  summary: 'Update a subtask',
  request: { params: idParam, body: { content: { 'application/json': { schema: UpdateSubtaskSchema } } } },
  responses: {
    200: { description: 'Updated subtask', content: { 'application/json': { schema: SubtaskSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/subtasks/{id}',
  tags: ['Subtasks'],
  summary: 'Delete a subtask',
  request: { params: idParam },
  responses: {
    204: { description: 'Deleted' },
    404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
  },
});
