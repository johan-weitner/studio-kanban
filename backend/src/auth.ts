import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { sqlite } from './db/index';

export const authOptions: BetterAuthOptions = {
  database: sqlite,
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:5173',
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? 'http://localhost:5173',
    'https://studiokanban.se',
    'https://www.studiokanban.se',
    'https://localhost:5173',
    'http://localhost:3001',
  ],
};

export const auth = betterAuth(authOptions);

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
