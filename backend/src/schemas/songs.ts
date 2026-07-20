import { registry, z } from './registry';

export const SongSchema = registry.register(
  'Song',
  z.object({
    id: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440002' }),
    projectId: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    title: z.string().openapi({ example: 'Track 1' }),
    description: z.string().nullable().openapi({ example: 'Upbeat intro track' }),
    order: z.number().int().openapi({ example: 0 }),
    createdAt: z.string().openapi({ example: '2024-01-01 12:00:00' }),
    updatedAt: z.string().openapi({ example: '2024-01-01 12:00:00' }),
  })
);

export const CreateSongSchema = z.object({
  title: z.string().min(1).openapi({ example: 'Track 1' }),
  description: z.string().optional().openapi({ example: 'An optional description' }),
});

export const UpdateSongSchema = z.object({
  title: z.string().min(1).optional().openapi({ example: 'Updated Title' }),
  description: z.string().optional().openapi({ example: 'Updated description' }),
});

export const UpdateSongOrderSchema = z.object({
  order: z.number().int().openapi({ example: 2 }),
});

const projectIdParam = z.object({ projectId: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }) });
const idParam = z.object({ id: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440002' }) });
const errSchema = z.object({ error: z.string() });

registry.registerPath({
  method: 'get',
  path: '/api/projects/{projectId}/songs',
  tags: ['Songs'],
  summary: 'List songs for a project',
  request: { params: projectIdParam },
  responses: {
    200: { description: 'List of songs', content: { 'application/json': { schema: z.array(SongSchema) } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/projects/{projectId}/songs',
  tags: ['Songs'],
  summary: 'Create a song',
  request: { params: projectIdParam, body: { content: { 'application/json': { schema: CreateSongSchema } } } },
  responses: {
    201: { description: 'Created song', content: { 'application/json': { schema: SongSchema } } },
    400: { description: 'Validation error', content: { 'application/json': { schema: errSchema } } },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/songs/{id}',
  tags: ['Songs'],
  summary: 'Update a song',
  request: { params: idParam, body: { content: { 'application/json': { schema: UpdateSongSchema } } } },
  responses: {
    200: { description: 'Updated song', content: { 'application/json': { schema: SongSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/songs/{id}',
  tags: ['Songs'],
  summary: 'Delete a song',
  request: { params: idParam },
  responses: {
    204: { description: 'Deleted' },
    404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/songs/{id}/order',
  tags: ['Songs'],
  summary: 'Update song order',
  request: { params: idParam, body: { content: { 'application/json': { schema: UpdateSongOrderSchema } } } },
  responses: {
    200: { description: 'Updated song', content: { 'application/json': { schema: SongSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
  },
});
