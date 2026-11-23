import type { Request, Response } from 'express';
import { getAuth, getTenant } from '../middleware/tenant.js';
import * as restaurantService from '../services/restaurant.service.js';
import { setActiveRestaurant } from '../services/session.service.js';

/** POST /api/restaurants — onboarding: create a restaurant owned by the current user. */
export async function create(req: Request, res: Response) {
  const auth = getAuth(req);
  const restaurant = await restaurantService.createRestaurantForOwner(auth.user.id, req.body);
  await setActiveRestaurant(auth.sessionId, restaurant.id);
  res.status(201).json({ restaurant, role: 'RESTAURANT_OWNER' });
}

/** GET /api/restaurants/current and GET /api/restaurants/:restaurantId */
export async function getCurrent(req: Request, res: Response) {
  const tenant = getTenant(req);
  const restaurant = await restaurantService.getRestaurantById(tenant.restaurantId);
  res.json({ restaurant, role: tenant.role });
}

/** PATCH /api/restaurants/current */
export async function updateCurrent(req: Request, res: Response) {
  const tenant = getTenant(req);
  const restaurant = await restaurantService.updateRestaurant(tenant.restaurantId, req.body);
  res.json({ restaurant, role: tenant.role });
}

/** POST /api/restaurants/:restaurantId/activate — switch the working restaurant. */
export async function activate(req: Request, res: Response) {
  const tenant = getTenant(req);
  await setActiveRestaurant(getAuth(req).sessionId, tenant.restaurantId);
  res.json({ activeRestaurantId: tenant.restaurantId });
}
