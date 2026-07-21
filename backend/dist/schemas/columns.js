"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateColumnOrderSchema = exports.UpdateColumnSchema = exports.CreateColumnSchema = exports.ColumnSchema = void 0;
const registry_1 = require("./registry");
exports.ColumnSchema = registry_1.registry.register('Column', registry_1.z.object({
    id: registry_1.z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440001' }),
    projectId: registry_1.z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    name: registry_1.z.string().openapi({ example: 'In Progress' }),
    color: registry_1.z.string().nullable().openapi({ example: '#3B82F6' }),
    order: registry_1.z.number().int().openapi({ example: 1 }),
    createdAt: registry_1.z.string().openapi({ example: '2024-01-01 12:00:00' }),
}));
exports.CreateColumnSchema = registry_1.z.object({
    name: registry_1.z.string().min(1).openapi({ example: 'Mixing' }),
    color: registry_1.z.string().optional().openapi({ example: '#8B5CF6' }),
    order: registry_1.z.number().int().optional().openapi({ example: 4 }),
});
exports.UpdateColumnSchema = registry_1.z.object({
    name: registry_1.z.string().min(1).optional().openapi({ example: 'Updated Column' }),
    color: registry_1.z.string().optional().openapi({ example: '#EC4899' }),
});
exports.UpdateColumnOrderSchema = registry_1.z.object({
    order: registry_1.z.number().int().openapi({ example: 2 }),
});
const projectIdParam = registry_1.z.object({ projectId: registry_1.z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }) });
const idParam = registry_1.z.object({ id: registry_1.z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440001' }) });
const errSchema = registry_1.z.object({ error: registry_1.z.string() });
registry_1.registry.registerPath({
    method: 'get',
    path: '/api/projects/{projectId}/columns',
    tags: ['Columns'],
    summary: 'List columns for a project',
    request: { params: projectIdParam },
    responses: {
        200: { description: 'List of columns', content: { 'application/json': { schema: registry_1.z.array(exports.ColumnSchema) } } },
        404: { description: 'Project not found', content: { 'application/json': { schema: errSchema } } },
    },
});
registry_1.registry.registerPath({
    method: 'post',
    path: '/api/projects/{projectId}/columns',
    tags: ['Columns'],
    summary: 'Create a column',
    request: { params: projectIdParam, body: { content: { 'application/json': { schema: exports.CreateColumnSchema } } } },
    responses: {
        201: { description: 'Created column', content: { 'application/json': { schema: exports.ColumnSchema } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: errSchema } } },
    },
});
registry_1.registry.registerPath({
    method: 'put',
    path: '/api/columns/{id}',
    tags: ['Columns'],
    summary: 'Update a column',
    request: { params: idParam, body: { content: { 'application/json': { schema: exports.UpdateColumnSchema } } } },
    responses: {
        200: { description: 'Updated column', content: { 'application/json': { schema: exports.ColumnSchema } } },
        404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
    },
});
registry_1.registry.registerPath({
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
registry_1.registry.registerPath({
    method: 'patch',
    path: '/api/columns/{id}/order',
    tags: ['Columns'],
    summary: 'Update column order',
    request: { params: idParam, body: { content: { 'application/json': { schema: exports.UpdateColumnOrderSchema } } } },
    responses: {
        200: { description: 'Updated column', content: { 'application/json': { schema: exports.ColumnSchema } } },
        404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
    },
});
