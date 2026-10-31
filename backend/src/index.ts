import "dotenv/config";
import path from "node:path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { demoUser, isDemoMode } from "./config/runtime";
import { backfillProjectOwners, initDb, sqlite } from "./db/index";
import { openapiRouter } from "./openapi";
import { router } from "./routes/index";
type BetterAuthMigrationModule = typeof import("better-auth/db/migration");
type BetterAuthNodeModule = typeof import("better-auth/node");
type AuthModule = typeof import("./auth");

const app = express();
const PORT = process.env.PORT ?? 3001;
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				...helmet.contentSecurityPolicy.getDefaultDirectives(),
				"script-src": ["'self'", "https://w.soundcloud.com"],
				"frame-src": ["'self'", "https://w.soundcloud.com"],
				"img-src": [
					"'self'",
					"data:",
					"https://*.sndcdn.com",
					"https://*.googleusercontent.com",
				],
			},
		},
	}),
);

app.use(
	cors({
		origin: process.env.BETTER_AUTH_URL ?? "http://localhost:5173",
		credentials: true,
	}),
);
app.use(express.json({ limit: "100kb" }));
app.get("/api/health", (_req, res) => {
	try {
		sqlite.prepare("SELECT 1").get();
		return res.status(200).json({ status: "ok" });
	} catch {
		return res.status(503).json({ status: "unavailable" });
	}
});

async function startServer() {
	// Initialize app DB tables
	initDb();
	if (isDemoMode) {
		backfillProjectOwners(demoUser.id);
	} else {
		const { toNodeHandler } =
			require("better-auth/node") as BetterAuthNodeModule;
		const { getMigrations } =
			require("better-auth/db/migration") as BetterAuthMigrationModule;
		const { auth, authOptions } = require("./auth") as AuthModule;

		// Auth handler — must be mounted BEFORE the API router
		app.all("/api/auth/*", toNodeHandler(auth));

		// Run better-auth schema migrations — automatically applies any new
		// columns/tables added in newer better-auth releases (e.g. account.issuer).
		const { runMigrations } = await getMigrations(authOptions);
		await runMigrations();
	}

	// Mount routes after the optional Better Auth handler.
	app.use("/api", router);
	app.use("/api", openapiRouter);

	if (process.env.NODE_ENV === "production") {
		const publicDir = path.resolve(__dirname, "../public");

		app.use(express.static(publicDir));
		app.get("*", (req, res, next) => {
			if (req.path.startsWith("/api")) {
				return next();
			}

			return res.sendFile(path.join(publicDir, "index.html"));
		});
	}
	app.listen(PORT, () => {
		console.log(`Studio Kanban backend running on http://localhost:${PORT}`);
		console.log(`OpenAPI spec: http://localhost:${PORT}/api/openapi.json`);
	});
}

startServer().catch((err) => {
	console.error("Failed to start server:", err);
	process.exit(1);
});
