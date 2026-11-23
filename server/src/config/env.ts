/**
 * Environment configuration.
 *
 * Every environment variable the server uses is read and validated HERE,
 * once, at startup. If something is missing or invalid the server refuses
 * to start with a clear message instead of failing later in odd ways.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const here = path.dirname(fileURLToPath(import.meta.url));
// The single .env file lives in the project root (dineflow/.env).
// Works both from src/config (dev) and dist/config (production build).
dotenv.config({ path: path.resolve(here, '../../../.env'), quiet: true });

const bool = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1');

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  /** API port. API_PORT wins so tools that set PORT for the frontend don't collide; hosts like Render set PORT. */
  API_PORT: z.coerce.number().int().positive().optional(),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  TEST_DATABASE_URL: z.string().optional(),
  USE_EMBEDDED_POSTGRES: bool.default(false),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(7),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(10),
  LOGIN_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().min(1).default(15),
  TRIAL_DAYS: z.coerce.number().int().min(0).max(365).default(14),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('\n❌ Invalid environment configuration (check your .env file):');
  for (const issue of parsed.error.issues) {
    console.error(`   • ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = { ...parsed.data, PORT: parsed.data.API_PORT ?? parsed.data.PORT };

if (env.NODE_ENV === 'production' && env.SESSION_SECRET.startsWith('replace_with')) {
  console.error('❌ SESSION_SECRET still has the placeholder value. Set a real secret for production.');
  process.exit(1);
}

export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

/** Browser origins allowed to call the API (CORS + CSRF origin check). */
export const allowedOrigins = env.CLIENT_ORIGIN.split(',')
  .map((o) => o.trim())
  .filter(Boolean);
