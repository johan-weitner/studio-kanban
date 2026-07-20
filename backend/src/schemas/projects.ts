import { registry, z } from './registry';

export const ProjectSchema = registry.register(
  'Project',
  z.object({
    id: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    name: z.string().openapi({ example: 'My Album' }),
    description: z.string().nullable().openapi({ example: 'A great debut album' }),
    createdAt: z.string().openapi({ example: '2024-01-01 12:00:00' }),
    updatedAt: z.string().openapi({ example: '2024-01-01 12:00:00' }),
  })
);

export const CreateProjectSchema = z.object({
  name: z.string().min(1).openapi({ example: 'My Album' }),
  description: z.string().optional().openapi({ example: 'An optional description' }),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).optional().openapi({ example: 'Updated Name' }),
  description: z.string().optional().openapi({ example: 'Updated description' }),
});

const idParam = z.object({ id: z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }) });

registry.registerPath({
  method: 'get',
  path: '/api/projects',
  tags: ['Projects'],
  summary: 'List all projects',
  responses: {
    200: { description: 'List of projects', content: { 'application/json': { schema: z.array(ProjectSchema) } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/projects',
  tags: ['Projects'],
  summary: 'Create a project',
  request: { body: { content: { 'application/json': { schema: CreateProjectSchema } } } },
  responses: {
    201: { description: 'Created project', content: { 'application/json': { schema: ProjectSchema } } },
    400: { description: 'Validation error', content: { 'application/json': { schema: z.object({ error: z.string() }) } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/projects/{id}',
  tags: ['Projects'],
  summary: 'Get a project by ID',
  request: { params: idParam },
  responses: {
    200: { description: 'Project', content: { 'application/json': { schema: ProjectSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: z.object({ error: z.string() }) } } },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/projects/{id}',
  tags: ['Projects'],
  summary: 'Update a project',
  request: { params: idParam, body: { content: { 'application/json': { schema: UpdateProjectSchema } } } },
  responses: {
    200: { description: 'Updated project', content: { 'application/json': { schema: ProjectSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: z.object({ error: z.string() }) } } },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/projects/{id}',
  tags: ['Projects'],
  summary: 'Delete a project',
  request: { params: idParam },
  responses: {
    204: { description: 'Deleted' },
    404: { description: 'Not found', content: { 'application/json': { schema: z.object({ error: z.string() }) } } },
  },
});
