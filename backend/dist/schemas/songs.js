"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSongOrderSchema = exports.UpdateSongSchema = exports.CreateSongSchema = exports.SongSchema = void 0;
const registry_1 = require("./registry");
exports.SongSchema = registry_1.registry.register('Song', registry_1.z.object({
    id: registry_1.z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440002' }),
    projectId: registry_1.z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    title: registry_1.z.string().openapi({ example: 'Track 1' }),
    description: registry_1.z.string().nullable().openapi({ example: 'Upbeat intro track' }),
    order: registry_1.z.number().int().openapi({ example: 0 }),
    createdAt: registry_1.z.string().openapi({ example: '2024-01-01 12:00:00' }),
    updatedAt: registry_1.z.string().openapi({ example: '2024-01-01 12:00:00' }),
}));
exports.CreateSongSchema = registry_1.z.object({
    title: registry_1.z.string().min(1).openapi({ example: 'Track 1' }),
    description: registry_1.z.string().optional().openapi({ example: 'An optional description' }),
});
exports.UpdateSongSchema = registry_1.z.object({
    title: registry_1.z.string().min(1).optional().openapi({ example: 'Updated Title' }),
    description: registry_1.z.string().optional().openapi({ example: 'Updated description' }),
});
exports.UpdateSongOrderSchema = registry_1.z.object({
    order: registry_1.z.number().int().openapi({ example: 2 }),
});
const projectIdParam = registry_1.z.object({ projectId: registry_1.z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }) });
const idParam = registry_1.z.object({ id: registry_1.z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440002' }) });
const errSchema = registry_1.z.object({ error: registry_1.z.string() });
registry_1.registry.registerPath({
    method: 'get',
    path: '/api/projects/{projectId}/songs',
    tags: ['Songs'],
    summary: 'List songs for a project',
    request: { params: projectIdParam },
    responses: {
        200: { description: 'List of songs', content: { 'application/json': { schema: registry_1.z.array(exports.SongSchema) } } },
    },
});
registry_1.registry.registerPath({
    method: 'post',
    path: '/api/projects/{projectId}/songs',
    tags: ['Songs'],
    summary: 'Create a song',
    request: { params: projectIdParam, body: { content: { 'application/json': { schema: exports.CreateSongSchema } } } },
    responses: {
        201: { description: 'Created song', content: { 'application/json': { schema: exports.SongSchema } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: errSchema } } },
    },
});
registry_1.registry.registerPath({
    method: 'put',
    path: '/api/songs/{id}',
    tags: ['Songs'],
    summary: 'Update a song',
    request: { params: idParam, body: { content: { 'application/json': { schema: exports.UpdateSongSchema } } } },
    responses: {
        200: { description: 'Updated song', content: { 'application/json': { schema: exports.SongSchema } } },
        404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
    },
});
registry_1.registry.registerPath({
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
registry_1.registry.registerPath({
    method: 'patch',
    path: '/api/songs/{id}/order',
    tags: ['Songs'],
    summary: 'Update song order',
    request: { params: idParam, body: { content: { 'application/json': { schema: exports.UpdateSongOrderSchema } } } },
    responses: {
        200: { description: 'Updated song', content: { 'application/json': { schema: exports.SongSchema } } },
        404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
    },
});
