# DineFlow Architecture (Phase 1)

## Overview

```
Browser (React SPA)
  │   same-origin requests to /api (Vite proxy in dev, same Express server in prod)
  ▼
Express app (server/src/app.ts)
  helmet → cors → json → cookies
  → loadSession   (cookie → Session row → req.auth)
  → csrfProtection (state-changing requests)
  → routes → requireAuth → requireTenant(permission) → validateBody(zod)
  → controller → service → Prisma → PostgreSQL
  → errorHandler (uniform JSON errors)
```

## Layers (server)

| Layer | Responsibility | Rule |
| --- | --- | --- |
| `routes/` | Map URL + method to middleware chain and controller | Every private route has `requireAuth`, tenant routes add `requireTenant('<permission>')` |
| `validators/` | Zod schemas | Unknown keys are stripped; never trust client-sent roles, ids or status |
| `controllers/` | HTTP in/out | Read the tenant only from `getTenant(req)` |
| `services/` | Business logic & Prisma queries | Accept `restaurantId` as a parameter; always scope queries by it |
| `middleware/` | Cross-cutting concerns | session, CSRF, tenant, validation, rate limit, errors |
| `config/` | env validation, product config, permission table | |

## Multi-tenancy

- Tenant = `Restaurant`. Users join tenants via `RestaurantMembership(role)`.
- `requireTenant(permission)` resolves the target restaurant (route param → `X-Restaurant-Id` header → session's active restaurant → first membership), checks the membership **in the database**, checks the role against `config/permissions.ts`, and sets `req.tenant`.
- Explicitly requested restaurants the user does not belong to always get the same `403 TENANT_ACCESS_DENIED` whether or not they exist (no id probing).
- A stale/tampered `activeRestaurantId` on the session silently falls back to the user's own restaurant.
- Future tenant-owned tables must carry `restaurantId` with an index and `onDelete: Cascade`.

**Defense in depth idea for later phases**: PostgreSQL Row-Level Security policies keyed on a per-transaction `app.restaurant_id` setting can be added on top of the middleware in Phase 6.

## Authentication

- Registration/login create a `Session` row with `tokenHash = sha256(token)`; the raw token is only in the HTTP-only cookie.
- `loadSession` validates expiry, renews (rolling) when less than half the TTL remains, and writes `lastUsedAt` at most every 5 minutes.
- Logout deletes the row; password change deletes all other sessions.
- `PlatformRole.SUPER_ADMIN` exists in the schema for Phase 6 but there is no API path that can set it.

## CSRF

Signed double-submit: `GET /api/auth/csrf` sets an HTTP-only `df_csrf` cookie and returns the same token. Clients echo it in `X-CSRF-Token`. The server checks header == cookie and verifies the HMAC signature; it also rejects disallowed `Origin` headers. The client (`services/api.ts`) fetches the token lazily and retries once if the server rejects an expired token.

## Frontend

- `contexts/AuthContext` — the server session is the source of truth (`/api/auth/me` on load).
- `components/routing/Guards` — `ProtectedRoute`, `GuestRoute`, `RequireRestaurant` (UX only; the server enforces security).
- `contexts/I18nContext` — `t(key, vars)` with English fallback; JSON dictionaries per language; choice saved in `localStorage`.
- `config/*` — every brand/product decision is centralized.
- Landing page and dashboard share the design tokens in `styles/theme.css` but use different layouts (`LandingPage` full-bleed sections vs. `DashboardLayout` sidebar shell).

## Planned modules and where they plug in

| Phase | Module | Server | Client | Permission(s) |
| --- | --- | --- | --- | --- |
| 2 | Menu, categories, items, image upload | `menu.*` | `pages/dashboard/MenuPage` | `menu:manage` |
| 2 | Tables & QR codes | `tables.*` | `pages/dashboard/TablesPage` | `tables:manage` |
| 3 | Public QR menu, cart, ordering | public `/api/public/:slug/*` routes (no auth, rate-limited) | `pages/public/*` | – |
| 4 | Kitchen display, waiter dashboard, realtime | WebSocket/SSE channel scoped per restaurant | `pages/dashboard/Kitchen*`, `Waiter*` | `orders:read`, `orders:update` |
| 5 | Billing, payments, reviews, analytics | `billing.*`, `analytics.*` | dashboard pages | `billing:manage` |
| 6 | Super admin, subscriptions, audit, deployment | `/api/admin/*` guarded by `platformRole` | `pages/admin/*` | platform role |
