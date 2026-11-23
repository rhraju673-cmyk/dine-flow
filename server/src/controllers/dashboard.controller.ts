import type { Request, Response } from 'express';
import { getAuth, getTenant } from '../middleware/tenant.js';
import { getDashboardOverview } from '../services/dashboard.service.js';

/** GET /api/dashboard/overview */
export async function overview(req: Request, res: Response) {
  const auth = getAuth(req);
  const tenant = getTenant(req);
  const data = await getDashboardOverview({
    user: auth.user,
    restaurantId: tenant.restaurantId,
    role: tenant.role,
  });
  res.json(data);
}
