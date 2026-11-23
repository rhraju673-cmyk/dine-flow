import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/errors.js';

/**
 * Creates a rate limiter that responds in DineFlow's standard error format.
 * Counters are kept in memory (fine for a single server). For multiple
 * servers, plug in a shared store (Redis/PostgreSQL) — see express-rate-limit docs.
 */
export function createRateLimiter(options: { max: number; windowMs: number; message: string }) {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => next(new AppError(429, 'TOO_MANY_REQUESTS', options.message)),
  });
}
