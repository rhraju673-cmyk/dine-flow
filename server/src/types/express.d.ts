import type { MembershipRole, PlatformRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      /** Set by loadSession when a valid session cookie is present. */
      auth?: {
        sessionId: string;
        activeRestaurantId: string | null;
        user: { id: string; name: string; email: string; platformRole: PlatformRole };
      };
      /** Set by requireTenant — the restaurant this request is allowed to act on. */
      tenant?: {
        restaurantId: string;
        role: MembershipRole;
      };
    }
  }
}

export {};
