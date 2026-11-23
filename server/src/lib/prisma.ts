import { PrismaClient } from '@prisma/client';
import { isProduction } from '../config/env.js';

/**
 * One shared Prisma client for the whole server.
 * (In development `tsx watch` restarts the process, so no extra caching is needed.)
 */
export const prisma = new PrismaClient({
  log: isProduction ? ['error'] : ['warn', 'error'],
});
