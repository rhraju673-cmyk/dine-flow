import type { NextFunction, Request, Response } from 'express';
import { appConfig } from '../config/app.config.js';
import {
  clearSessionCookie,
  findSessionByToken,
  setSessionCookie,
  touchSession,
} from '../services/session.service.js';
import { Errors } from '../utils/errors.js';

/**
 * Runs on every API request. If a valid session cookie is present it puts
 * the signed-in user on `req.auth`. It never rejects a request by itself —
 * use `requireAuth` on routes that need a signed-in user.
 */
export async function loadSession(req: Request, res: Response, next: NextFunction) {
  const token: unknown = req.cookies?.[appConfig.session.cookieName];
  if (typeof token !== 'string' || token.length < 20 || token.length > 100) return next();

  const session = await findSessionByToken(token);
  if (!session) {
    clearSessionCookie(res);
    return next();
  }

  const renewedUntil = await touchSession(session);
  if (renewedUntil) setSessionCookie(res, token, renewedUntil);

  req.auth = {
    sessionId: session.id,
    activeRestaurantId: session.activeRestaurantId,
    user: session.user,
  };
  next();
}

/** Rejects the request with 401 unless the user is signed in. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth) return next(Errors.unauthorized());
  next();
}
