import type { RequestHandler } from "express";
import { demoUser, isDemoMode } from "../config/runtime";
type AuthModule = typeof import("../auth");
type BetterAuthNodeModule = typeof import("better-auth/node");

interface RequestUser {
	id: string;
	name: string;
	image?: string | null;
}

// Extend Express Request to carry the authenticated user
declare global {
	namespace Express {
		interface Request {
			user: RequestUser;
		}
	}
}

export const requireAuth: RequestHandler = async (req, res, next) => {
	if (isDemoMode) {
		req.user = demoUser;
		next();
		return;
	}
	try {
		const { fromNodeHeaders } =
			require("better-auth/node") as BetterAuthNodeModule;
		const { auth } = require("../auth") as AuthModule;
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(req.headers),
		});
		if (!session?.user) {
			res.status(401).json({ error: "Unauthorized" });
			return;
		}
		req.user = session.user;
		next();
	} catch {
		res.status(401).json({ error: "Unauthorized" });
	}
};
