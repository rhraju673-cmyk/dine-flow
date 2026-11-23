/**
 * CSRF protection — "signed double-submit cookie" pattern + Origin check.
 *
 * 1. The browser calls GET /api/auth/csrf. The server creates a token
 *    "<random>.<HMAC(secret, random)>", stores it in an HTTP-only cookie
 *    and returns the same token in the JSON body.
 * 2. The frontend sends that token in the "X-CSRF-Token" header on every
 *    state-changing request (POST / PUT / PATCH / DELETE).
 * 3. The server checks: header === cookie AND the HMAC signature is valid.
 *
 * A malicious website cannot read the token (same-origin policy), so it
 * cannot forge the header. The HMAC prevents attackers from planting their
 * own cookie value. On top of that, requests whose Origin header is not in
 * CLIENT_ORIGIN are rejected, and the session cookie uses SameSite=Lax.
 */
import type { NextFunction, Request, Response } from 'express';
import { appConfig } from '../config/app.config.js';
import { allowedOrigins, env } from '../config/env.js';
import { Errors } from '../utils/errors.js';
import { generateToken, hmac, safeEqual } from '../utils/tokens.js';

const { cookieName, headerName } = appConfig.csrf;
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function issueCsrfToken(res: Response): string {
  const random = generateToken(24);
  const token = `${random}.${hmac(env.SESSION_SECRET, random)}`;
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: appConfig.session.secureCookie,
    sameSite: 'strict',
    path: '/',
  });
  return token;
}

function isValidSignedToken(token: string): boolean {
  const [random, signature, extra] = token.split('.');
  if (!random || !signature || extra !== undefined) return false;
  return safeEqual(signature, hmac(env.SESSION_SECRET, random));
}

export function csrfProtection(req: Request, _res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) return next();

  // Origin check (browsers always send Origin on cross-site POST/PATCH/DELETE).
  const origin = req.get('origin');
  if (origin && !allowedOrigins.includes(origin)) {
    return next(Errors.forbidden('Request origin is not allowed', 'CSRF_ORIGIN_MISMATCH'));
  }

  const header = req.get(headerName);
  const cookie: unknown = req.cookies?.[cookieName];
  if (
    typeof header !== 'string' ||
    typeof cookie !== 'string' ||
    !safeEqual(header, cookie) ||
    !isValidSignedToken(cookie)
  ) {
    return next(Errors.forbidden('Security token missing or invalid. Please refresh the page.', 'CSRF_INVALID'));
  }
  next();
}
