"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const openapi_1 = require("../openapi");
const outputPath = (0, path_1.join)(__dirname, '../../..', 'openapi.json');
(0, fs_1.writeFileSync)(outputPath, JSON.stringify(openapi_1.openApiDocument, null, 2));
console.log(`OpenAPI spec written to ${outputPath}`);
