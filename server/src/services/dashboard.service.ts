/**
 * Data for the owner dashboard "Overview" page.
 *
 * Only REAL data is returned — no invented revenue or sales numbers.
 * Revenue/orders statistics arrive with the Orders & Analytics modules.
 */
import type { MembershipRole } from '@prisma/client';
import { roleHasPermission } from '../config/permissions.js';
import { getRestaurantById } from './restaurant.service.js';

type Restaurant = Awaited<ReturnType<typeof getRestaurantById>>;

/** Profile fields that count towards "profile completion". */
function profileFields(r: Restaurant) {
  return [
    { key: 'name', complete: Boolean(r.name) },
    { key: 'category', complete: Boolean(r.category) },
    { key: 'description', complete: Boolean(r.description) },
    { key: 'logo', complete: Boolean(r.logo) },
    { key: 'coverImage', complete: Boolean(r.coverImage) },
    { key: 'phone', complete: Boolean(r.phone) },
    { key: 'email', complete: Boolean(r.email) },
    { key: 'address', complete: Boolean(r.address) },
    { key: 'openingHours', complete: Boolean(r.settings?.openingHours) },
  ];
}

export async function getDashboardOverview(params: {
  user: { id: string; name: string; email: string };
  restaurantId: string;
  role: MembershipRole;
}) {
  const restaurant = await getRestaurantById(params.restaurantId);

  const fields = profileFields(restaurant);
  const completed = fields.filter((f) => f.complete).length;
  const profilePercent = Math.round((completed / fields.length) * 100);

  // Taxes count as configured once a non-zero rate is set, or settings were saved after creation
  // (an owner may deliberately save 0 %).
  const settingsConfigured = Boolean(
    restaurant.settings &&
      (restaurant.settings.taxRate > 0 ||
        restaurant.settings.serviceCharge > 0 ||
        restaurant.settings.updatedAt.getTime() - restaurant.createdAt.getTime() > 1000),
  );

  const trialEndsAt = restaurant.subscription?.trialEndsAt ?? null;
  const trialDaysRemaining = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : null;

  /** Getting-started checklist. `available: false` = module not built yet. */
  const checklist = [
    { key: 'createAccount', complete: true, available: true },
    { key: 'createRestaurant', complete: true, available: true },
    { key: 'completeProfile', complete: profilePercent === 100, available: true },
    { key: 'configureTaxes', complete: settingsConfigured, available: true },
    { key: 'setOpeningHours', complete: Boolean(restaurant.settings?.openingHours), available: true },
    { key: 'addMenu', complete: false, available: false },
    { key: 'setupTables', complete: false, available: false },
    { key: 'inviteStaff', complete: false, available: false },
  ];
  const availableItems = checklist.filter((c) => c.available);
  const setupPercent = Math.round(
    (availableItems.filter((c) => c.complete).length / availableItems.length) * 100,
  );

  return {
    user: { id: params.user.id, name: params.user.name, email: params.user.email },
    role: params.role,
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      status: restaurant.status,
      category: restaurant.category,
      logo: restaurant.logo,
      coverImage: restaurant.coverImage,
      currency: restaurant.currency,
      timezone: restaurant.timezone,
      country: restaurant.country,
      createdAt: restaurant.createdAt,
    },
    subscription: roleHasPermission(params.role, 'subscription:read')
      ? {
          plan: restaurant.subscription?.plan ?? null,
          status: restaurant.subscription?.status ?? null,
          trialEndsAt,
          trialDaysRemaining,
        }
      : null,
    profileCompletion: { percent: profilePercent, fields },
    setup: { percent: setupPercent, checklist },
  };
}
