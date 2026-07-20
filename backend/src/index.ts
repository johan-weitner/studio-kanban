import express from 'express';
import cors from 'cors';
import { initDb } from './db/index';
import { router } from './routes/index';
import { openapiRouter } from './openapi';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

// Initialize DB tables
initDb();

// Mount routes
app.use('/api', router);
app.use('/api', openapiRouter);

app.listen(PORT, () => {
  console.log(`Studio Kanban backend running on http://localhost:${PORT}`);
  console.log(`OpenAPI spec: http://localhost:${PORT}/api/openapi.json`);
});
