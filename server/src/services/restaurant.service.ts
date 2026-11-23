import { Prisma } from '@prisma/client';
import { appConfig } from '../config/app.config.js';
import { prisma } from '../lib/prisma.js';
import { Errors } from '../utils/errors.js';
import { slugify, slugSuffix } from '../utils/slug.js';
import type { CreateRestaurantInput, UpdateRestaurantInput } from '../validators/restaurant.validators.js';

const restaurantInclude = {
  settings: true,
  subscription: true,
} satisfies Prisma.RestaurantInclude;

type RestaurantWithRelations = Prisma.RestaurantGetPayload<{ include: typeof restaurantInclude }>;

/** Shapes a restaurant for the API (Decimal → number, consistent field names). */
export function serializeRestaurant(r: RestaurantWithRelations) {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    category: r.category,
    description: r.description,
    logo: r.logo,
    coverImage: r.coverImage,
    phone: r.phone,
    email: r.email,
    address: r.address,
    country: r.country,
    currency: r.currency,
    timezone: r.timezone,
    status: r.status,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    settings: r.settings && {
      taxRate: r.settings.taxRate.toNumber(),
      serviceCharge: r.settings.serviceCharge.toNumber(),
      openingHours: r.settings.openingHours,
      updatedAt: r.settings.updatedAt,
    },
    subscription: r.subscription && {
      plan: r.subscription.plan,
      status: r.subscription.status,
      trialEndsAt: r.subscription.trialEndsAt,
    },
  };
}

/** Finds a free slug: "zaika-restaurant", then "zaika-restaurant-3f9a1c", ... */
async function generateUniqueSlug(tx: Prisma.TransactionClient, name: string) {
  const base = slugify(name);
  if (!(await tx.restaurant.findUnique({ where: { slug: base }, select: { id: true } }))) return base;
  for (let i = 0; i < 5; i++) {
    const candidate = `${base}-${slugSuffix()}`;
    if (!(await tx.restaurant.findUnique({ where: { slug: candidate }, select: { id: true } }))) return candidate;
  }
  throw new Error('Could not generate a unique slug');
}

/**
 * Onboarding: creates the restaurant AND everything that must exist with it,
 * in ONE database transaction. Either all rows are created or none are.
 *   • Restaurant
 *   • RestaurantMembership (the creator becomes RESTAURANT_OWNER)
 *   • RestaurantSettings (defaults)
 *   • Subscription (free trial)
 */
export async function createRestaurantForOwner(userId: string, input: CreateRestaurantInput) {
  const trialEndsAt = new Date(Date.now() + appConfig.trial.days * 24 * 60 * 60 * 1000);

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const restaurant = await prisma.$transaction(async (tx) => {
        const slug = await generateUniqueSlug(tx, input.name);
        return tx.restaurant.create({
          data: {
            name: input.name,
            slug,
            category: input.category,
            phone: input.phone,
            email: input.email,
            address: input.address,
            country: input.country,
            currency: input.currency,
            timezone: input.timezone,
            // The role is decided HERE on the server — never taken from the request.
            memberships: { create: { userId, role: 'RESTAURANT_OWNER' } },
            settings: { create: {} },
            subscription: {
              create: { plan: appConfig.trial.plan, status: 'TRIALING', trialEndsAt },
            },
          },
          include: restaurantInclude,
        });
      });
      return serializeRestaurant(restaurant);
    } catch (err) {
      // Another request grabbed the same slug between our check and insert → retry.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002' && attempt < 2) continue;
      throw err;
    }
  }
  throw new Error('unreachable');
}

/** Reads ONE restaurant. Callers must pass a tenant-verified id (req.tenant.restaurantId). */
export async function getRestaurantById(restaurantId: string) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId }, include: restaurantInclude });
  if (!restaurant) throw Errors.notFound('Restaurant not found');
  return serializeRestaurant(restaurant);
}

/** Updates profile + settings in one transaction. `restaurantId` must come from req.tenant. */
export async function updateRestaurant(restaurantId: string, input: UpdateRestaurantInput) {
  const { settings, ...profile } = input;
  const restaurant = await prisma.$transaction(async (tx) => {
    if (settings && Object.keys(settings).length > 0) {
      await tx.restaurantSettings.upsert({
        where: { restaurantId },
        create: {
          restaurantId,
          taxRate: settings.taxRate ?? 0,
          serviceCharge: settings.serviceCharge ?? 0,
          openingHours: settings.openingHours ?? Prisma.DbNull,
        },
        update: {
          ...(settings.taxRate !== undefined && { taxRate: settings.taxRate }),
          ...(settings.serviceCharge !== undefined && { serviceCharge: settings.serviceCharge }),
          ...(settings.openingHours !== undefined && {
            openingHours: settings.openingHours ?? Prisma.DbNull,
          }),
        },
      });
    }
    return tx.restaurant.update({
      where: { id: restaurantId },
      data: profile,
      include: restaurantInclude,
    });
  });
  return serializeRestaurant(restaurant);
}
