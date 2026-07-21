import express from 'express';
import cors from 'cors';
import path from 'path';
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

if (process.env.NODE_ENV === 'production') {
  const publicDir = path.resolve(__dirname, '../public');

  app.use(express.static(publicDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }

    return res.sendFile(path.join(publicDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Studio Kanban backend running on http://localhost:${PORT}`);
  console.log(`OpenAPI spec: http://localhost:${PORT}/api/openapi.json`);
});
