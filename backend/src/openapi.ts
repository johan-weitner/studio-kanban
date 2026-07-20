import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { Router } from 'express';
import { registry } from './schemas/registry';

// Import all schema files to trigger registry.register() and registry.registerPath() calls
import './schemas/projects';
import './schemas/columns';
import './schemas/songs';
import './schemas/subtasks';
import './schemas/tasks';

const generator = new OpenApiGeneratorV31(registry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: '3.1.0',
  info: {
    title: 'Studio Kanban API',
    description: 'REST API for the Studio Kanban music production board',
    version: '1.0.0',
  },
  servers: [{ url: 'http://localhost:3001', description: 'Local development' }],
});

export const openapiRouter = Router();

openapiRouter.get('/openapi.json', (_req, res) => {
  res.json(openApiDocument);
});
