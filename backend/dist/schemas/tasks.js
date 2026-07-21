"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveTaskSchema = exports.UpdateTaskSchema = exports.CreateTaskSchema = exports.TaskSchema = void 0;
const registry_1 = require("./registry");
const subtasks_1 = require("./subtasks");
exports.TaskSchema = registry_1.registry.register('Task', registry_1.z.object({
    id: registry_1.z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440003' }),
    songId: registry_1.z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440002' }),
    columnId: registry_1.z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440001' }),
    title: registry_1.z.string().openapi({ example: 'Record drums' }),
    description: registry_1.z.string().nullable().openapi({ example: 'Record kick and snare tracks' }),
    assignee: registry_1.z.string().nullable().openapi({ example: 'Alice' }),
    order: registry_1.z.number().int().openapi({ example: 0 }),
    createdAt: registry_1.z.string().openapi({ example: '2024-01-01 12:00:00' }),
    updatedAt: registry_1.z.string().openapi({ example: '2024-01-01 12:00:00' }),
    subtasks: registry_1.z.array(subtasks_1.SubtaskSchema).openapi({ description: 'Subtasks for this task' }),
}));
exports.CreateTaskSchema = registry_1.z.object({
    columnId: registry_1.z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440001' }),
    title: registry_1.z.string().min(1).openapi({ example: 'Record drums' }),
    description: registry_1.z.string().optional().openapi({ example: 'Record kick and snare' }),
    assignee: registry_1.z.string().optional().openapi({ example: 'Alice' }),
});
exports.UpdateTaskSchema = registry_1.z.object({
    title: registry_1.z.string().min(1).optional().openapi({ example: 'Updated Title' }),
    description: registry_1.z.string().optional().openapi({ example: 'Updated description' }),
    assignee: registry_1.z.string().optional().openapi({ example: 'Bob' }),
    columnId: registry_1.z.string().optional().openapi({ example: '550e8400-e29b-41d4-a716-446655440001' }),
    order: registry_1.z.number().int().optional().openapi({ example: 1 }),
});
exports.MoveTaskSchema = registry_1.z.object({
    columnId: registry_1.z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440001' }),
    songId: registry_1.z.string().optional().openapi({ example: '550e8400-e29b-41d4-a716-446655440002' }),
    order: registry_1.z.number().int().optional().openapi({ example: 0 }),
});
const songIdParam = registry_1.z.object({ songId: registry_1.z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440002' }) });
const idParam = registry_1.z.object({ id: registry_1.z.string().openapi({ example: '550e8400-e29b-41d4-a716-446655440003' }) });
const errSchema = registry_1.z.object({ error: registry_1.z.string() });
registry_1.registry.registerPath({
    method: 'get',
    path: '/api/songs/{songId}/tasks',
    tags: ['Tasks'],
    summary: 'List tasks for a song (with subtasks)',
    request: { params: songIdParam },
    responses: {
        200: { description: 'List of tasks with subtasks', content: { 'application/json': { schema: registry_1.z.array(exports.TaskSchema) } } },
    },
});
registry_1.registry.registerPath({
    method: 'post',
    path: '/api/songs/{songId}/tasks',
    tags: ['Tasks'],
    summary: 'Create a task for a song',
    request: { params: songIdParam, body: { content: { 'application/json': { schema: exports.CreateTaskSchema } } } },
    responses: {
        201: { description: 'Created task', content: { 'application/json': { schema: exports.TaskSchema } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: errSchema } } },
        404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
    },
});
registry_1.registry.registerPath({
    method: 'get',
    path: '/api/tasks/{id}',
    tags: ['Tasks'],
    summary: 'Get a task by ID (with subtasks)',
    request: { params: idParam },
    responses: {
        200: { description: 'Task with subtasks', content: { 'application/json': { schema: exports.TaskSchema } } },
        404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
    },
});
registry_1.registry.registerPath({
    method: 'put',
    path: '/api/tasks/{id}',
    tags: ['Tasks'],
    summary: 'Update a task',
    request: { params: idParam, body: { content: { 'application/json': { schema: exports.UpdateTaskSchema } } } },
    responses: {
        200: { description: 'Updated task', content: { 'application/json': { schema: exports.TaskSchema } } },
        404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
    },
});
registry_1.registry.registerPath({
    method: 'patch',
    path: '/api/tasks/{id}/move',
    tags: ['Tasks'],
    summary: 'Move a task to a different column or song',
    request: { params: idParam, body: { content: { 'application/json': { schema: exports.MoveTaskSchema } } } },
    responses: {
        200: { description: 'Moved task', content: { 'application/json': { schema: exports.TaskSchema } } },
        400: { description: 'Column/project mismatch', content: { 'application/json': { schema: errSchema } } },
        404: { description: 'Not found', content: { 'application/json': { schema: errSchema } } },
    },
});
registry_1.registry.registerPath({
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
