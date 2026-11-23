/**
 * Landing page navigation.
 * `labelKey` points to a translation in src/i18n/locales/*.json.
 * `href` is an in-page anchor (#section-id) or a route (/login).
 */
export const landingNav = [
  { labelKey: 'nav.features', href: '#features' },
  { labelKey: 'nav.howItWorks', href: '#how-it-works' },
  { labelKey: 'nav.kitchen', href: '#kitchen' },
  { labelKey: 'nav.pricing', href: '#pricing' },
  { labelKey: 'nav.faq', href: '#faq' },
  { labelKey: 'nav.contact', href: '#contact' },
] as const;

/** Footer link columns. */
export const footerNav = [
  {
    titleKey: 'footer.product',
    links: [
      { labelKey: 'nav.features', href: '#features' },
      { labelKey: 'nav.pricing', href: '#pricing' },
      { labelKey: 'footer.links.demo', href: '#product-preview' },
      { labelKey: 'footer.links.startTrial', href: '/register' },
    ],
  },
  {
    titleKey: 'footer.solutions',
    links: [
      { labelKey: 'footer.links.qr', href: '#qr-ordering' },
      { labelKey: 'footer.links.kitchen', href: '#kitchen' },
      { labelKey: 'footer.links.waiter', href: '#waiter' },
      { labelKey: 'footer.links.management', href: '#management' },
    ],
  },
  {
    titleKey: 'footer.company',
    links: [
      { labelKey: 'nav.contact', href: '#contact' },
      { labelKey: 'nav.faq', href: '#faq' },
      { labelKey: 'footer.links.signIn', href: '/login' },
    ],
  },
] as const;
