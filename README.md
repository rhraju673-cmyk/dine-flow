# DineFlow

**Your Restaurant. Smarter Ordering. Better Experiences.**

DineFlow is a multi-tenant restaurant QR ordering & management SaaS. Many independent restaurants each run their own account, with strict data isolation between them.

This repository contains **Phase 1 — Foundation**: public website, real authentication, multi-tenant database, onboarding, owner dashboard, restaurant settings, internationalization (English / বাংলা / हिन्दी) and an automated test suite.

> 📘 **Feature & usage guide (English + বাংলা):** [docs/USER_GUIDE.md](docs/USER_GUIDE.md)

> Modules such as menus, tables & QR codes, live ordering, kitchen display, waiters, billing and analytics are **planned for Phases 2–6**. They appear in the dashboard as clearly-labelled "Coming Soon" pages; they are not implemented yet.

---

## Contents

1. [Technology stack](#technology-stack)
2. [Requirements](#requirements)
3. [Installation (VS Code, step by step)](#installation-vs-code-step-by-step)
4. [PostgreSQL configuration](#postgresql-configuration)
5. [Environment variables](#environment-variables)
6. [Prisma migrations](#prisma-migrations)
7. [Database seeding & demo account](#database-seeding--demo-account)
8. [Development startup](#development-startup)
9. [Testing](#testing)
10. [Production build](#production-build)
11. [Project structure](#project-structure)
12. [API reference](#api-reference)
13. [Security model](#security-model)
14. [Phase 1 features / Phase 2 scope](#phase-1-features)
15. [Troubleshooting](#troubleshooting)

---

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4, React Router 7, Lucide icons, Recharts |
| Backend | Node.js, Express 5, TypeScript, REST API |
| Database | PostgreSQL 17, Prisma ORM 6 |
| Auth | scrypt password hashing, server-side sessions stored in PostgreSQL, HTTP-only cookies, CSRF protection, rate limiting, role-based permissions |
| Validation | Zod (server) + friendly client-side checks |
| Testing | Vitest + Supertest against a real PostgreSQL test database |
| Fonts | Self-hosted Inter, Fraunces, Noto Sans Bengali, Noto Sans Devanagari (no external requests) |

The application runs entirely on your own machine/server. It does **not** need Claude or any AI API.

---

## Requirements

- **Node.js 20.19 or newer** (tested with Node 24) — <https://nodejs.org>
- **npm 10+** (comes with Node)
- **Visual Studio Code** — <https://code.visualstudio.com>
- **PostgreSQL** — *optional*. By default DineFlow starts its own local PostgreSQL 17 automatically (see below), so you don't need to install anything.

---

## Installation (VS Code, step by step)

1. Open VS Code → **File → Open Folder…** → choose the `dineflow` folder.
2. Open a terminal: **Terminal → New Terminal**.
3. Install all dependencies (root, server and client in one go):

   ```powershell
   npm install
   ```

   npm 11 may ask you to approve install scripts. The project already approves exactly the packages that need one (Prisma, esbuild, embedded PostgreSQL) in `package.json → allowScripts`.

4. Create your environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

   Then open `.env` and set `SESSION_SECRET` to a long random value. You can generate one with:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

   You may also replace `change_me_local_password` (it appears in both database URLs) with any password you like.

5. Set up the database (creates it, applies migrations, adds demo data):

   ```powershell
   npm run setup
   ```

6. Start everything:

   ```powershell
   npm run dev
   ```

7. Open <http://localhost:5173>.

Recommended VS Code extensions: *Prisma*, *Tailwind CSS IntelliSense*, *ESLint*, *Vitest*.

---

## PostgreSQL configuration

### Option A — Embedded PostgreSQL (default, zero install)

With `USE_EMBEDDED_POSTGRES=true`, DineFlow uses the [`embedded-postgres`](https://github.com/leinelissen/embedded-postgres) npm package, which contains the official PostgreSQL 17 binaries.

- Data is stored in `dineflow/.data/postgres` (ignored by git).
- The user, password and port are read from `DATABASE_URL` (default port **5433**, so it never clashes with a normal PostgreSQL on 5432).
- `npm run dev` starts it automatically. `npm run db:start` starts it on its own.
- It is created with **UTF-8 encoding**, so Bangla, Hindi and all other scripts are stored correctly.

To wipe the local database completely: stop the app, delete the `.data` folder, then run `npm run setup` again.

### Option B — Your own PostgreSQL (installed, Docker or cloud)

1. Create a user and two databases (one for the app, one for tests), e.g. in `psql`:

   ```sql
   CREATE USER dineflow WITH PASSWORD 'your_password' CREATEDB;
   CREATE DATABASE dineflow OWNER dineflow ENCODING 'UTF8';
   CREATE DATABASE dineflow_test OWNER dineflow ENCODING 'UTF8';
   ```

2. In `.env`:

   ```env
   USE_EMBEDDED_POSTGRES=false
   DATABASE_URL=postgresql://dineflow:your_password@localhost:5432/dineflow?schema=public
   TEST_DATABASE_URL=postgresql://dineflow:your_password@localhost:5432/dineflow_test?schema=public
   ```

3. `npm run setup`, then `npm run dev`.

---

## Environment variables

All variables live in **one** file: `dineflow/.env` (copy from `.env.example`). The server validates them at startup and refuses to start with a clear message if something is wrong.

| Variable | Default | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `development` | `development`, `test` or `production` |
| `API_PORT` | `4000` | Port of the Express API (hosting platforms may set `PORT` instead; it is used when `API_PORT` is absent) |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Comma-separated browser origins allowed to call the API (CORS + CSRF origin check) |
| `DATABASE_URL` | — | Main PostgreSQL connection string |
| `TEST_DATABASE_URL` | — | Separate database for tests — **erased on every test run**; must differ from `DATABASE_URL` |
| `USE_EMBEDDED_POSTGRES` | `true` | `true` = DineFlow runs its own PostgreSQL; `false` = you provide one |
| `SESSION_SECRET` | — | ≥ 32 random characters; signs CSRF tokens. Production refuses the placeholder |
| `SESSION_TTL_DAYS` | `7` | Login session lifetime (rolling — active users stay signed in) |
| `LOGIN_RATE_LIMIT_MAX` | `10` | Login attempts allowed per IP per window |
| `LOGIN_RATE_LIMIT_WINDOW_MINUTES` | `15` | Rate-limit window |
| `TRIAL_DAYS` | `14` | Free-trial length given to new restaurants |

`.env.example` only contains placeholders. **Never commit `.env`** — it is already in `.gitignore`.

---

## Prisma migrations

The schema is in [`server/prisma/schema.prisma`](server/prisma/schema.prisma); migrations are in `server/prisma/migrations/`.

| Command | What it does |
| --- | --- |
| `npm run db:migrate` | After you edit `schema.prisma`: creates a new migration and applies it (development) |
| `npm run db:deploy` | Applies existing migrations without creating new ones (CI / production) |
| `npm run db:reset` | **Deletes all data**, re-applies migrations and re-seeds (development only) |
| `npm run db:studio` | Opens Prisma Studio — a visual database browser at <http://localhost:5555> |
| `npm run db:generate -w server` | Regenerates the Prisma client (stop `npm run dev` first on Windows) |

### Phase 1 data model

```
User ──< RestaurantMembership >── Restaurant ──1 RestaurantSettings
  │            (role)                  │──1 Subscription
  └──< Session ─ activeRestaurant ─────┘
```

- **User** — id, name, email (unique, lowercase), passwordHash, platformRole (`USER`/`SUPER_ADMIN`), timestamps
- **Restaurant** — id, name, slug (unique), category, description, logo, coverImage, phone, email, address, country, currency, timezone, status, timestamps
- **RestaurantMembership** — id, userId, restaurantId, role, createdAt; unique (userId, restaurantId)
- **RestaurantSettings** — id, restaurantId (unique), taxRate, serviceCharge, openingHours (JSON), timestamps
- **Subscription** — id, restaurantId (unique), plan, status, trialEndsAt, timestamps
- **Session** — id, tokenHash (unique), userId, activeRestaurantId, ipAddress, userAgent, expiresAt, lastUsedAt, createdAt

All relations have foreign keys with cascading deletes; frequently-queried columns are indexed.

**Roles**: restaurant-level roles are `RESTAURANT_OWNER`, `RESTAURANT_MANAGER`, `KITCHEN_STAFF`, `WAITER` (on the membership). `SUPER_ADMIN` is a *platform* role on the user and can never be set through the API — it is reserved for the Phase 6 Super Admin dashboard.

---

## Database seeding & demo account

`npm run db:seed` (also run by `npm run setup`) creates the demo restaurant:

- **Zaika Restaurant** — Casual Dining, Dhaka, currency **BDT**, timezone **Asia/Dhaka**, 5 % tax, 10 % service charge, opening hours, free trial.

| Role | Email | Password |
| --- | --- | --- |
| Owner | `demo@dineflow.local` | `ZaikaDemo2026` |
| Waiter (read-only settings) | `waiter@dineflow.local` | `ZaikaDemo2026` |

⚠️ **Development only.** The seed script refuses to run when `NODE_ENV=production`, and the login page's "Fill in demo account" button and pre-filled demo credentials are compiled out of production builds (verified: the production bundle contains neither the email nor the password).

---

## Development startup

```powershell
npm run dev
```

starts three processes together (stop all with **Ctrl + C**):

| Name | URL | What |
| --- | --- | --- |
| `db` | `localhost:5433` | Embedded PostgreSQL (skipped if something already listens on the port) |
| `api` | <http://localhost:4000> | Express API (auto-restarts on file changes) |
| `web` | <http://localhost:5173> | React app (hot reload). `/api` requests are proxied to the API |

Using your own PostgreSQL? `npm run dev:app` starts only the API and the web app.

Useful pages: `/` landing · `/register` · `/login` · `/onboarding` · `/dashboard` · `/dashboard/settings` · `/dashboard/profile`.

---

## Testing

```powershell
npm test
```

- Runs **56 automated tests** with Vitest + Supertest against a **real PostgreSQL** test database (`TEST_DATABASE_URL`). If PostgreSQL isn't running and embedded mode is on, the tests start it themselves.
- Every test begins with an empty database, so tests never depend on each other or touch your development data.

What is covered:

| Area | Tests |
| --- | --- |
| Health | API + database health, JSON 404s |
| Registration | user creation, scrypt hashing, session cookie flags, email normalisation, **duplicate email prevention**, validation errors, **cannot self-assign SUPER_ADMIN** |
| Login | success, wrong password, unknown email (same generic error), **rate limiting** |
| Sessions | missing / forged / **expired** sessions rejected, only token hashes stored |
| Logout | server-side session destroyed, cookie cleared, old cookie can't be replayed |
| CSRF | missing token, forged token, foreign origin rejected; correct origin allowed |
| Profile | name update, password change signs out other devices, wrong current password |
| Restaurants | onboarding transaction (restaurant + owner membership + settings + trial), unique slugs, Unicode names, ignored role/status/slug injection, validation, profile & settings updates, clearing fields, unsafe image URL rejection |
| Dashboard | real data only (no revenue/sales fields), auth required |
| **Tenant isolation** | can't read another restaurant by id, by `X-Restaurant-Id` header, or via a tampered session; can't update or activate another tenant; no id probing (same 403 for non-existent ids); `/me` only lists own restaurants |
| **Roles** | waiter can read but not update; waiter doesn't see subscription; manager can update; role headers from the client are ignored |

Latest result (Phase 1 completion):

```
 Test Files  3 passed (3)
      Tests  56 passed (56)
```

Also available: `npm run typecheck` (TypeScript for server + client) and `npm run test:watch -w server`.

---

## Production build

```powershell
npm run build      # builds client/dist and server/dist
npm run db:deploy  # apply migrations to the production database
npm start          # serves the API AND the built website from one Node process
```

In production (`NODE_ENV=production`):

- the Express server also serves `client/dist`, so one domain hosts both site and API;
- session & CSRF cookies are `Secure` (HTTPS required) — run behind HTTPS;
- a real `SESSION_SECRET` is mandatory;
- set `USE_EMBEDDED_POSTGRES=false` and point `DATABASE_URL` at a managed PostgreSQL;
- `CLIENT_ORIGIN` must be your public URL, e.g. `https://app.example.com`.

Full deployment hardening (backups, monitoring, distributed rate limits, CDN) is planned for Phase 6.

---

## Project structure

```
dineflow/
├── package.json              # npm workspaces + top-level scripts
├── .env.example              # environment template (placeholders only)
├── README.md
├── CUSTOMIZATION_GUIDE.md
├── docs/
│   ├── ARCHITECTURE.md       # how the pieces fit + how to add modules
│   └── IMAGE_CREDITS.md
├── client/                   # React + Vite frontend
│   ├── public/
│   │   ├── brand/logo-mark.svg
│   │   └── images/           # restaurant & food photography (local files)
│   └── src/
│       ├── components/
│       │   ├── ui/           # Button, Field, Modal, Badge, Alert, Logo, LanguageSwitcher…
│       │   ├── landing/      # Navbar, Hero, ProductPreview, Features, Pricing, FAQ, Contact, Footer…
│       │   ├── dashboard/    # dashboard-specific widgets
│       │   └── routing/      # route guards
│       ├── config/           # ⭐ brand, navigation, modules, pricing, app defaults
│       ├── contexts/         # Auth, I18n, Toast providers
│       ├── hooks/            # useApi, useFormErrors, useDocumentTitle
│       ├── i18n/locales/     # ⭐ en.json, bn.json, hi.json
│       ├── layouts/          # AuthLayout, DashboardLayout
│       ├── pages/            # Landing, Login, Register, Onboarding, NotFound, dashboard/*
│       ├── services/         # API client (CSRF handling) + endpoints
│       ├── styles/           # ⭐ theme.css (colors, fonts), global.css
│       ├── types/            # API types
│       └── utils/
└── server/                   # Express API
    ├── prisma/
    │   ├── schema.prisma     # database schema
    │   ├── migrations/       # SQL migrations
    │   └── seed.ts           # demo data (development only)
    ├── scripts/              # embedded PostgreSQL + setup helpers
    ├── src/
    │   ├── app.ts            # Express app factory (security middleware)
    │   ├── index.ts          # starts the server
    │   ├── config/           # env validation, app config, ⭐ permissions
    │   ├── routes/           # URL → controller
    │   ├── controllers/      # HTTP layer
    │   ├── services/         # business logic + database access
    │   ├── middleware/       # session, CSRF, ⭐ tenant, validation, rate limit, errors
    │   ├── validators/       # Zod schemas
    │   ├── utils/            # password hashing, tokens, slugs, errors
    │   └── types/
    └── tests/                # Vitest + Supertest
```

(⭐ = the files you'll edit most when customizing.)

---

## API reference

All responses are JSON. Errors always look like:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Some fields are invalid", "details": { "fields": { "email": "Enter a valid email address" } } } }
```

State-changing requests (`POST`, `PATCH`, `PUT`, `DELETE`) need the `X-CSRF-Token` header from `GET /api/auth/csrf` (the frontend handles this automatically).

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | – | API & database status (200 / 503) |
| GET | `/api/auth/csrf` | – | Issues a CSRF token |
| POST | `/api/auth/register` | – | Create owner account → 201, signs in. 409 `EMAIL_TAKEN` |
| POST | `/api/auth/login` | – | Sign in → 200. 401 `INVALID_CREDENTIALS`, 429 when rate-limited |
| POST | `/api/auth/logout` | – | Destroys the session → 204 |
| GET | `/api/auth/me` | ✔ | Current user + restaurant memberships. 401 if signed out |
| PATCH | `/api/auth/me` | ✔ | Update own name |
| POST | `/api/auth/change-password` | ✔ | Change password; signs out other devices |
| POST | `/api/restaurants` | ✔ | Onboarding: create restaurant (transaction) → 201 |
| GET | `/api/restaurants/current` | ✔ tenant | Current restaurant. 404 `NO_RESTAURANT` before onboarding |
| PATCH | `/api/restaurants/current` | ✔ owner/manager | Update profile & settings |
| GET | `/api/restaurants/:restaurantId` | ✔ member | Read a restaurant you belong to; 403 `TENANT_ACCESS_DENIED` otherwise |
| POST | `/api/restaurants/:restaurantId/activate` | ✔ member | Switch the session's working restaurant |
| GET | `/api/dashboard/overview` | ✔ tenant | Real setup/subscription/profile data for the dashboard |

---

## Security model

- **Passwords**: scrypt (N=2¹⁵, r=8, p=1, 16-byte salt), parameters stored with each hash; constant-time comparison; login timing is equalised for unknown emails. Hashes are never selected into API responses.
- **Sessions**: 256-bit random token in an `HttpOnly`, `SameSite=Lax` cookie (`Secure` in production). Only the SHA-256 of the token is stored in PostgreSQL. Rolling expiry, hourly cleanup of expired sessions, session rotation on login, all other sessions revoked on password change.
- **CSRF**: signed double-submit token (HMAC with `SESSION_SECRET`) required on every state-changing request, plus an `Origin` allow-list.
- **Rate limiting**: login & password change (configurable), registration (20/hour/IP).
- **Tenant isolation**: `requireTenant(permission)` middleware verifies membership **in the database** on every request and exposes only `req.tenant.restaurantId` to handlers. The frontend's idea of the user's role is never trusted.
- **Validation**: every request body is parsed by Zod; unknown fields (e.g. `role`, `platformRole`, `status`, `slug`) are stripped.
- **Headers**: Helmet with a strict Content-Security-Policy, `frame-ancestors 'none'`, HSTS, `no-store` cache on API responses.
- **Secrets**: `.env` is git-ignored; `.env.example` only has placeholders; production refuses the placeholder secret.

---

## Phase 1 features

**Implemented and tested**

- Public website: navbar, hero, product preview (labelled sample data), features, how it works, QR ordering, management, kitchen and waiter previews, pricing (monthly/yearly), testimonials (labelled as samples), FAQ, contact (opens email app), footer
- Register / login / logout, session persistence, protected routes, rate limiting, CSRF, form validation & error messages
- Multi-tenant database with transactions, unique constraints, indexes and tenant authorization middleware
- 4-step onboarding wizard (name, category, phone, email, address, country, currency, timezone) → restaurant + owner membership + settings + free trial + unique slug
- Owner dashboard: welcome, restaurant status, account info, subscription & trial countdown, setup progress chart, getting-started checklist, profile completion, quick actions, honest empty state for sales
- Restaurant settings: general, branding (gallery or https image URL), contact, regional, taxes & service charge, opening hours — with read-only mode for non-managers
- Account settings: update name, change password, list of restaurants, sign out
- English / বাংলা / हिन्दी with a working language switcher (remembered per browser)
- Zaika Restaurant demo data, centralized customization config, documentation

**Reserved for Phase 2** (not built yet): menu management, food categories, food items (with photos, prices, variants), image uploads, table management, QR code generation & printing, staff invitations.

Later phases: customer QR menu, cart & live ordering (3) · kitchen display, waiter dashboard, realtime notifications (4) · billing, payments, reviews, analytics (5) · super admin, subscriptions & payments, security audit, production deployment (6).

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `Invalid environment configuration` on start | `.env` is missing or a value is wrong — the message names the variable. Copy `.env.example` to `.env`. |
| `PostgreSQL is not reachable on port 5433` | Run `npm run db:start` (embedded) or start your own PostgreSQL and check `DATABASE_URL`. |
| `Port 5173 is already in use` | Another Vite app is running. Close it, or change `server.port` in `client/vite.config.ts` **and** `CLIENT_ORIGIN` in `.env`. |
| API port in use | Change `API_PORT` in `.env` (Vite reads `API_PORT` from its own environment for the proxy; default 4000). |
| `EPERM … query_engine-windows.dll.node` | Windows locks Prisma's engine while the app runs. Stop `npm run dev`, then run the Prisma command again. |
| "Security token missing or invalid" | The page was open while the server restarted — refresh the page. |
| "Too many login attempts" | Wait for the window (`LOGIN_RATE_LIMIT_WINDOW_MINUTES`) or restart the API in development. |
| Embedded PostgreSQL won't start after a crash | Delete `.data/postgres/postmaster.pid` and try again. As a last resort delete `.data` and run `npm run setup` (erases local data). |
| Tests fail with "TEST_DATABASE_URL must be different" | Use a separate test database name — tests erase it. |
| Bangla/Hindi text shows boxes | Fonts are bundled; hard-refresh (Ctrl + F5). For your own PostgreSQL make sure the database encoding is UTF8. |
