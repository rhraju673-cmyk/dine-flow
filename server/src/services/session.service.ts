/**
 * Server-side sessions stored in PostgreSQL (table "sessions").
 *
 * The browser receives a random 256-bit token in an HTTP-only cookie.
 * The database stores only SHA-256(token), so a database leak does not
 * reveal usable session tokens.
 */
import type { Response } from 'express';
import { appConfig } from '../config/app.config.js';
import { prisma } from '../lib/prisma.js';
import { generateToken, sha256 } from '../utils/tokens.js';

const { session: cfg } = appConfig;

export async function createSession(params: {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  activeRestaurantId?: string | null;
}) {
  const token = generateToken(32);
  const session = await prisma.session.create({
    data: {
      tokenHash: sha256(token),
      userId: params.userId,
      activeRestaurantId: params.activeRestaurantId ?? null,
      ipAddress: params.ipAddress?.slice(0, 64),
      userAgent: params.userAgent?.slice(0, 300),
      expiresAt: new Date(Date.now() + cfg.ttlMs),
    },
  });
  return { token, session };
}

/** Finds a valid (non-expired) session by its raw cookie token. */
export async function findSessionByToken(token: string) {
  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: { user: { select: { id: true, name: true, email: true, platformRole: true } } },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  return session;
}

/**
 * Keeps active users signed in (rolling expiry) while limiting DB writes:
 * only touches the row every few minutes.
 */
export async function touchSession(session: { id: string; expiresAt: Date; lastUsedAt: Date }) {
  const now = Date.now();
  const remaining = session.expiresAt.getTime() - now;
  const needsRenewal = remaining < cfg.renewWhenRemainingMs;
  const needsTouch = now - session.lastUsedAt.getTime() > cfg.touchIntervalMs;
  if (!needsRenewal && !needsTouch) return null;

  const expiresAt = needsRenewal ? new Date(now + cfg.ttlMs) : session.expiresAt;
  await prisma.session.update({
    where: { id: session.id },
    data: { lastUsedAt: new Date(now), expiresAt },
  });
  return needsRenewal ? expiresAt : null;
}

export async function deleteSession(sessionId: string) {
  await prisma.session.deleteMany({ where: { id: sessionId } });
}

export async function deleteOtherSessions(userId: string, keepSessionId: string) {
  await prisma.session.deleteMany({ where: { userId, NOT: { id: keepSessionId } } });
}

export async function setActiveRestaurant(sessionId: string, restaurantId: string) {
  await prisma.session.update({ where: { id: sessionId }, data: { activeRestaurantId: restaurantId } });
}

/** Removes expired sessions. Called periodically by the server. */
export async function purgeExpiredSessions() {
  const { count } = await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return count;
}

export function setSessionCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(cfg.cookieName, token, {
    httpOnly: true, // not readable by JavaScript → protects against XSS token theft
    secure: cfg.secureCookie, // HTTPS-only in production
    sameSite: 'lax', // not sent on cross-site POSTs
    path: '/',
    expires: expiresAt,
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(cfg.cookieName, {
    httpOnly: true,
    secure: cfg.secureCookie,
    sameSite: 'lax',
    path: '/',
  });
}
