import { Router } from 'express';
import * as auth from '../controllers/auth.controller.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/session.js';
import { validateBody } from '../middleware/validate.js';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from '../validators/auth.validators.js';

export interface AuthRouteOptions {
  loginRateLimit: { max: number; windowMs: number };
  registerRateLimit: { max: number; windowMs: number };
}

export function authRoutes(options: AuthRouteOptions) {
  const router = Router();

  const loginLimiter = createRateLimiter({
    ...options.loginRateLimit,
    message: 'Too many login attempts. Please wait a few minutes and try again.',
  });
  const registerLimiter = createRateLimiter({
    ...options.registerRateLimit,
    message: 'Too many sign-up attempts. Please try again later.',
  });

  router.get('/csrf', auth.csrf);
  router.post('/register', registerLimiter, validateBody(registerSchema), auth.register);
  router.post('/login', loginLimiter, validateBody(loginSchema), auth.login);
  router.post('/logout', auth.logout);
  router.get('/me', requireAuth, auth.me);
  router.patch('/me', requireAuth, validateBody(updateProfileSchema), auth.updateMe);
  router.post('/change-password', requireAuth, loginLimiter, validateBody(changePasswordSchema), auth.changePassword);

  return router;
}
