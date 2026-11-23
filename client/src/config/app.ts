/**
 * Application defaults & dropdown options (onboarding + settings).
 */
export const appDefaults = {
  /** Default language. Must exist in `languages` below. */
  language: 'en',
  country: 'BD',
  currency: 'BDT',
  timezone: 'Asia/Dhaka',
} as const;

/**
 * Available interface languages. To add one:
 *   1. copy src/i18n/locales/en.json to e.g. ar.json and translate it
 *   2. register it in src/i18n/index.ts
 *   3. add it here
 */
export const languages = [
  { code: 'en', label: 'English', short: 'EN', dir: 'ltr' },
  { code: 'bn', label: 'বাংলা', short: 'বাং', dir: 'ltr' },
  { code: 'hi', label: 'हिन्दी', short: 'हि', dir: 'ltr' },
] as const;

export type LanguageCode = (typeof languages)[number]['code'];

/** Restaurant categories (must match the RestaurantCategory enum on the server). */
export const restaurantCategories = [
  'CASUAL_DINING',
  'FINE_DINING',
  'CAFE',
  'FAST_FOOD',
  'HOTEL',
  'FOOD_COURT',
  'BAKERY',
  'OTHER',
] as const;
export type RestaurantCategory = (typeof restaurantCategories)[number];

/** When a country is picked in onboarding, its usual currency is pre-selected. */
export const countryCurrency: Record<string, string> = {
  BD: 'BDT', IN: 'INR', PK: 'PKR', NP: 'NPR', LK: 'LKR', US: 'USD', GB: 'GBP', AE: 'AED',
  SA: 'SAR', QA: 'QAR', KW: 'KWD', OM: 'OMR', BH: 'BHD', MY: 'MYR', SG: 'SGD', TH: 'THB',
  ID: 'IDR', PH: 'PHP', CA: 'CAD', AU: 'AUD', NZ: 'NZD', DE: 'EUR', FR: 'EUR', IT: 'EUR',
  ES: 'EUR', NL: 'EUR', IE: 'EUR', JP: 'JPY', CN: 'CNY', HK: 'HKD', TR: 'TRY', EG: 'EGP',
  NG: 'NGN', KE: 'KES', ZA: 'ZAR', BR: 'BRL', MX: 'MXN',
};

/** Common timezone for a country (used as a suggestion only). */
export const countryTimezone: Record<string, string> = {
  BD: 'Asia/Dhaka', IN: 'Asia/Kolkata', PK: 'Asia/Karachi', NP: 'Asia/Kathmandu', LK: 'Asia/Colombo',
  AE: 'Asia/Dubai', SA: 'Asia/Riyadh', QA: 'Asia/Qatar', MY: 'Asia/Kuala_Lumpur', SG: 'Asia/Singapore',
  GB: 'Europe/London', DE: 'Europe/Berlin', FR: 'Europe/Paris', US: 'America/New_York', CA: 'America/Toronto',
  AU: 'Australia/Sydney', JP: 'Asia/Tokyo', TH: 'Asia/Bangkok', ID: 'Asia/Jakarta', TR: 'Europe/Istanbul',
};

/** Images users can pick for their restaurant cover/logo before uploads exist (Phase 2+). */
export const imageGallery = [
  '/images/curry-spread.jpg',
  '/images/biryani.jpg',
  '/images/fine-dining.jpg',
  '/images/restaurant-floor.jpg',
  '/images/cafe-interior.jpg',
  '/images/bar-interior.jpg',
  '/images/pizza.jpg',
  '/images/salmon-bowl.jpg',
  '/images/plated-dishes.jpg',
  '/images/food-spread.jpg',
];
