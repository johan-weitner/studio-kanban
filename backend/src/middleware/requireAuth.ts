import type { RequestHandler } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth';
import type { User } from '../auth';

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session?.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    req.user = session.user;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
