import { registry, z } from './registry';

export const ColumnSchema = registry.register(
  'Column',
  z.object({
    id: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440001' }),
    projectId: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    name: z.string().openapi({ example: 'In Progress' }),
    color: z.string().nullable().openapi({ example: '#3B82F6' }),
    order: z.number().int().openapi({ example: 1 }),
    createdAt: z.string().openapi({ example: '2024-01-01 12:00:00' }),
  })
);

export const CreateColumnSchema = z.object({
  name: z.string().min(1).openapi({ example: 'Mixing' }),
  color: z.string().optional().openapi({ example: '#8B5CF6' }),
  order: z.number().int().optional().openapi({ example: 4 }),
});

export const UpdateColumnSchema = z.object({
  name: z.string().min(1).optional().openapi({ example: 'Updated Column' }),
  color: z.string().optional().openapi({ example: '#EC4899' }),
});

export const UpdateColumnOrderSchema = z.object({
  order: z.number().int().openapi({ example: 2 }),
});

const projectIdParam = z.object({ projectId: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }) });
const idParam = z.object({ id: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440001' }) });
const errSchema = z.object({ error: z.string() });

registry.registerPath({
  method: 'get',
  path: '/api/projects/{projectId}/columns',
  tags: ['Columns'],
  summary: 'List columns for a project',
  request: { params: projectIdParam },
  responses: {
    200: { description: 'List of columns', content: { 'application/json': { schema: z.array(ColumnSchema) } } },
    404: { description: 'Project not found', content: { 'application/json': { schema: errSchema } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/projects/{projectId}/columns',
  tags: ['Columns'],
  summary: 'Create a column',
  request: { params: projectIdParam, body: { content: { 'application/json': { schema: CreateColumnSchema } } } },
  responses: {
    201: { description: 'Created column', content: { 'application/json': { schema: ColumnSchema } } },
    400: { description: 'Validation error', content: { 'application/json': { schema: errSchema } } },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/columns/{id}',
  tags: ['Columns'],
  summary: 'Update a column',
  request: { params: idParam, body: { content: { 'application/json': { schema: UpdateColumnSchema } } } },
  responses: {
    200: { description: 'Updated column', content: { 'application/json': { schema: ColumnSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/columns/{id}',
  tags: ['Columns'],
  summary: 'Delete a column',
  request: { params: idParam },
  responses: {
    204: { description: 'Deleted' },
    404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/columns/{id}/order',
  tags: ['Columns'],
  summary: 'Update column order',
  request: { params: idParam, body: { content: { 'application/json': { schema: UpdateColumnOrderSchema } } } },
  responses: {
    200: { description: 'Updated column', content: { 'application/json': { schema: ColumnSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
  },
});
