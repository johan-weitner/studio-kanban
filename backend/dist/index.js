"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_1 = require("./db/index");
const index_2 = require("./routes/index");
const openapi_1 = require("./openapi");
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize DB tables
(0, index_1.initDb)();
// Mount routes
app.use('/api', index_2.router);
app.use('/api', openapi_1.openapiRouter);
app.listen(PORT, () => {
    console.log(`Studio Kanban backend running on http://localhost:${PORT}`);
    console.log(`OpenAPI spec: http://localhost:${PORT}/api/openapi.json`);
});
