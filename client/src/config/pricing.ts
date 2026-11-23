/**
 * Pricing plans shown on the landing page.
 * Names, descriptions and feature texts are translated in the locale files
 * (pricing.plans.<id>.*). Prices are set here.
 *
 * NOTE: Online payments arrive in Phase 5/6. Until then every plan starts
 * with a free trial (trial length: TRIAL_DAYS in .env).
 */
export const pricingCurrency = { code: 'USD', symbol: '$' };

/** Yearly billing discount, in months free (2 = pay 10 months for 12). */
export const yearlyMonthsFree = 2;

export const pricingPlans = [
  {
    id: 'starter',
    monthlyPrice: 19,
    highlighted: false,
    featureKeys: ['qrMenu', 'tables10', 'kds', 'staff3', 'support'],
    cta: { labelKey: 'common.startTrial', href: '/register?plan=starter' },
  },
  {
    id: 'growth',
    monthlyPrice: 49,
    highlighted: true,
    featureKeys: ['everythingStarter', 'tablesUnlimited', 'waiterApp', 'staffUnlimited', 'analytics', 'priority'],
    cta: { labelKey: 'common.startTrial', href: '/register?plan=growth' },
  },
  {
    id: 'enterprise',
    monthlyPrice: null, // custom pricing
    highlighted: false,
    featureKeys: ['everythingGrowth', 'multiLocation', 'customIntegrations', 'sla', 'manager'],
    cta: { labelKey: 'pricing.contactSales', href: '#contact' },
  },
] as const;
