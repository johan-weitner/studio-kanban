import { writeFileSync } from 'fs';
import { join } from 'path';
import { openApiDocument } from '../openapi';

const outputPath = join(__dirname, '../../..', 'openapi.json');
writeFileSync(outputPath, JSON.stringify(openApiDocument, null, 2));
console.log(`OpenAPI spec written to ${outputPath}`);
