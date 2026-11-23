import type { Request, Response } from 'express';
import { issueCsrfToken } from '../middleware/csrf.js';
import { getAuth } from '../middleware/tenant.js';
import * as authService from '../services/auth.service.js';
import {
  clearSessionCookie,
  createSession,
  deleteOtherSessions,
  deleteSession,
  setSessionCookie,
} from '../services/session.service.js';
import { Errors } from '../utils/errors.js';

/** Starts a new session for the user and sets the HTTP-only cookie. */
async function startSession(req: Request, res: Response, userId: string) {
  // If the browser already had a session, end it (prevents session fixation).
  if (req.auth) await deleteSession(req.auth.sessionId);
  const { token, session } = await createSession({
    userId,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });
  setSessionCookie(res, token, session.expiresAt);
}

/** GET /api/auth/csrf — returns a fresh CSRF token for the frontend. */
export function csrf(_req: Request, res: Response) {
  res.json({ csrfToken: issueCsrfToken(res) });
}

/** POST /api/auth/register */
export async function register(req: Request, res: Response) {
  const user = await authService.registerUser(req.body);
  await startSession(req, res, user.id);
  res.status(201).json({ user, memberships: [] });
}

/** POST /api/auth/login */
export async function login(req: Request, res: Response) {
  const user = await authService.authenticate(req.body);
  await startSession(req, res, user.id);
  const full = await authService.getUserWithMemberships(user.id);
  const { memberships = [], ...publicUser } = full ?? { ...user, memberships: [] };
  res.json({ user: publicUser, memberships });
}

/** POST /api/auth/logout */
export async function logout(req: Request, res: Response) {
  if (req.auth) await deleteSession(req.auth.sessionId);
  clearSessionCookie(res);
  res.status(204).end();
}

/** GET /api/auth/me — the signed-in user + their restaurants. */
export async function me(req: Request, res: Response) {
  const auth = getAuth(req);
  const user = await authService.getUserWithMemberships(auth.user.id);
  if (!user) throw Errors.unauthorized();
  const { memberships, ...publicUser } = user;
  res.json({ user: publicUser, memberships, activeRestaurantId: auth.activeRestaurantId });
}

/** PATCH /api/auth/me — update own profile (name). */
export async function updateMe(req: Request, res: Response) {
  const user = await authService.updateUserProfile(getAuth(req).user.id, req.body);
  res.json({ user });
}

/** POST /api/auth/change-password — also signs out all OTHER devices. */
export async function changePassword(req: Request, res: Response) {
  const auth = getAuth(req);
  await authService.changePassword(auth.user.id, req.body.currentPassword, req.body.newPassword);
  await deleteOtherSessions(auth.user.id, auth.sessionId);
  res.json({ ok: true });
}
