"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProjectSchema = exports.CreateProjectSchema = exports.ProjectSchema = void 0;
const registry_1 = require("./registry");
exports.ProjectSchema = registry_1.registry.register('Project', registry_1.z.object({
    id: registry_1.z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    name: registry_1.z.string().openapi({ example: 'My Album' }),
    description: registry_1.z.string().nullable().openapi({ example: 'A great debut album' }),
    createdAt: registry_1.z.string().openapi({ example: '2024-01-01 12:00:00' }),
    updatedAt: registry_1.z.string().openapi({ example: '2024-01-01 12:00:00' }),
}));
exports.CreateProjectSchema = registry_1.z.object({
    name: registry_1.z.string().min(1).openapi({ example: 'My Album' }),
    description: registry_1.z.string().optional().openapi({ example: 'An optional description' }),
});
exports.UpdateProjectSchema = registry_1.z.object({
    name: registry_1.z.string().min(1).optional().openapi({ example: 'Updated Name' }),
    description: registry_1.z.string().optional().openapi({ example: 'Updated description' }),
});
const idParam = registry_1.z.object({ id: registry_1.z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }) });
registry_1.registry.registerPath({
    method: 'get',
    path: '/api/projects',
    tags: ['Projects'],
    summary: 'List all projects',
    responses: {
        200: { description: 'List of projects', content: { 'application/json': { schema: registry_1.z.array(exports.ProjectSchema) } } },
    },
});
registry_1.registry.registerPath({
    method: 'post',
    path: '/api/projects',
    tags: ['Projects'],
    summary: 'Create a project',
    request: { body: { content: { 'application/json': { schema: exports.CreateProjectSchema } } } },
    responses: {
        201: { description: 'Created project', content: { 'application/json': { schema: exports.ProjectSchema } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: registry_1.z.object({ error: registry_1.z.string() }) } } },
    },
});
registry_1.registry.registerPath({
    method: 'get',
    path: '/api/projects/{id}',
    tags: ['Projects'],
    summary: 'Get a project by ID',
    request: { params: idParam },
    responses: {
        200: { description: 'Project', content: { 'application/json': { schema: exports.ProjectSchema } } },
        404: { description: 'Not found', content: { 'application/json': { schema: registry_1.z.object({ error: registry_1.z.string() }) } } },
    },
});
registry_1.registry.registerPath({
    method: 'put',
    path: '/api/projects/{id}',
    tags: ['Projects'],
    summary: 'Update a project',
    request: { params: idParam, body: { content: { 'application/json': { schema: exports.UpdateProjectSchema } } } },
    responses: {
        200: { description: 'Updated project', content: { 'application/json': { schema: exports.ProjectSchema } } },
        404: { description: 'Not found', content: { 'application/json': { schema: registry_1.z.object({ error: registry_1.z.string() }) } } },
    },
});
registry_1.registry.registerPath({
    method: 'delete',
    path: '/api/projects/{id}',
    tags: ['Projects'],
    summary: 'Delete a project',
    request: { params: idParam },
    responses: {
        204: { description: 'Deleted' },
        404: { description: 'Not found', content: { 'application/json': { schema: registry_1.z.object({ error: registry_1.z.string() }) } } },
    },
});
