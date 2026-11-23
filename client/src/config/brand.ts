/**
 * ─────────────────────────────────────────────────────────────
 *  BRAND CONFIGURATION — the first file to edit when customizing.
 * ─────────────────────────────────────────────────────────────
 * Product name, logo, contact details and social links live here.
 * Colors & fonts:      src/styles/theme.css
 * Website text:        src/i18n/locales/*.json
 * Navigation:          src/config/navigation.ts
 */
export const brand = {
  /** Product name shown in the navbar, footer, page titles, emails… */
  name: 'DineFlow',

  /**
   * Logo mark (square icon). Put your own file in client/public/brand/
   * and change the path. SVG or PNG both work.
   */
  logoMark: '/brand/logo-mark.svg',

  /** The tagline is translated — edit "brand.tagline" in the locale files. */

  /** Public contact details (landing page Contact section & footer). */
  contact: {
    email: 'hello@dineflow.example',
    salesEmail: 'sales@dineflow.example',
    phone: '+880 1700-000000',
    address: 'Gulshan Avenue, Dhaka 1212, Bangladesh',
  },

  /** Social links — leave a value empty ('') to hide that icon. */
  social: {
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    linkedin: 'https://linkedin.com/',
    x: '',
  },

  /** Year shown in the footer copyright line. */
  copyrightYear: new Date().getFullYear(),
} as const;
