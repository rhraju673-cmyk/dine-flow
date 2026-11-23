import { z } from 'zod';
import {
  countrySchema,
  currencySchema,
  emailSchema,
  imageUrlSchema,
  openingHoursSchema,
  optionalText,
  percentageSchema,
  phoneSchema,
  restaurantCategorySchema,
  timezoneSchema,
} from './common.js';

/** Onboarding wizard payload (POST /api/restaurants). */
export const createRestaurantSchema = z.object({
  name: z.string().trim().min(2, 'Restaurant name must be at least 2 characters').max(120),
  category: restaurantCategorySchema,
  phone: phoneSchema,
  email: emailSchema,
  address: z.string().trim().min(5, 'Enter the full address').max(300),
  country: countrySchema,
  currency: currencySchema,
  timezone: timezoneSchema,
});

/**
 * Profile update payload (PATCH /api/restaurants/current).
 * Every field is optional; only provided fields are changed.
 * `slug`, `status` and ownership can NOT be changed here.
 */
export const updateRestaurantSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    category: restaurantCategorySchema.optional(),
    description: optionalText(1000),
    logo: imageUrlSchema,
    coverImage: imageUrlSchema,
    phone: phoneSchema.nullable().optional().or(z.literal('').transform(() => null)),
    email: emailSchema.nullable().optional().or(z.literal('').transform(() => null)),
    address: optionalText(300),
    country: countrySchema.optional(),
    currency: currencySchema.optional(),
    timezone: timezoneSchema.optional(),
    settings: z
      .object({
        taxRate: percentageSchema.optional(),
        serviceCharge: percentageSchema.optional(),
        openingHours: openingHoursSchema.nullable().optional(),
      })
      .optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Nothing to update' });

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
