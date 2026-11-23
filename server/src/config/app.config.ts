/**
 * Business configuration for DineFlow.
 * Change product-level defaults here (trial length comes from .env).
 */
import { env, isProduction } from './env.js';

export const appConfig = {
  productName: 'DineFlow',

  /** Defaults applied when a restaurant is created during onboarding. */
  restaurantDefaults: {
    currency: 'BDT',
    timezone: 'Asia/Dhaka',
    country: 'BD',
  },

  /** Subscription created for every new restaurant. */
  trial: {
    days: env.TRIAL_DAYS,
    plan: 'STARTER' as const,
  },

  session: {
    cookieName: 'df_session',
    ttlMs: env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
    /** Extend the session when less than this much time is left (rolling sessions). */
    renewWhenRemainingMs: (env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000) / 2,
    /** Only write "lastUsedAt" this often to avoid a DB write on every request. */
    touchIntervalMs: 5 * 60 * 1000,
    secureCookie: isProduction,
  },

  csrf: {
    cookieName: 'df_csrf',
    headerName: 'x-csrf-token',
  },

  rateLimit: {
    login: { max: env.LOGIN_RATE_LIMIT_MAX, windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000 },
    register: { max: 20, windowMs: 60 * 60 * 1000 },
  },
} as const;
