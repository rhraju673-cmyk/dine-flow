import { randomBytes } from 'node:crypto';

/**
 * Turns "Zaika Restaurant & Café" into "zaika-restaurant-cafe".
 * Non-Latin names (e.g. Bangla) fall back to "restaurant".
 */
export function slugify(input: string): string {
  const slug = input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return slug || 'restaurant';
}

/** Short random suffix used to make a slug unique: "zaika-restaurant-k3f9q2". */
export function slugSuffix(): string {
  return randomBytes(4).toString('hex').slice(0, 6);
}
