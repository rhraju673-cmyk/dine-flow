/**
 * Role-based permissions inside a restaurant (tenant).
 *
 * Routes never check role names directly — they ask for a PERMISSION, e.g.
 *   requireTenant('restaurant:update')
 * and this table decides which roles have it. To give a role more power,
 * add it to the list below. Future modules (menu, orders, kitchen...) add
 * their own permissions here.
 */
import type { MembershipRole } from '@prisma/client';

const OWNER: MembershipRole = 'RESTAURANT_OWNER';
const MANAGER: MembershipRole = 'RESTAURANT_MANAGER';
const KITCHEN: MembershipRole = 'KITCHEN_STAFF';
const WAITER: MembershipRole = 'WAITER';

export const PERMISSIONS = {
  // Phase 1
  'restaurant:read': [OWNER, MANAGER, KITCHEN, WAITER],
  'restaurant:update': [OWNER, MANAGER],
  'dashboard:read': [OWNER, MANAGER, KITCHEN, WAITER],
  'subscription:read': [OWNER, MANAGER],

  // Reserved for future phases (not used by any route yet)
  'menu:manage': [OWNER, MANAGER],
  'tables:manage': [OWNER, MANAGER],
  'orders:read': [OWNER, MANAGER, KITCHEN, WAITER],
  'orders:update': [OWNER, MANAGER, KITCHEN, WAITER],
  'staff:manage': [OWNER],
  'billing:manage': [OWNER],
} as const satisfies Record<string, readonly MembershipRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export function roleHasPermission(role: MembershipRole, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly MembershipRole[]).includes(role);
}
