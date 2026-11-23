/**
 * TENANT AUTHORIZATION — the most important security layer in DineFlow.
 *
 * Usage on any route that touches private restaurant data:
 *
 *   router.get('/menu', requireAuth, requireTenant('menu:manage'), handler)
 *
 * Inside the handler, ALWAYS use `req.tenant.restaurantId` in your database
 * queries (never an id taken from the request body). That guarantees one
 * restaurant can never read or change another restaurant's data.
 *
 * Which restaurant does a request target?
 *   1. `:restaurantId` route parameter, if the route has one;
 *   2. otherwise the `X-Restaurant-Id` header, if sent;
 *   3. otherwise the restaurant saved on the session (last one used);
 *   4. otherwise the user's first restaurant.
 *
 * In every case the user's membership is verified IN THE DATABASE, and the
 * membership role must grant the requested permission. Roles sent by the
 * frontend are never trusted.
 */
import type { NextFunction, Request, Response } from 'express';
import { roleHasPermission, type Permission } from '../config/permissions.js';
import { prisma } from '../lib/prisma.js';
import { Errors } from '../utils/errors.js';

const NO_ACCESS = () =>
  Errors.forbidden('You do not have access to this restaurant', 'TENANT_ACCESS_DENIED');

export function requireTenant(permission: Permission) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(Errors.unauthorized());
    const userId = req.auth.user.id;

    const paramId = typeof req.params.restaurantId === 'string' ? req.params.restaurantId : undefined;
    const headerId = req.get('x-restaurant-id')?.trim() || undefined;
    const explicitId = paramId ?? headerId;

    let membership: { restaurantId: string; role: import('@prisma/client').MembershipRole } | null = null;

    if (explicitId) {
      // The caller explicitly asked for a restaurant → it MUST be one of theirs.
      // We answer "forbidden" whether or not the restaurant exists, so the
      // response does not reveal which restaurant ids are valid.
      if (explicitId.length > 64) return next(NO_ACCESS());
      membership = await prisma.restaurantMembership.findUnique({
        where: { userId_restaurantId: { userId, restaurantId: explicitId } },
        select: { restaurantId: true, role: true },
      });
      if (!membership) return next(NO_ACCESS());
    } else {
      if (req.auth.activeRestaurantId) {
        membership = await prisma.restaurantMembership.findUnique({
          where: { userId_restaurantId: { userId, restaurantId: req.auth.activeRestaurantId } },
          select: { restaurantId: true, role: true },
        });
      }
      membership ??= await prisma.restaurantMembership.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: { restaurantId: true, role: true },
      });
      if (!membership) {
        return next(
          Errors.notFound('You have not set up a restaurant yet', 'NO_RESTAURANT'),
        );
      }
    }

    if (!roleHasPermission(membership.role, permission)) {
      return next(Errors.forbidden('Your role does not allow this action', 'INSUFFICIENT_ROLE'));
    }

    req.tenant = { restaurantId: membership.restaurantId, role: membership.role };
    next();
  };
}

/** Helper for handlers: returns the verified tenant or throws. */
export function getTenant(req: Request) {
  if (!req.tenant) throw new Error('requireTenant() middleware is missing on this route');
  return req.tenant;
}

/** Helper for handlers: returns the signed-in user or throws. */
export function getAuth(req: Request) {
  if (!req.auth) throw Errors.unauthorized();
  return req.auth;
}
