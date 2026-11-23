# DineFlow Customization Guide

This guide is written for beginners. Every change below is a small edit in one or two files. Keep `npm run dev` running while you edit — the browser updates automatically when you save.

> Tip: in VS Code press **Ctrl + P** and type a file name (e.g. `brand.ts`) to open it quickly.

---

## Where things live (cheat sheet)

| I want to change… | Edit this file |
| --- | --- |
| Product name, logo, contact info, social links | `client/src/config/brand.ts` |
| Colors, fonts, corner radius, shadows | `client/src/styles/theme.css` |
| Any text on the website or dashboard | `client/src/i18n/locales/en.json` (+ `bn.json`, `hi.json`) |
| Landing page menu & footer links | `client/src/config/navigation.ts` |
| Landing page section order | `client/src/pages/LandingPage.tsx` |
| Pricing plans & prices | `client/src/config/pricing.ts` |
| Dashboard sidebar items | `client/src/config/modules.ts` |
| Default language / country / currency / timezone | `client/src/config/app.ts` |
| Images | `client/public/images/` |
| Free-trial length, session length, login limits | `.env` |
| Who (which role) can do what | `server/src/config/permissions.ts` |
| Server-side defaults (trial plan, cookie names) | `server/src/config/app.config.ts` |

---

## 1. Change the website logo

The logo is a square "mark" image plus the product name as text.

1. Put your logo file in `client/public/brand/`, e.g. `client/public/brand/my-logo.png` (square, at least 128×128 px; SVG is best).
2. Open `client/src/config/brand.ts` and change:

   ```ts
   logoMark: '/brand/my-logo.png',
   ```

3. Browser tab icon: open `client/index.html` and change the `<link rel="icon" … href="/brand/logo-mark.svg">` path to your file.

The logo component is `client/src/components/ui/Logo.tsx` if you want a different layout (e.g. hide the text).

## 2. Change the product name and tagline

- **Name**: `client/src/config/brand.ts` → `name: 'DineFlow'`. Also update the `<title>` in `client/index.html` and `productName` in `server/src/config/app.config.ts`.
- **Tagline / hero heading**: in each locale file change `brand.tagline` and `hero.title`:

  ```json
  "brand": { "tagline": "Your Restaurant. Smarter Ordering. Better Experiences." },
  "hero":  { "title": "Your Restaurant. Smarter Ordering. Better Experiences.", … }
  ```

## 3. Change brand colors

Open `client/src/styles/theme.css`. Every color has a comment:

```css
--color-bg: #080b12;       /* main background */
--color-bg-2: #101522;     /* secondary background */
--color-card: #151d2d;     /* cards */
--color-brand: #f28c38;    /* primary accent */
--color-brand-2: #ffb15c;  /* secondary accent */
--color-fg: #f8fafc;       /* main text */
--color-muted: #94a3b8;    /* secondary text */
--color-line: #263247;     /* borders */
```

Change a value, save, done — Tailwind generates classes such as `bg-brand`, `text-muted` and `border-line` from these names, so the whole app follows.

Two places use hex colors directly because chart libraries need them: `client/src/components/landing/ProductPreview.tsx` and `client/src/components/dashboard/SetupRadial.tsx` (search for `#F28C38`). Update those if you change the accent color. The logo SVG (`client/public/brand/logo-mark.svg`) also contains the colors.

## 4. Change fonts

1. Install the font (fonts are self-hosted, so the site works offline and respects privacy), e.g.:

   ```powershell
   npm install @fontsource-variable/manrope -w client
   ```

2. Import it in `client/src/main.tsx`:

   ```ts
   import '@fontsource-variable/manrope';
   ```

3. Use it in `client/src/styles/theme.css`:

   ```css
   --font-sans: 'Manrope Variable', 'Noto Sans Bengali', 'Noto Sans Devanagari', ui-sans-serif, system-ui, sans-serif;
   ```

   Keep the Noto fallbacks so Bangla and Hindi keep rendering correctly. `--font-display` is used for headings.

## 5. Change text (website content)

All visible text is in the translation files:

- `client/src/i18n/locales/en.json` — English
- `client/src/i18n/locales/bn.json` — বাংলা
- `client/src/i18n/locales/hi.json` — हिन्दी

Find the text with **Ctrl + Shift + F** in VS Code, edit it in each language file and save. Sections are grouped by page area (`hero`, `features`, `pricing`, `faq`, `dashboard`, `settings`…). Words in `{curly braces}` such as `{name}` are placeholders filled in by the app — keep them.

Missing a translation in Bangla or Hindi? The English text is shown automatically, and a warning appears in the browser console during development.

### Change contact information

`client/src/config/brand.ts`:

```ts
contact: {
  email: 'hello@dineflow.example',   // ← put your real address
  salesEmail: 'sales@dineflow.example',
  phone: '+880 1700-000000',
  address: 'Gulshan Avenue, Dhaka 1212, Bangladesh',
},
```

The contact form on the landing page opens the visitor's email app addressed to `contact.email`. Support hours text is `contact.details.hoursValue` in the locale files.

### Change navigation

`client/src/config/navigation.ts` holds the top menu (`landingNav`) and footer columns (`footerNav`). Each link has a `labelKey` (translation) and `href` (`#section-id` for the landing page, or a route such as `/login`).

### Reorder or remove landing sections

`client/src/pages/LandingPage.tsx` lists the sections in order — move or delete lines such as `<Pricing />`. If you remove a section, also remove its link from `navigation.ts`.

### Change pricing

`client/src/config/pricing.ts`: prices (`monthlyPrice`, `null` = "Custom"), which plan is highlighted, currency symbol and yearly discount. Plan names, descriptions and feature texts are in the locale files under `pricing`.

## 6. Replace images

All photos are normal files in `client/public/images/` and are referenced like `/images/hero-restaurant.jpg`.

- **Easiest**: replace a file with your own photo using **the same file name**. Nothing else to change.
- **New name**: add your file and update the path where it is used (search the project for the old file name).
- Recommended sizes: hero 1920 px wide; other photos 1200 px wide; JPG at ~80 % quality.
- The images that restaurants can pick for their logo/cover in Settings are listed in `imageGallery` in `client/src/config/app.ts`.

Credits for the included photos are in `docs/IMAGE_CREDITS.md`.

## 7. Customize the dashboard

- **Sidebar items**: `client/src/config/modules.ts`. Change order, icons (any icon from <https://lucide.dev/icons>), labels (`labelKey`) or status.
- **Overview page**: `client/src/pages/dashboard/OverviewPage.tsx` — cards, checklist and quick actions are plain lists at the top of the component (`quickActions`, `checklistLinks`).
- **Checklist logic** (what counts as "done"): `server/src/services/dashboard.service.ts`.
- **Layout (sidebar/top bar)**: `client/src/layouts/DashboardLayout.tsx`.
- **Reusable UI pieces**: `client/src/components/ui/` — `Button`, `Input`/`Select`/`Textarea`, `Modal`, `Badge`, `Alert`, `ProgressBar`, `EmptyState`. Reuse them so new pages match the design.

## 8. Add a language

Example: Arabic (`ar`).

1. Copy `client/src/i18n/locales/en.json` to `ar.json` and translate the values (not the keys).
2. Register it in `client/src/i18n/index.ts`:

   ```ts
   import ar from './locales/ar.json';
   export const dictionaries = { en, bn, hi, ar };
   export const intlLocale = { en: 'en-US', bn: 'bn-BD', hi: 'hi-IN', ar: 'ar' };
   ```

3. Add it to `languages` in `client/src/config/app.ts`:

   ```ts
   { code: 'ar', label: 'العربية', short: 'ع', dir: 'rtl' },
   ```

   (`dir: 'rtl'` sets right-to-left on the page. Some layouts may need small spacing tweaks for RTL.)

4. If the script needs a special font, install a Noto font for it (see section 4) and add it to the font stacks.

**Change the default language**: `appDefaults.language` in `client/src/config/app.ts`.

## 9. Change restaurant settings & business defaults

- **Free-trial length**: `TRIAL_DAYS` in `.env` (restart `npm run dev`). Applies to restaurants created afterwards.
- **Login session length**: `SESSION_TTL_DAYS` in `.env`.
- **Default country/currency/timezone in onboarding**: `appDefaults` in `client/src/config/app.ts`. Suggested currency/timezone per country: `countryCurrency` / `countryTimezone` in the same file.
- **Restaurant categories**: they are a database enum. To add one (e.g. `BAR`):
  1. add it to `enum RestaurantCategory` in `server/prisma/schema.prisma` and run `npm run db:migrate`;
  2. add it to `restaurantCategorySchema` in `server/src/validators/common.ts`;
  3. add it to `restaurantCategories` in `client/src/config/app.ts`;
  4. add translations under `categories` in each locale file.
- **What each role may do**: `server/src/config/permissions.ts` — add or remove roles from a permission.
- **Demo data**: `server/prisma/seed.ts`, then `npm run db:seed`.

## 10. Add a future module (example: Menu Management in Phase 2)

DineFlow is built so new modules plug in the same way. See `docs/ARCHITECTURE.md` for details; in short:

**Database**

1. Add models to `server/prisma/schema.prisma`. Every tenant-owned model **must** have a `restaurantId` relation:

   ```prisma
   model MenuCategory {
     id           String     @id @default(cuid())
     restaurantId String
     name         String
     restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
     @@index([restaurantId])
   }
   ```

2. `npm run db:migrate` (give the migration a name like `add_menu`).

**Server**

3. `server/src/validators/menu.validators.ts` — Zod schemas for the request bodies.
4. `server/src/services/menu.service.ts` — database logic. **Always filter by `restaurantId`.**
5. `server/src/controllers/menu.controller.ts` — read `getTenant(req).restaurantId`, call the service.
6. `server/src/routes/menu.routes.ts` and mount it in `server/src/routes/index.ts`:

   ```ts
   router.get('/', requireAuth, requireTenant('menu:manage'), menu.list);
   ```

7. Add tests in `server/tests/menu.test.ts`, including a cross-tenant test (copy the patterns from `tenant.test.ts`).

**Client**

8. `client/src/services/menu.service.ts` — API calls using `api.get/post/patch`.
9. `client/src/pages/dashboard/MenuPage.tsx` — the page.
10. Add the route in `client/src/App.tsx` (inside the `/dashboard` route) and set the module to `status: 'available'` in `client/src/config/modules.ts`.
11. Add the texts to all locale files.

---

## Need to start fresh?

- Reset the local database and demo data: `npm run db:reset`
- Run the tests after changes: `npm test`
- Check for TypeScript mistakes: `npm run typecheck`
