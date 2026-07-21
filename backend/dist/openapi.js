"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openapiRouter = exports.openApiDocument = void 0;
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
const express_1 = require("express");
const registry_1 = require("./schemas/registry");
// Import all schema files to trigger registry.register() and registry.registerPath() calls
require("./schemas/projects");
require("./schemas/columns");
require("./schemas/songs");
require("./schemas/subtasks");
require("./schemas/tasks");
const generator = new zod_to_openapi_1.OpenApiGeneratorV31(registry_1.registry.definitions);
exports.openApiDocument = generator.generateDocument({
    openapi: '3.1.0',
    info: {
        title: 'Studio Kanban API',
        description: 'REST API for the Studio Kanban music production board',
        version: '1.0.0',
    },
    servers: [{ url: 'http://localhost:3001', description: 'Local development' }],
});
exports.openapiRouter = (0, express_1.Router)();
exports.openapiRouter.get('/openapi.json', (_req, res) => {
    res.json(exports.openApiDocument);
});
