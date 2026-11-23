/**
 * All API routes are mounted here under /api.
 *
 * ADDING A FUTURE MODULE (e.g. Menu Management in Phase 2):
 *   1. Create routes/menu.routes.ts, controllers/menu.controller.ts,
 *      services/menu.service.ts, validators/menu.validators.ts
 *   2. Protect every route with requireAuth + requireTenant('<permission>')
 *   3. Mount it below:  router.use('/menu', menuRoutes(options));
 */
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/session.js';
import { requireTenant } from '../middleware/tenant.js';
import * as dashboard from '../controllers/dashboard.controller.js';
import { authRoutes, type AuthRouteOptions } from './auth.routes.js';
import { restaurantRoutes } from './restaurant.routes.js';

export function apiRoutes(options: AuthRouteOptions) {
  const router = Router();

  router.get('/health', async (_req, res) => {
    let database: 'up' | 'down' = 'up';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'down';
    }
    res.status(database === 'up' ? 200 : 503).json({
      status: database === 'up' ? 'ok' : 'degraded',
      service: 'dineflow-api',
      database,
      time: new Date().toISOString(),
    });
  });

  router.use('/auth', authRoutes(options));
  router.use('/restaurants', restaurantRoutes());
  router.get('/dashboard/overview', requireAuth, requireTenant('dashboard:read'), dashboard.overview);

  return router;
}
