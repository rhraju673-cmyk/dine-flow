import { Router } from 'express';
import * as restaurants from '../controllers/restaurant.controller.js';
import { requireAuth } from '../middleware/session.js';
import { requireTenant } from '../middleware/tenant.js';
import { validateBody } from '../middleware/validate.js';
import { createRestaurantSchema, updateRestaurantSchema } from '../validators/restaurant.validators.js';

export function restaurantRoutes() {
  const router = Router();

  // Every restaurant route requires a signed-in user.
  router.use(requireAuth);

  router.post('/', validateBody(createRestaurantSchema), restaurants.create);

  // "current" = the restaurant chosen by requireTenant (see middleware/tenant.ts)
  router.get('/current', requireTenant('restaurant:read'), restaurants.getCurrent);
  router.patch(
    '/current',
    requireTenant('restaurant:update'),
    validateBody(updateRestaurantSchema),
    restaurants.updateCurrent,
  );

  // Explicit restaurant id — membership is verified by requireTenant.
  router.get('/:restaurantId', requireTenant('restaurant:read'), restaurants.getCurrent);
  router.post('/:restaurantId/activate', requireTenant('restaurant:read'), restaurants.activate);

  return router;
}
