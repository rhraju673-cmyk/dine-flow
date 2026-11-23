import { z } from 'zod';

/** Trimmed string that turns "" into undefined (so optional fields can be cleared). */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional();

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email({ message: 'Enter a valid email address' }));

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9()\-\s.]{6,40}$/, 'Enter a valid phone number');

const regionNames = new Intl.DisplayNames(['en'], { type: 'region', fallback: 'none' });
/** ZZ and the X* range are "user-assigned" codes, not real countries. */
function isRealCountry(code: string) {
  if (!/^[A-Z]{2}$/.test(code) || code === 'ZZ' || code.startsWith('X') || code === 'AA' || code.startsWith('Q')) return false;
  const name = regionNames.of(code);
  return Boolean(name) && name !== code && !/unknown/i.test(name!);
}
export const countrySchema = z.string().trim().toUpperCase().refine(isRealCountry, 'Choose a valid country');

const currencies = new Set(Intl.supportedValuesOf('currency'));
export const currencySchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine((c) => currencies.has(c), 'Choose a valid currency');

export const timezoneSchema = z.string().trim().refine((tz) => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}, 'Choose a valid timezone');

/** https:// URL or a site-relative path such as /images/logo.png */
export const imageUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine(
    (v) => v === '' || /^\/[\w\-./]+$/.test(v) || /^https:\/\/[^\s]+$/i.test(v),
    'Use an https:// image URL or a path starting with /',
  )
  .transform((v) => (v === '' ? null : v))
  .nullable()
  .optional();

export const restaurantCategorySchema = z.enum([
  'CASUAL_DINING',
  'FINE_DINING',
  'CAFE',
  'FAST_FOOD',
  'HOTEL',
  'FOOD_COURT',
  'BAKERY',
  'OTHER',
]);

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM (24-hour) time');
const dayHours = z.object({ closed: z.boolean(), open: time, close: time });
export const openingHoursSchema = z.object({
  mon: dayHours,
  tue: dayHours,
  wed: dayHours,
  thu: dayHours,
  fri: dayHours,
  sat: dayHours,
  sun: dayHours,
});
export type OpeningHours = z.infer<typeof openingHoursSchema>;

const percentage = z.coerce.number().min(0, 'Must be 0 or more').max(100, 'Must be 100 or less');
export const percentageSchema = percentage.transform((n) => Math.round(n * 100) / 100);
