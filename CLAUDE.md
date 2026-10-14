# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a multi-project monorepo for a wedding ceremony management platform. It contains five sub-projects:

| Directory              | Type                    | Purpose                                                              |
| ---------------------- | ----------------------- | -------------------------------------------------------------------- |
| `CEREMONY_WEBAPP_NUXT` | Nuxt 4 (primary app)    | Admin dashboard for managing weddings, guests, invitations, check-in |
| `CEREMONY_WEB_NUXT`    | Nuxt 4                  | Alternate/ceremony-facing web app (pnpm, Tiptap editor, DataTables)  |
| `WED_WEBAPP_NUXT`      | Nuxt 4                  | Simpler PWA with QR scanner, guest-facing features                   |
| `WEBAPP_NUXT_MODULE`   | Nuxt Module             | Shared component/util library consumed by the Nuxt apps              |
| `WED_BUILDER_SERVER`   | Spring Boot 4 / Java 21 | REST API backend (JWT + Google OAuth, MySQL, Springdoc)              |

## Commands

### CEREMONY_WEBAPP_NUXT (main frontend)

```bash
cd CEREMONY_WEBAPP_NUXT
npm install
npm run dev          # http://localhost:3000
npm run build
npm run lint
npm run typecheck
```

### CEREMONY_WEB_NUXT

```bash
cd CEREMONY_WEB_NUXT
pnpm install
pnpm dev
pnpm build
pnpm lint
```

### WED_WEBAPP_NUXT

```bash
cd WED_WEBAPP_NUXT
npm install
npm run dev          # --host flag enabled, exposes on network
npm run build
```

### WEBAPP_NUXT_MODULE

```bash
cd WEBAPP_NUXT_MODULE
npm install
npm run dev:prepare  # stub build + nuxt prepare
npm run dev          # runs playground
npm run test         # vitest
npm run prepack      # build for distribution
```

### WED_BUILDER_SERVER

```bash
cd WED_BUILDER_SERVER
cp .env.sample .env  # fill in credentials
./mvnw spring-boot:run          # local dev
./mvnw clean package            # build JAR
docker compose up               # MySQL + app via Docker
docker compose up --build -d    # rebuild and run detached
```

Swagger UI available at `http://localhost:8080/swagger-ui/index.html`.

## Architecture

### CEREMONY_WEBAPP_NUXT

- **SSR disabled** (`ssr: false`) — pure SPA.
- **Component resolution**: Two sources merged — `WEBAPP_NUXT_MODULE/src/runtime/app/utils/getComponentPaths()` (shared module) and `app/utils/getComponentPaths.ts` (local). Components are auto-imported from both.
- **Stores** (`app/stores/`): Pinia stores (mix of `.js` and `.ts`). Key stores: `auth.js`, `guest.js`, `ceremony.js`, `checkin.js`, `layout.ts`, `theme.ts`.
- **Composables** (`app/composables/`): HTTP is done via `useHttp.js` / `http.ts` composables wrapping axios. Auth via `useAuth.ts`. Firebase via `firebase.js`.
- **i18n**: English (`en`) default, Khmer (`km`) supported. Lang files in `app/locales/`.
- **Styling**: Tailwind CSS 4 + SCSS. Global SCSS variables in `app/assets/styles/_variables.scss`, mixins in `_mixins.scss`. Both auto-injected via vite `additionalData`.
- **UI**: `@nuxt/ui` v4 (Reka UI based). Icons via RemixIcon (CDN) + Iconify.
- **Tables**: TanStack Vue Table (`@tanstack/vue-table`).
- **Pages** (`app/pages/`): Feature-grouped — `guest_management/`, `checkin/`, `setup_and_invitation/`, `user_and_privilege/`, `dashboard/`, `gallery/`, `reports/`, etc.
- **Layouts** (`app/layouts/`): `default.vue` (main dashboard shell), `auth.vue` (login/signup), `filemanager.vue`, `navbar.vue`.

### WED_BUILDER_SERVER

Standard Spring Boot layered architecture: `controller` → `service` → `repository` (Spring Data JPA) → MySQL.

- **Security**: JWT (access + refresh tokens) + Google OAuth2. Config in `security/`.
- **Key env vars**: `DB_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `MAIL_*`, `TELEGRAM_BOT_TOKEN`, `FRONTEND_URL`.
- API base: `http://localhost:8080`; frontend expects this at `NUXT_PUBLIC_API_URL`.

### WEBAPP_NUXT_MODULE

A publishable Nuxt module (`nuxt-module-build`). Source in `src/`. The main apps import utilities directly from `src/runtime/` during development rather than building the module first.

## Environment Setup

Copy `.env.sample` to `.env` in each project directory. The frontend `.env` key variables:

- `NUXT_PUBLIC_API_URL` — Spring Boot API URL
- `GOOGLE_CLIENT_ID` — shared with backend
- `JWT_SECRET` — for client-side token decode (not signing)

The backend `.env` requires a running MySQL instance (or use `docker compose up` which starts one).

## Integration Notes

### HTTP Layer

- **Main composable:** `app/composables/http.ts` — wraps axios, attaches `Authorization: Bearer {token}`, handles proactive token refresh (30s early) and reactive retry on 401. Use this for all API calls.
- **Legacy composable:** `app/composables/useHttp1.js` — simpler, no refresh/retry, just clears auth and redirects on 401. Do not use for new code; consolidate to `http.ts`.
- **Auth header:** `JwtAuthenticationFilter` expects `Authorization: Bearer {token}`. Frontend sets this via `useOptions()` in `http.ts`.

### Request/Response Envelope

All backend responses are wrapped:

```json
{ "code": "...", "message": "...", "data": <T>, "timestamp": "..." }
```

Stores extract payload with `data.value?.data ?? data.value`. Paginated responses use Spring's `PageResponse`:

```json
{ "content": [], "page": 0, "size": 20, "totalElements": 0, "totalPages": 0 }
```

### Token Management

- Tokens stored in cookies (`access_token`, `refresh_token`) AND duplicated in Pinia state — can get out of sync. Treat cookies as the source of truth.
- Refresh flow: `app/composables/refreshToken.js` handles proactive refresh with a queue to prevent concurrent refresh races.
- Token expiry check uses `atob()` to decode JWT payload and treats expiry as 30 seconds early.

### Field Mapping Conventions

Frontend uses camelCase form fields → mapped to backend's UPPER_CASE enums via `toApi()` functions in each store:

- `form.gender` → `'MALE'` / `'FEMALE'`
- `form.seats` → `totalGuests`
- `form.side` → `'BRIDE'` / `'GROOM'`
- `status: 'in-progress'` → `'IN_PROGRESS'`
- Datetime sent as `"yyyy-MM-dd'T'HH:mm:ss"` (no timezone) — matches backend `@JsonFormat`.

### Auth & Wedding Initialization

Auth and wedding data are bootstrapped in `app/plugins/auth.js` (runs before route middleware):

1. `authStore.init()` → reads `access_token` cookie → sets `isAuthenticated` → calls `fetchMe()` to load user + permissions from `/api/v1/users/me`
2. If authenticated, `eventStore.fetchEvents()` fetches the wedding list and selects the first one

**Critical**: auth init must happen in a Nuxt plugin (`app/plugins/auth.js`), NOT in `app.vue` `onMounted`. Plugins run before route middleware; `onMounted` runs after components mount (after middleware), which means the permission middleware would block all pages before auth is ready.

All four login paths (`login`, `register`, `loginWithGoogle`, `loginWithTelegram`) in `auth.js` store call `eventStore.fetchEvents()` after successful auth.

### Wedding Store vs Event Store

There are **two wedding-related stores**:

- `stores/event.js` (`useEventStore`) — the primary store. Has `fetchEvents()`, `activeEvent`, color mapping, `_syncGuestStore`. Used by `EventSelector.vue` and all pages via `onMounted`.
- `stores/wedding.js` (`useWeddingStore`) — simpler store, mostly unused in the main app flow.

Always use `useEventStore` and call `eventStore.fetchEvents()`. Never call `weddingStore.load()` for page initialization.

### Page Setup Pattern

Every protected page must follow this pattern:

```js
// 1. Always include BOTH auth and permission middleware
definePageMeta({
  layout: "navbar",
  middleware: ["auth", "permission"],
  permission: "VIEW_WHATEVER",
});

// 2. Load data in onMounted (not setup) — eventStore may not be ready at setup time
onMounted(async () => {
  if (!eventStore.initialized) await eventStore.fetchEvents();
  if (eventStore.activeEvent?.id) await myStore.fetchData();
});

// 3. Re-fetch when active wedding changes
watch(
  () => eventStore.activeEvent?.id,
  (id) => {
    if (id) myStore.fetchData();
  },
);
```

Using `middleware: 'permission'` alone (without `'auth'`) causes unauthenticated redirects. The `auth` middleware must always be first in the array.

### Toast Signature

`useToastStore` methods take **(message, title)** — message first, title second:

```js
toast.add("Guest added successfully", "Success"); // ✓ correct
toast.add("Success", "Guest added successfully"); // ✗ wrong — args reversed
toast.add("Failed to save", "Error");
```

### Budget Store Computed Fields

`budgetStore.categories` is computed from budget items grouped by `category` string. Each entry has:
`{ id, name, budget (plannedAmount sum), spent (actualAmount sum), items[] }`

There is **no** `color`, `icon`, or `allocated` field. Use `cat.budget` (not `cat.allocated`) in templates, and provide a static icon/color.

`budgetStore.transactions` is an alias for `budgetStore.items`. Each item has: `id, category, vendorName, plannedAmount, actualAmount, variance, paymentStatus, notes, createdAt` — NOT `description`, `date`, `amount`, or `status`.

### Notification Store Fields

`useNotificationStore` (`stores/notification.js`) maps API responses to:
`{ id, title, message, type, read, time, link }`

There is **no** `color`, `icon`, `titleKm`, or `messageKm`. Use `notif.type` for color class and `notif.title`/`notif.message` directly.

`fetchUnreadCount` extracts the count as `result?.count` — the API returns `{ "data": { "count": N } }`, not a plain number.

`AppHeader.vue` calls `notifStore.fetchUnreadCount()` in `onMounted` to populate the bell badge on load.

The `notifications/index.vue` page maps `notif.type` → icon via a local `typeIcon()` function:

```js
const typeIcon = (type) =>
  ({
    success: "ri-check-circle-line",
    warning: "ri-alert-line",
    error: "ri-error-warning-line",
    info: "ri-information-line",
  })[type] ?? "ri-notification-3-line";
```

SCSS color classes are `ni-success`, `ni-info`, `ni-warning`, `ni-error` — do not use `ni-accent` for API-driven notifications.

### Superadmin Bypass Pattern (Backend)

`ROLE_SUPER_ADMIN` users have a null `organizationId` from `SecurityUtil.getCurrentOrganizationId()`. Every controller list endpoint must check for superadmin and pass `null` orgId to the service. The service must then skip org-scoped repository queries:

```java
// Controller
Authentication auth = SecurityContextHolder.getContext().getAuthentication();
boolean isSuperAdmin = auth.getAuthorities().stream()
        .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
String orgId = isSuperAdmin ? null : SecurityUtil.getCurrentOrganizationId();

// Service getByWedding / list method
if (organizationId == null) {
    weddingRepository.findById(weddingId)
            .orElseThrow(() -> new ResourceNotFoundException("Wedding", weddingId));
    return PageResponse.of(repository.findAllByWeddingId(weddingId, pageable).map(this::toResponse));
}
// else: org-scoped path as normal
```

This pattern is applied to: `WeddingController`, `GuestController`, `TaskController`, `BudgetController`, `GiftRecordController`. Apply it to any new list endpoint too.

### Role Assignment on Account Creation

There are three paths that create a user, each assigns a different default role:

| Path | Endpoint | Role assigned | Notes |
|---|---|---|---|
| **Self-registration** | `POST /api/v1/auth/register` | `OWNER` | Also auto-creates a new org (plan: `FREE`) and a fresh `OWNER` role for it with all `OWNER_PERMISSIONS` |
| **Admin creates user** | `POST /api/v1/users` | `VIEWER` (fallback: `MANAGER`) | If `roleId` is provided in the request body, that role is used instead. Assigning `SUPER_ADMIN` or `OWNER` requires the caller to be `SUPER_ADMIN`. |
| **OAuth (Google/Telegram)** | `POST /api/v1/auth/oauth/*` | `VIEWER` | Finds or creates the org's `VIEWER` role. Same org as the authenticating user. |

Key rules:
- `SUPER_ADMIN` and `OWNER` can only be assigned by a caller with `ROLE_SUPER_ADMIN`
- Default fallback order when no `roleId` given: `VIEWER` → `MANAGER` (throws if neither exists)
- Self-registered users always start on the `FREE` subscription plan

### Role & Permission System

#### How Authorities Work

Spring Security grants two types of authorities per user (from `UserDetailsImpl`):

- **Permission codes** — e.g. `VIEW_GUEST`, `CREATE_WEDDING` (checked via `hasAuthority(...)`)
- **Role names** — e.g. `ROLE_SUPER_ADMIN`, `ROLE_OWNER` (checked via `hasRole(...)`)

Users can have multiple roles. Permissions are the **union** of all their roles' permissions.

Roles are **org-scoped** (except `SUPER_ADMIN` which is platform-only). When a new org is created, `RoleSeederService.seedDefaultRoles()` automatically seeds all 9 org-level roles for it.

#### Role Assignment

| Action                | Required Permission           | Endpoint                                       |
| --------------------- | ----------------------------- | ---------------------------------------------- |
| Assign role to user   | `ASSIGN_ROLE`                 | `POST /api/v1/users/{userId}/roles/{roleId}`   |
| Remove role from user | `ASSIGN_ROLE`                 | `DELETE /api/v1/users/{userId}/roles/{roleId}` |
| Create/edit roles     | `ROLE_CREATE` / `ROLE_UPDATE` | `POST/PUT /api/v1/roles`                       |
| List all permissions  | `ROLE_VIEW`                   | `GET /api/v1/roles/permissions`                |

Only `SUPER_ADMIN` and `OWNER` have `ASSIGN_ROLE` + `ROLE_CREATE/UPDATE/DELETE` by default.

#### System Roles & Their Permissions

| Role                   | Level    | Key Permissions                                                                                                                    |
| ---------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **SUPER_ADMIN**        | Platform | All 45 permissions. Platform-only (not org-scoped). Uses `hasRole('SUPER_ADMIN')` for admin-only endpoints.                        |
| **OWNER**              | Org      | Full org control: user/role management + all wedding features + audit logs. 38 permissions.                                        |
| **MANAGER**            | Org      | Day-to-day ops: wedding update/settings, guest CRUD, invitations, tables, tasks, ceremonies, check-in. 29 permissions.             |
| **CHECKIN**            | Org      | Check-in only: VIEW_WEDDING, VIEW_GUEST, CHECKIN_GUEST, MANUAL_CHECKIN, VIEW_CHECKIN_LOG, VIEW_TABLE, VIEW_SEATING. 7 permissions. |
| **ACCOUNTANT**         | Org      | Finance: VIEW_WEDDING, VIEW_FINANCE, MANAGE_BUDGET, ADD_GIFT_RECORD, EXPORT_FINANCE_REPORT. 5 permissions.                         |
| **INVITATION_MANAGER** | Org      | Invitations: VIEW_WEDDING, VIEW_GUEST, SEND_INVITATION, RESEND_INVITATION, VIEW_NOTIFICATION, EXPORT_GUEST_LIST. 6 permissions.    |
| **TABLE_MANAGER**      | Org      | Seating: VIEW_WEDDING, VIEW_GUEST, full TABLE permissions + ASSIGN_GUEST_TABLE + VIEW_SEATING. 8 permissions.                      |
| **CEREMONY_MANAGER**   | Org      | Ceremony: VIEW_WEDDING + full CEREMONY CRUD. 5 permissions.                                                                        |
| **SECURITY**           | Org      | Entrance: VIEW_WEDDING, VIEW_GUEST, CHECKIN_GUEST, VIEW_CHECKIN_LOG, VIEW_SECURITY_REPORT. 5 permissions.                          |
| **VIEWER**             | Org      | Read-only: VIEW_WEDDING, VIEW_GUEST, VIEW_TABLE, VIEW_CEREMONY. 4 permissions.                                                     |

#### All 45 Permissions by Category

| Category    | Permissions                                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Platform    | `ORG_VIEW` `ORG_CREATE` `ORG_UPDATE` `ORG_DELETE` `ACCOUNT_BLOCK` `SUBSCRIPTION_MANAGE` `SYSTEM_MONITORING` `VIEW_AUDIT_LOGS` `MANAGE_GLOBAL_SETTINGS` |
| Roles       | `ROLE_VIEW` `ROLE_CREATE` `ROLE_UPDATE` `ROLE_DELETE`                                                                                                  |
| Users       | `VIEW_USER` `CREATE_USER` `UPDATE_USER` `DELETE_USER` `ASSIGN_ROLE`                                                                                    |
| Weddings    | `VIEW_WEDDING` `CREATE_WEDDING` `UPDATE_WEDDING` `DELETE_WEDDING` `WEDDING_SETTING`                                                                    |
| Guests      | `VIEW_GUEST` `CREATE_GUEST` `UPDATE_GUEST` `DELETE_GUEST`                                                                                              |
| Invitations | `SEND_INVITATION` `RESEND_INVITATION` `VIEW_NOTIFICATION` `EXPORT_GUEST_LIST`                                                                          |
| Tables      | `VIEW_TABLE` `CREATE_TABLE` `UPDATE_TABLE` `DELETE_TABLE` `ASSIGN_GUEST_TABLE` `VIEW_SEATING`                                                          |
| Finance     | `VIEW_FINANCE` `MANAGE_BUDGET` `ADD_GIFT_RECORD` `EXPORT_FINANCE_REPORT`                                                                               |
| Tasks       | `VIEW_TASK` `CREATE_TASK` `UPDATE_TASK` `DELETE_TASK` `ASSIGN_TASK`                                                                                    |
| Ceremonies  | `VIEW_CEREMONY` `CREATE_CEREMONY` `UPDATE_CEREMONY` `DELETE_CEREMONY`                                                                                  |
| Check-in    | `CHECKIN_GUEST` `MANUAL_CHECKIN` `VIEW_CHECKIN_LOG`                                                                                                    |
| Reports     | `EXPORT_REPORT` `VIEW_SECURITY_REPORT`                                                                                                                 |

#### Permission Required Per Endpoint

| Controller                             | Method          | Endpoint                                                           | Permission                            |
| -------------------------------------- | --------------- | ------------------------------------------------------------------ | ------------------------------------- |
| **Wedding**                            | POST            | `/weddings`                                                        | `CREATE_WEDDING`                      |
|                                        | GET             | `/weddings` `/weddings/{id}` `/weddings/{id}/dashboard`            | `VIEW_WEDDING`                        |
|                                        | PUT             | `/weddings/{id}`                                                   | `UPDATE_WEDDING`                      |
|                                        | DELETE          | `/weddings/{id}`                                                   | `DELETE_WEDDING`                      |
|                                        | PUT             | `/weddings/{id}/settings`                                          | `WEDDING_SETTING`                     |
| **Guest**                              | POST            | `/guests` `/guests/import`                                         | `CREATE_GUEST`                        |
|                                        | GET             | `/guests` `/guests/{id}`                                           | `VIEW_GUEST`                          |
|                                        | PUT             | `/guests/{id}`                                                     | `UPDATE_GUEST`                        |
|                                        | DELETE          | `/guests/{id}`                                                     | `DELETE_GUEST`                        |
| **Task**                               | POST            | `/tasks`                                                           | `CREATE_TASK`                         |
|                                        | GET             | `/tasks` `/tasks/{id}`                                             | `VIEW_TASK`                           |
|                                        | PUT             | `/tasks/{id}`                                                      | `UPDATE_TASK`                         |
|                                        | DELETE          | `/tasks/{id}`                                                      | `DELETE_TASK`                         |
| **Budget**                             | POST PUT DELETE | `/budgets`                                                         | `MANAGE_BUDGET`                       |
|                                        | GET             | `/budgets` `/budgets/{id}`                                         | `VIEW_FINANCE`                        |
| **Gift**                               | POST PUT        | `/gifts`                                                           | `ADD_GIFT_RECORD`                     |
|                                        | GET             | `/gifts` `/gifts/{id}`                                             | `VIEW_FINANCE`                        |
|                                        | DELETE          | `/gifts/{id}`                                                      | `MANAGE_BUDGET`                       |
| **Finance**                            | GET             | `/finance/summary`                                                 | `VIEW_FINANCE`                        |
| **Table**                              | POST            | `/tables`                                                          | `CREATE_TABLE`                        |
|                                        | GET             | `/tables` `/tables/{id}`                                           | `VIEW_TABLE`                          |
|                                        | PUT             | `/tables/{id}`                                                     | `UPDATE_TABLE`                        |
|                                        | DELETE          | `/tables/{id}`                                                     | `DELETE_TABLE`                        |
|                                        | POST DELETE     | `/tables/assign`                                                   | `ASSIGN_GUEST_TABLE`                  |
| **Ceremony**                           | POST            | `/ceremonies`                                                      | `CREATE_CEREMONY`                     |
|                                        | GET             | `/ceremonies` `/ceremonies/{id}`                                   | `VIEW_CEREMONY`                       |
|                                        | PUT             | `/ceremonies/{id}`                                                 | `UPDATE_CEREMONY`                     |
|                                        | DELETE          | `/ceremonies/{id}`                                                 | `DELETE_CEREMONY`                     |
| **Check-in**                           | POST            | `/checkin` `/checkin/qr/{qrCode}`                                  | `CHECKIN_GUEST`                       |
|                                        | GET             | `/checkin/logs`                                                    | `VIEW_CHECKIN_LOG`                    |
| **User**                               | POST            | `/users`                                                           | `CREATE_USER`                         |
|                                        | GET             | `/users` `/users/{id}`                                             | `VIEW_USER`                           |
|                                        | PUT             | `/users/{id}`                                                      | `UPDATE_USER` or `ACCOUNT_BLOCK`      |
|                                        | DELETE          | `/users/{id}`                                                      | `DELETE_USER`                         |
|                                        | POST DELETE     | `/users/{userId}/roles/{roleId}`                                   | `ASSIGN_ROLE`                         |
| **Role**                               | POST            | `/roles`                                                           | `ROLE_CREATE`                         |
|                                        | GET             | `/roles` `/roles/{id}` `/roles/permissions`                        | `ROLE_VIEW`                           |
|                                        | PUT             | `/roles/{id}`                                                      | `ROLE_UPDATE`                         |
|                                        | DELETE          | `/roles/{id}`                                                      | `ROLE_DELETE`                         |
| **Org**                                | POST            | `/organizations`                                                   | `ORG_CREATE`                          |
|                                        | GET             | `/organizations` `/organizations/{id}`                             | `ORG_VIEW`                            |
|                                        | PUT             | `/organizations/{id}`                                              | `ORG_UPDATE` or `SUBSCRIPTION_MANAGE` |
|                                        | DELETE          | `/organizations/{id}`                                              | `ORG_DELETE`                          |
| **Invitation**                         | GET             | `/invitations`                                                     | `SEND_INVITATION`                     |
| **Email**                              | POST            | `/guests/{id}/email/send` `/email/send-all`                        | `SEND_INVITATION`                     |
| **Telegram**                           | POST            | `/guests/{id}/telegram/send` `/telegram/send-all` `/telegram/test` | `UPDATE_GUEST`                        |
| **Gallery/Wishes**                     | ALL             | `/gallery` `/wishes`                                               | `WEDDING_SETTING`                     |
| **Files**                              | POST DELETE     | `/files/upload` `/files/{id}`                                      | `UPDATE_WEDDING`                      |
|                                        | GET             | `/files` `/weddings/{id}/files`                                    | `VIEW_WEDDING`                        |
| **Admin** (userbot, templates, config) | ALL             | `/admin/**`                                                        | `hasRole('SUPER_ADMIN')`              |

#### Default Demo Credentials (DataSeeder)

| Username     | Password   | Role        |
| ------------ | ---------- | ----------- |
| `superadmin` | `super123` | SUPER_ADMIN |
| `admin_demo` | `admin123` | OWNER       |
| `planner`    | `plan123`  | MANAGER     |

### Known Issues

**[MEDIUM] Duplicate token storage** — `auth.js` stores tokens in cookies, Pinia state (`access_token`, `accessToken`), and `localStorage` (`user_data`, `permissions`). Treat cookies as the source of truth; the Pinia state copies are for reactive reads within the session.

## API Reference

All endpoints served by `WED_BUILDER_SERVER` at base `/api/v1/`. Frontend calls them via `NUXT_PUBLIC_API_URL`. Swagger UI: `http://localhost:8080/swagger-ui/index.html`.

### Authentication — `AuthController`, `OAuthController`

| Method | Endpoint                               |
| ------ | -------------------------------------- |
| POST   | `/api/v1/auth/register`                |
| POST   | `/api/v1/auth/login`                   |
| POST   | `/api/v1/auth/refresh`                 |
| POST   | `/api/v1/auth/oauth/google`            |
| POST   | `/api/v1/auth/oauth/telegram`          |
| GET    | `/api/v1/auth/oauth/telegram/callback` |
| POST   | `/api/v1/auth/register`                |
| POST   | `/api/v1/auth/forgot-password`         |
| POST   | `/api/v1/auth/reset-password`          |

### Users — `UserController`

| Method | Endpoint                                |
| ------ | --------------------------------------- |
| GET    | `/api/v1/users/me`                      |
| GET    | `/api/v1/users?page&size`               |
| POST   | `/api/v1/users`                         |
| GET    | `/api/v1/users/{id}`                    |
| PUT    | `/api/v1/users/{id}`                    |
| DELETE | `/api/v1/users/{id}`                    |
| POST   | `/api/v1/users/{userId}/roles/{roleId}` |
| DELETE | `/api/v1/users/{userId}/roles/{roleId}` |

### Organizations — `OrganizationController`

| Method | Endpoint                     |
| ------ | ---------------------------- |
| GET    | `/api/v1/organizations`      |
| POST   | `/api/v1/organizations`      |
| GET    | `/api/v1/organizations/{id}` |
| PUT    | `/api/v1/organizations/{id}` |
| DELETE | `/api/v1/organizations/{id}` |

### Weddings — `WeddingController`

| Method | Endpoint                          |
| ------ | --------------------------------- |
| GET    | `/api/v1/weddings`                |
| POST   | `/api/v1/weddings`                |
| GET    | `/api/v1/weddings/{id}`           |
| PUT    | `/api/v1/weddings/{id}`           |
| DELETE | `/api/v1/weddings/{id}`           |
| PUT    | `/api/v1/weddings/{id}/settings`  |
| GET    | `/api/v1/weddings/{id}/dashboard` |

### Guests — `GuestController`

| Method | Endpoint                                                      |
| ------ | ------------------------------------------------------------- |
| GET    | `/api/v1/weddings/{weddingId}/guests?page&size`               |
| POST   | `/api/v1/weddings/{weddingId}/guests`                         |
| GET    | `/api/v1/weddings/{weddingId}/guests/{id}`                    |
| PUT    | `/api/v1/weddings/{weddingId}/guests/{id}`                    |
| DELETE | `/api/v1/weddings/{weddingId}/guests/{id}`                    |
| POST   | `/api/v1/weddings/{weddingId}/guests/import`                  |
| GET    | `/api/v1/weddings/{weddingId}/guests/qr/{qrCode}` (public)    |
| GET    | `/api/v1/weddings/{weddingId}/guests/invite/{token}` (public) |

### Ceremonies — `CeremonyController`

| Method | Endpoint                                       |
| ------ | ---------------------------------------------- |
| GET    | `/api/v1/weddings/{weddingId}/ceremonies`      |
| POST   | `/api/v1/weddings/{weddingId}/ceremonies`      |
| GET    | `/api/v1/weddings/{weddingId}/ceremonies/{id}` |
| PUT    | `/api/v1/weddings/{weddingId}/ceremonies/{id}` |
| DELETE | `/api/v1/weddings/{weddingId}/ceremonies/{id}` |

### Check-in — `CheckinController`

| Method | Endpoint                                              |
| ------ | ----------------------------------------------------- |
| GET    | `/api/v1/weddings/{weddingId}/checkin/logs?page&size` |
| POST   | `/api/v1/weddings/{weddingId}/checkin`                |
| POST   | `/api/v1/weddings/{weddingId}/checkin/qr/{qrCode}`    |

### Invitations — `InvitationController`, `InvitationTemplateController`

| Method | Endpoint                                           |
| ------ | -------------------------------------------------- |
| GET    | `/api/v1/weddings/{weddingId}/invitations`         |
| GET    | `/api/v1/invitation-templates`                     |
| GET    | `/api/v1/invitation-templates/active`              |
| PUT    | `/api/v1/invitation-templates/active/{templateId}` |

### Public Invite & QR — `InvitePageController`, `QrController` (no auth)

| Method | Endpoint                              |
| ------ | ------------------------------------- |
| GET    | `/api/v1/invite/{token}`              |
| POST   | `/api/v1/invite/{token}/track`        |
| POST   | `/api/v1/invite/{token}/rsvp/confirm` |
| POST   | `/api/v1/invite/{token}/rsvp/decline` |
| POST   | `/api/v1/invite/{token}/wishes`       |
| GET    | `/api/v1/qr/{qrCode}`                 |
| POST   | `/api/v1/qr/{qrCode}/rsvp/confirm`    |
| POST   | `/api/v1/qr/{qrCode}/rsvp/decline`    |
| POST   | `/api/v1/qr/{qrCode}/gift`            |

### Tasks — `TaskController`

| Method | Endpoint                                       |
| ------ | ---------------------------------------------- |
| GET    | `/api/v1/weddings/{weddingId}/tasks?page&size` |
| POST   | `/api/v1/weddings/{weddingId}/tasks`           |
| GET    | `/api/v1/weddings/{weddingId}/tasks/{id}`      |
| PUT    | `/api/v1/weddings/{weddingId}/tasks/{id}`      |
| DELETE | `/api/v1/weddings/{weddingId}/tasks/{id}`      |

### Budget — `BudgetController`

| Method | Endpoint                                         |
| ------ | ------------------------------------------------ |
| GET    | `/api/v1/weddings/{weddingId}/budgets?page&size` |
| POST   | `/api/v1/weddings/{weddingId}/budgets`           |
| GET    | `/api/v1/weddings/{weddingId}/budgets/{id}`      |
| PUT    | `/api/v1/weddings/{weddingId}/budgets/{id}`      |
| DELETE | `/api/v1/weddings/{weddingId}/budgets/{id}`      |

### Finance — `FinanceController`

| Method | Endpoint                                       |
| ------ | ---------------------------------------------- |
| GET    | `/api/v1/weddings/{weddingId}/finance/summary` |

### Gifts — `GiftRecordController`

| Method | Endpoint                                       |
| ------ | ---------------------------------------------- |
| GET    | `/api/v1/weddings/{weddingId}/gifts?page&size` |
| POST   | `/api/v1/weddings/{weddingId}/gifts`           |
| GET    | `/api/v1/weddings/{weddingId}/gifts/{id}`      |
| PUT    | `/api/v1/weddings/{weddingId}/gifts/{id}`      |
| DELETE | `/api/v1/weddings/{weddingId}/gifts/{id}`      |

### Gallery — `WeddingGalleryController`

| Method | Endpoint                                                                            |
| ------ | ----------------------------------------------------------------------------------- |
| GET    | `/api/v1/weddings/{weddingId}/gallery`                                              |
| POST   | `/api/v1/weddings/{weddingId}/gallery` (JSON: add from URL; multipart: upload file) |
| DELETE | `/api/v1/weddings/{weddingId}/gallery/{id}`                                         |

### Wishes — `WeddingWishController`

| Method | Endpoint                                        |
| ------ | ----------------------------------------------- |
| GET    | `/api/v1/weddings/{weddingId}/wishes?page&size` |
| DELETE | `/api/v1/weddings/{weddingId}/wishes/{id}`      |

### Seating Tables — `WeddingTableController`

| Method | Endpoint                                               |
| ------ | ------------------------------------------------------ |
| GET    | `/api/v1/weddings/{weddingId}/tables`                  |
| POST   | `/api/v1/weddings/{weddingId}/tables`                  |
| GET    | `/api/v1/weddings/{weddingId}/tables/{id}`             |
| PUT    | `/api/v1/weddings/{weddingId}/tables/{id}`             |
| DELETE | `/api/v1/weddings/{weddingId}/tables/{id}`             |
| POST   | `/api/v1/weddings/{weddingId}/tables/assign`           |
| DELETE | `/api/v1/weddings/{weddingId}/tables/assign/{guestId}` |

### Files — `FileController`

| Method | Endpoint                                       |
| ------ | ---------------------------------------------- |
| POST   | `/api/v1/files/upload`                         |
| GET    | `/api/v1/files?page&size`                      |
| GET    | `/api/v1/weddings/{weddingId}/files?page&size` |
| DELETE | `/api/v1/files/{fileId}`                       |

### Notifications — `NotificationController`

| Method | Endpoint                             |
| ------ | ------------------------------------ |
| GET    | `/api/v1/notifications?page&size`    |
| GET    | `/api/v1/notifications/unread-count` |
| PATCH  | `/api/v1/notifications/{id}/read`    |
| PATCH  | `/api/v1/notifications/read-all`     |
| DELETE | `/api/v1/notifications/{id}`         |

### Roles & Permissions — `RoleController`

| Method | Endpoint                    |
| ------ | --------------------------- |
| GET    | `/api/v1/roles`             |
| POST   | `/api/v1/roles`             |
| GET    | `/api/v1/roles/{id}`        |
| PUT    | `/api/v1/roles/{id}`        |
| DELETE | `/api/v1/roles/{id}`        |
| GET    | `/api/v1/roles/permissions` |

### Telegram / Email — `TelegramController`, `EmailController`

| Method | Endpoint                                                         |
| ------ | ---------------------------------------------------------------- |
| POST   | `/api/v1/weddings/{weddingId}/guests/{guestId}/telegram/send`    |
| POST   | `/api/v1/weddings/{weddingId}/telegram/send-all?status={status}` |
| POST   | `/api/v1/weddings/{weddingId}/telegram/test`                     |
| POST   | `/api/v1/weddings/{weddingId}/guests/{guestId}/email/send`       |
| POST   | `/api/v1/weddings/{weddingId}/email/send-all`                    |

### Legacy Guest API — `Guest.postman_collection.json` (base: `http://localhost:8080/api/guests`)

> Separate older API, does not use the `/api/v1/` prefix. Not called from the current Nuxt frontends.

| Method | Endpoint           |
| ------ | ------------------ |
| GET    | `/api/guests`      |
| GET    | `/api/guests/{id}` |
| POST   | `/api/guests`      |
| PUT    | `/api/guests/{id}` |
| DELETE | `/api/guests/{id}` |

### Admin — `AppConfigController`, `UserbotController`, `InvitationTemplateController`

| Method | Endpoint                                                         |
| ------ | ---------------------------------------------------------------- |
| GET    | `/api/v1/admin/config/email`                                     |
| PUT    | `/api/v1/admin/config/email`                                     |
| POST   | `/api/v1/admin/config/email/test`                                |
| GET    | `/api/v1/admin/userbot/status`                                   |
| POST   | `/api/v1/admin/userbot/auth/request-code`                        |
| POST   | `/api/v1/admin/userbot/auth/verify`                              |
| GET    | `/api/v1/admin/userbot/config`                                   |
| PUT    | `/api/v1/admin/userbot/config`                                   |
| GET    | `/api/v1/admin/invitation-templates?page&size`                   |
| POST   | `/api/v1/admin/invitation-templates`                             |
| GET    | `/api/v1/admin/invitation-templates/{id}`                        |
| PUT    | `/api/v1/admin/invitation-templates/{id}`                        |
| DELETE | `/api/v1/admin/invitation-templates/{id}`                        |
| POST   | `/api/v1/admin/invitation-templates/{templateId}/assign/{orgId}` |
| DELETE | `/api/v1/admin/invitation-templates/{templateId}/revoke/{orgId}` |
| GET    | `/api/v1/admin/invitation-templates/org/{orgId}`                 |
| GET    | `/api/v1/admin/invitation-templates/{templateId}/orgs`           |

## WED_WEBAPP_NUXT — Guest-Facing PWA

### QR Multi-Purpose Tool (`dashboard/qr.vue`)

`GET /api/v1/qr/{qrCode}` returns a unified `QrActionResponse` used for all 5 purposes. The `availableActions` array drives which UI panels render:

| Action                          | UI shown                |
| ------------------------------- | ----------------------- |
| `RSVP_CONFIRM` / `RSVP_DECLINE` | RSVP buttons            |
| `CHECKIN`                       | Check In Now button     |
| `RECORD_GIFT`                   | Gift amount form        |
| `VIEW_SEATING`                  | Table number card       |
| `VIEW_ATTENDANCE`               | Attendance progress bar |

Staff call `POST /api/v1/qr/{qrCode}/gift` to record gifts. `quick-gift.vue` is the optimized wedding-day entry flow.

### Public Invite Page (`pages/invite/[token].vue`)

Loads data via `GET /api/v1/invite/{token}` (public, no auth). Fires `POST /api/v1/invite/{token}/track` on load (fire-and-forget). Dynamically renders one of 10 templates based on `inv.activeTemplateKey`.

All template logic is shared via `app/composables/useInviteActions.js` — pass `toRef(props, 'inv')` and `props.token`.

**Endpoints consumed by `useInviteActions`:**

| Function          | Endpoint                                            |
| ----------------- | --------------------------------------------------- |
| `rsvp('confirm')` | `POST /api/v1/invite/{token}/rsvp/confirm`          |
| `rsvp('decline')` | `POST /api/v1/invite/{token}/rsvp/decline`          |
| `submitWish()`    | `POST /api/v1/invite/{token}/wishes`                |
| `recordGift()`    | `POST /api/v1/qr/{qrCode}/gift` (uses `inv.qrCode`) |

### Gift Recording on Invite Page

`recordGift()` in `useInviteActions.js` calls `POST /api/v1/qr/{inv.qrCode}/gift`. The section is injected into all 10 invite templates between the bank/payment section and the gallery section. It only renders when `inv.availableActions?.includes('RECORD_GIFT')`.

After a successful call, `inv.value` is replaced with the full refreshed server response (which includes updated `giftHistory` and auto check-in if guest was CONFIRMED/INVITED).

Available composable state:

- `giftForm` — `{ amount, giftType: 'CASH'|'GIFT', description }`
- `giftLoading`, `giftError`, `giftSuccess` refs
- `allGifts` computed — merges `localGifts` (optimistic) + `inv.giftHistory`

### Invite Template List

10 templates in `app/components/InviteTemplate/`: `Classic`, `Garden`, `Modern`, `Royal`, `Rustic`, `Sakura`, `Midnight`, `Boho`, `Celestial`, `Tropical`. Each uses `var(--inv-primary)` / `var(--inv-secondary)` CSS variables set at the root from `inv.inviteColors` (parsed by `useInviteTheme.js`). All sections are ordered identically; gift record form is section between bank info and gallery.

### Offline Support (WED_WEBAPP_NUXT)

`stores/offlineCheckin.js` and `stores/offlineGifts.js` queue operations in IndexedDB when offline. On reconnect, `syncQueue(api)` replays them. Both `checkin.vue` and `quick-gift.vue` implement the offline/online pattern with `watch(isOnline, ...)`.

## CEREMONY_WEBAPP_NUXT — Role & User Management

### User Management (`pages/user_and_privilege/user_management/index.vue`)

Uses `useHttp` directly (no store) for user CRUD. Roles are fetched on modal open via `GET /api/v1/roles`. `AssignRoleModal` component handles role assignment (requires `ASSIGN_ROLE` permission).

### Group Management (`pages/user_and_privilege/group_management/index.vue`)

Permission editor with sidebar role list + grouped permission checkboxes. `PERM_GROUPS` constant defines all 12 permission categories with codes, icon, and color class. `ensurePermissions()` lazy-loads all 45 permissions from `GET /api/v1/roles/permissions` only when editing starts.

Key computed helpers:

- `codeToPermMap` — maps permission code → `{ id, code }` object
- `groupPerms(group)` — permissions in a group that exist in `allPermissions`
- `unknownGroupCodes(group)` — codes not yet in org's permission list (shown as locked chips)
- `allGroupSelected(group)` / `toggleGroup(group)` — select-all per group

## QR Gift — Auto Check-in Behavior

`POST /api/v1/qr/{qrCode}/gift` automatically checks in the guest if their status is `CONFIRMED` or `INVITED` before recording the gift. This is implemented in `QrServiceImpl.recordGift()`. The returned `QrActionResponse` reflects the updated `currentStatus` (`ATTENDED`) after the call.

**Always prefer the QR endpoint over the regular gifts API when the guest has a `qrCode`** — it gives auto check-in for free. Fall back to `POST /api/v1/weddings/{weddingId}/gifts` only when no `qrCode` is available (e.g. guest found by name search with no QR assigned).

## QrActionResponse vs GuestResponse — Field Name Differences

These two response types use different field names for the same concepts:

| Concept      | `QrActionResponse` (QR scan) | `GuestResponse` (list/search) |
| ------------ | ---------------------------- | ----------------------------- |
| Guest name   | `guestName`                  | `name`                        |
| Guest status | `currentStatus`              | `status`                      |
| Guest ID     | `guestId`                    | `id`                          |

When a component can hold either type (e.g. after QR scan OR name search), always access with fallback:

```js
guest.guestName || guest.name; // display name
guest.currentStatus || guest.status; // status badge
guest.guestId || guest.id; // ID for API calls
```

## QrScanner Component (`app/components/ui/QrScanner.vue`)

Used in both `CEREMONY_WEBAPP_NUXT` and `WED_WEBAPP_NUXT`. Emits `@scanned(code: string)` when a QR code is read.

**`@zxing/library` API note**: `listVideoInputDevices()` is an **instance method**, not a static method. Always call it on the reader instance:

```js
// ✓ correct
const reader = new BrowserMultiFormatReader();
const devices = await reader.listVideoInputDevices();

// ✗ wrong — throws "is not a function"
const devices = await BrowserMultiFormatReader.listVideoInputDevices();
```

**Camera permission errors** — the component handles these named error types explicitly:

- `NotAllowedError` — user denied camera permission in browser
- `NotFoundError` — no camera device on this machine
- `NotReadableError` — camera in use by another app
- Non-HTTPS on non-localhost — blocked by browser before `getUserMedia` is even called

**Camera requires a secure context**: `getUserMedia` only works on `localhost`, `127.0.0.1`, or HTTPS. On plain HTTP the component shows: _"Camera requires HTTPS. Use localhost or a secure connection."_

## CEREMONY_WEBAPP_NUXT — Gift Record Page (`pages/gift_record/index.vue`)

### Quick Gift Panel

The Quick Gift panel (toggled by the ⚡ Quick button in the header) supports three ways to find a guest:

1. **Camera scan** — `<QrScanner @scanned="onCameraScanned" />` calls `GET /api/v1/qr/{code}` to resolve the guest
2. **Manual QR paste** — text input that also calls `GET /api/v1/qr/{code}` on Enter or arrow button
3. **Name search** — filters `guestStore.guests` client-side, shows dropdown

After selecting a guest and entering an amount, **Save Gift**:

- If guest has `qrCode`: calls `POST /api/v1/qr/{qrCode}/gift` → auto check-in + gift recorded. Guest card stays for 2 seconds showing `ATTENDED` badge, then auto-clears.
- If no `qrCode`: calls `giftStore.addGift()` → regular gifts API, no check-in.

Toast shows "· ✅ Checked in" when auto check-in happened. Recent entries list shows the same indicator.

### `useHttp` in `gift_record/index.vue`

This page calls `useHttp` directly (not via store) for QR lookups. Pattern:

```js
const { data, error } = await useHttp(`/api/v1/qr/${code}`, {
  method: "GET",
  isGlobal: true,
});
const res = data.value?.data ?? data.value;
```

## CEREMONY_WEBAPP_NUXT — Pinia Store Convention

All stores in `app/stores/` use the **Options API format** with explicit `state`, `getters`, and `actions` blocks:

```js
export const useMyStore = defineStore("myStore", {
  state: () => ({
    // reactive data
  }),
  getters: {
    // computed values — (state) => ...
  },
  actions: {
    // methods — use `this` to access state/getters/other actions
  },
});
```

- Helper functions (`fromApi`, `toApi`, status maps) are defined **outside** the store at module level.
- Cross-store calls (e.g. `useEventStore()`, `useHttp()`, `useCookie()`) go inside **actions**, not in `state()`.
- `_weddingId()` is a private action helper used by all wedding-scoped stores to get `useEventStore().activeEvent?.id`.

## Subscription Plan System

### Overview

Subscription plans are stored in the `subscription_plans` table and managed exclusively by `SUPER_ADMIN` via `GET/POST/PUT/DELETE /api/v1/admin/subscription-plans`. Each `Organization` has a `subscriptionPlan` string field (e.g. `"FREE"`) that maps to a plan by name.

### Default Plans (seeded on startup)

| Plan | Max Weddings | Max Guests/Wedding | Max Users | Telegram | Email | Gallery | Wishes | Reports | Export |
|---|---|---|---|---|---|---|---|---|---|
| `FREE` | 1 | 100 | 3 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `PROFESSIONAL` | 10 | 500 | 20 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `ENTERPRISE` | unlimited (−1) | unlimited (−1) | unlimited (−1) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Budget management and task management are enabled on all plans. A limit of `−1` means unlimited.

### Backend Enforcement (`PlanLimitService`)

`PlanLimitService` is the single enforcement point — call it from service/controller layer, never inline the check:

| Method | Called from | Throws when |
|---|---|---|
| `checkWeddingLimit(orgId)` | `WeddingServiceImpl.create()` | org's wedding count ≥ plan limit |
| `checkGuestLimit(weddingId)` | `GuestServiceImpl.create()` | wedding's guest count ≥ plan limit |
| `checkUserLimit(orgId)` | `UserServiceImpl.create()` | org's user count ≥ plan limit |
| `requireTelegramInvite(orgId)` | `TelegramController` | `telegramInvite = false` |
| `requireEmailInvite(orgId)` | `EmailController` | `emailInvite = false` |
| `requireGallery(orgId)` | `WeddingGalleryController` | `gallery = false` |
| `requireWishes(orgId)` | *(ready to add)* | `wishes = false` |

All throw `BusinessException` (HTTP 400) with a human-readable upgrade message.

`getPlan(orgId)` looks up the org's `subscriptionPlan` string → finds matching `SubscriptionPlan` by name → falls back to the `FREE` row if not found.

### Frontend (`usePlanStore`)

`usePlanStore` fetches `GET /api/v1/organizations/my-plan` on login (parallel with `fetchEvents`). Exposes:

```js
planStore.canTelegram   // boolean
planStore.canEmail
planStore.canGallery
planStore.canWishes
planStore.canReports
planStore.canExport
planStore.maxWeddings   // int, -1 = unlimited
planStore.maxGuests
planStore.maxUsers
planStore.isAtLimit('weddings', currentCount)  // boolean
planStore.limitLabel('weddings', currentCount) // "2/10"
planStore.displayName   // "Professional"
```

### `<PlanGate>` Component

Wraps any section with a blur lock overlay when the feature is off:

```vue
<PlanGate feature="gallery" label="Gallery is not available on your current plan">
  <!-- page content -->
</PlanGate>
```

Supported `feature` values: `telegram`, `email`, `gallery`, `wishes`, `reports`, `export`, `budget`, `tasks`.

### SuperAdmin Plans Page

Route: `/admin/plans` — only visible in sidebar for `ROLE_SUPER_ADMIN` users (filtered by `role` field in `data_menu.json` → `useMenu.ts`). Full CRUD: create/edit/delete plans with all limit and feature flag fields.

### Adding Limit Checks to New Endpoints

1. Inject `PlanLimitService` into the controller or service
2. Call the appropriate `check*` or `require*` method at the top of the create/action method
3. For new feature types, add a `requireXxx(orgId)` method to `PlanLimitService` and a boolean field to `SubscriptionPlan` entity + `SubscriptionPlanRequest/Response` DTOs
4. Add the feature key to `FEATURE_MAP` in `PlanGate.vue` and a getter to `usePlanStore`

## WED_BUILDER_SERVER — Known Backend Bugs Fixed

### Null Organization NPE (SuperAdmin)

`ROLE_SUPER_ADMIN` users have a non-null organization in the DB (`platformOrg`), but any user created without an org would crash these three locations. All fixed with null-safe guards:

**`UserDetailsImpl.build()`** — called on every login via `loadUserByUsername`:

```java
// Crashes if user.getOrganization() is null
String orgId = user.getOrganization() != null ? user.getOrganization().getId() : null;
OrganizationStatus orgStatus = user.getOrganization() != null
        ? user.getOrganization().getStatus()
        : OrganizationStatus.ACTIVE;
```

**`AuthServiceImpl`** — four call sites all use the same pattern:

```java
String orgId = user.getOrganization() != null ? user.getOrganization().getId() : null;
```

Affected methods: `login()`, `refreshToken()`, `buildAuthResponse()`, `loginWithGoogle/Telegram()`.

### Empty JWT_SECRET on Fresh Clone

`application.yaml` had `${JWT_SECRET:}` — empty default. On a fresh clone with no `.env` file, `Decoders.BASE64.decode("")` throws `IllegalArgumentException` → 500 on every request including login.

Fixed by adding a safe 256-bit Base64 fallback:

```yaml
jwt:
  secret: ${JWT_SECRET:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}
```

Always set `JWT_SECRET` in `.env` for production — the default is for local dev only.

## Docker Troubleshooting

### `connect ECONNREFUSED /Users/.../backend.sock`

Docker Desktop backend process is stuck/crashed. Fix:

```bash
pkill -f "Docker Desktop"
pkill -f "com.docker.docker"
open -a Docker
# wait for whale icon to stop animating, then retry
```

### `Cannot connect to the Docker daemon at unix:///Users/.../.docker/run/docker.sock`

Docker Desktop is not running. Launch it from Applications or:

```bash
open -a Docker
```

### MultipleBagFetchException on Login/Auth (`@EntityGraph` + multiple collections)

`@EntityGraph(attributePaths = {"roles", "roles.permissions"})` on `UserRepository` caused Hibernate to try JOIN-fetching two `List` collections simultaneously, which it cannot do:

```
org.hibernate.loader.MultipleBagFetchException: cannot simultaneously fetch multiple bags:
  [com.wedding.builder.entity.Role.permissions, com.wedding.builder.entity.User.roles]
```

**Fix**: Change both collections from `List`/`ArrayList` to `Set`/`HashSet` in the entities. Hibernate can simultaneously JOIN-fetch multiple `Set` collections, just not multiple `List` (bag) collections.

`User.java`:

```java
// Before
private List<Role> roles = new ArrayList<>();
// After
private Set<Role> roles = new HashSet<>();
```

`Role.java`:

```java
// Before
private List<Permission> permissions = new ArrayList<>();
private List<User> users = new ArrayList<>();
// After
private Set<Permission> permissions = new HashSet<>();
private Set<User> users = new HashSet<>();
```

**Cascading changes**: Any code that assigns an `ArrayList` to these fields must also switch to `new HashSet<>(...)`. Affected files: `DataSeeder.java`, `RoleSeederService.java`, `AuthServiceImpl.java`, `OAuthServiceImpl.java`, `UserServiceImpl.java`, `RoleServiceImpl.java`. All use `.stream()`, `.add()`, `.contains()`, `.removeIf()` which work identically on `Set`.

## CEREMONY_WEBAPP_NUXT — Performance

### First-Load Slowness — Known Issues & Fixes Applied

**Fix 1 — Auth startup (plugins/auth.js + stores/auth.js)**

- `init()` already calls `fetchMe()` internally inside `hydrate()` — no need to call it again in the plugin
- Login and register use `Promise.all([this.fetchMe(), useEventStore().fetchEvents()])` instead of sequential awaits
- Saves ~400–800ms on login and initial page load

**Fix 2 — Icon CDN libraries (nuxt.config.ts)**

- Only **RemixIcon** (`ri-*`) is loaded from CDN — all others (Font Awesome, Bootstrap Icons, Boxicons, Phosphor) are removed
- Do not re-add other icon CDN libraries; use RemixIcon classes only

**Fix 3 — jQuery removed (nuxt.config.ts)**

- jQuery and jquery-confirm are not loaded — use Vue native modals/confirms (`useConfirmStore`) instead

**Fix 4 — Lazy-loaded heavy components**

- `QrScanner` (uses `@zxing/library`) → `defineAsyncComponent` in any page that uses it — loads only when the panel opens
- `AttendanceOverview` / chart components (use `chart.js`) → `defineAsyncComponent` — loads only when dashboard renders
- `@zxing/library`, `chart.js`, `firebase` are in `vite.optimizeDeps.exclude` so Vite does not pre-bundle them

Pattern to follow for any heavy component:

```js
const HeavyComponent = defineAsyncComponent(
  () => import("~/components/path/HeavyComponent.vue"),
);
```

**Fix 5 — CDN preconnects (nuxt.config.ts)**

- `preconnect` + `dns-prefetch` added for `cdnjs.cloudflare.com` (RemixIcon CDN)
- Google Fonts already had `preconnect`
- Saves ~300ms DNS/TLS handshake before RemixIcon CSS loads

### Remaining Performance Issues (Not Yet Fixed)

| Priority | Issue                                                          | Location                            |
| -------- | -------------------------------------------------------------- | ----------------------------------- |
| HIGH     | 140 auto-imported components — all loaded upfront              | `utils/getComponentPaths.ts`        |
| HIGH     | 320 KB render-blocking CSS entry bundle                        | `nuxt.config.ts` / Tailwind         |
| MEDIUM   | Firebase 40 MB bundled even though lazily initialized          | `composables/firebase.js`           |
| MEDIUM   | 9-store cascade on active event change                         | `stores/event.js _syncGuestStore()` |
| MEDIUM   | No route-based code splitting beyond `/` prerender             | `nuxt.config.ts routeRules`         |
| LOW      | chart.js imports all registerables — only line/doughnut needed | `components/dashboard/`             |
| LOW      | 36 Pinia stores all auto-imported globally                     | `nuxt.config.ts imports.dirs`       |
| LOW      | i18n 990-line locale files with sync init overhead             | `app/locales/`                      |

## CEREMONY_WEBAPP_NUXT — No-Wedding Guard

### Behavior

When an authenticated user has no weddings yet, they are blocked from all main app pages and redirected to `/create-wedding` — a full-screen page (no sidebar, `layout: false`) with a simple form to create their first wedding.

After the wedding is created via `eventStore.addEvent()`, the user is redirected to `/` (dashboard) and normal app flow resumes.

**SUPER_ADMIN** is excluded from this guard — they are platform-level users with no org-specific weddings.

### Three-Layer Enforcement

| Layer | File | When it fires |
|---|---|---|
| Plugin | `app/plugins/auth.js` | After `fetchEvents()` on every app load — redirects immediately if `events.length === 0` |
| Route middleware | `app/middleware/auth.js` | On every SPA navigation — redirects if `eventStore.initialized && events.length === 0` |
| Page guard | `app/pages/create-wedding.vue` `onMounted` | Bounces back to `/` if a wedding already exists (prevents direct URL access) |

### Excluded Paths

These paths are always accessible even with no weddings:
`/create-wedding`, `/auth/*`, `/admin/*`, `/settings`, `/help`, `/profile`, `/oauth`, `/invite`, `/legal`, `/support`

### `create-wedding.vue` Form Fields

| Field | Required | Maps to `addEvent()` param |
|---|---|---|
| Bride Name | ✅ | `brideName` |
| Groom Name | ✅ | `groomName` |
| Wedding Date | ✅ | `date` (datetime-local → ISO string) |
| Venue | ❌ | `venue` |
| Budget | ❌ | `budget` (number, defaults to 0) |

### Key Implementation Notes

- The middleware check uses `eventStore.initialized` as a guard — if events haven't been fetched yet (store not initialized), the redirect is skipped so the app doesn't redirect prematurely during loading.
- `auth` middleware already runs globally on every route — the wedding check is appended inside it rather than creating a separate middleware file.
- The plugin redirect uses `useRoute()` to skip the redirect if the user is already on an excluded path (prevents redirect loop on app load when user is already at `/create-wedding`).

## Date Format Contract — Frontend ↔ Backend

### Backend expectation (`WeddingRequest.weddingDate`)

```java
@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
private LocalDateTime weddingDate;
```

`JacksonConfig` also registers a global `LocalDateTimeDeserializer` with the same pattern. The backend **requires seconds** — e.g. `"2025-06-15T14:30:00"`.

### Frontend pitfall (`datetime-local` input)

HTML `<input type="datetime-local">` produces `"2025-06-15T14:30"` (no seconds). Sending this directly causes a Jackson parse error (400).

### Fix — always applied in `eventStore.addEvent()`

```js
const formatDate = (dt) => {
  if (!dt) return null
  if (dt.length === 16) return `${dt}:00`   // pad missing seconds
  return dt.substring(0, 19)                // strip millis/tz if present
}
```

**Rule**: never send a raw `datetime-local` value to any backend endpoint. Always run it through `formatDate` (or an equivalent) before including it in a request body. This is centralised in `event.js addEvent()` so all callers (create-wedding page, events page, etc.) get the fix automatically.

### Missing `title` field

`WeddingRequest.title` is `@NotBlank`. The create-wedding form only collects bride/groom names. `addEvent()` auto-builds the title:

```js
const title = eventData.title
  || `${eventData.brideName || ''} & ${eventData.groomName || ''}`.trim()
  || 'My Wedding'
```

Do **not** add a separate title field to the create-wedding form — the couple-names combination is the source of truth.

## Auth Middleware — Register Link Fix

### Root causes (both fixed in `app/middleware/auth.js`)

**1. Non-existent `guest` middleware on register page**
`register.vue` had `middleware: 'guest'` but `app/middleware/guest.js` never existed. Nuxt throws on navigation to any route referencing a missing middleware, silently blocking the link. Fixed by removing it (`definePageMeta({ layout: 'auth' })`). The global `auth` middleware already redirects logged-in users away from auth pages.

**2. Stale token blocks Register**
The original middleware redirected any user with an `access_token` cookie away from auth pages — even if the token was expired. A user with a 24-hour-old stale cookie could never reach `/auth/register`. Fixed by checking expiry:

```js
// Only redirect if token is actually valid (not expired)
if (token && isAuthPage && !isJwtExpired(token)) {
  return navigateTo('/', { replace: true })
}
```

**3. Locale-prefixed paths (`/km/auth/register`) not matched**
Original `isAuthPage` checked exact path equality (`/auth/register`). With `strategy: "prefix_except_default"`, Khmer users navigate to `/km/auth/register`, which didn't match → they were redirected to login instead. Fixed with:

```js
function isAuthPath(path) {
  const authSuffixes = ['/auth/login', '/auth/register', '/auth/forgot-password']
  return authSuffixes.some((s) => path === s || path.endsWith(s) || path.startsWith(s + '/'))
}
```

## CEREMONY_WEBAPP_NUXT — Admin Plans Page Blank on First Navigation

### Symptom
`/admin/plans` renders blank (empty grid) on the first SPA navigation after login, but works correctly after a full page refresh (F5) followed by navigating away and back.

### Root causes
- `fetchPlans()` silently ignored errors — if the API call failed for any reason, `data.value` was null and `plans.value` fell back to `[]` with no visible feedback.
- On first SPA navigation to a lazy-loaded page chunk, Nuxt composable context (used by `useCookie` inside `useRefreshToken`) may not be fully settled when `onMounted` fires immediately.

### Fix applied (`app/pages/admin/plans.vue`)

1. **`nextTick()` before first fetch** — defers the API call until the component and its Nuxt context are fully ready:
```js
onMounted(async () => {
  await nextTick()
  await fetchPlans()
})
```

2. **Error visibility** — `fetchPlans` now captures and displays errors instead of silently falling back to `[]`:
```js
const fetchPlans = async () => {
  loading.value = true
  fetchError.value = null
  try {
    const { data, error } = await useHttp('/api/v1/admin/subscription-plans', { ... })
    if (error?.value) { fetchError.value = ...; toast.add(...); return }
    plans.value = data.value?.data ?? data.value ?? []
  } catch (e) { ... } finally { loading.value = false }
}
```

3. **Auth watch fallback** — retries if `isAuthenticated` becomes true after mount (race condition edge case):
```js
watch(() => authStore.isAuthenticated, (val) => {
  if (val && plans.value.length === 0 && !loading.value) fetchPlans()
})
```

### Pattern to apply to any page with this symptom
Any protected page that fetches in `onMounted` and shows blank on first navigation should:
- Add `await nextTick()` before the first API call in `onMounted`
- Show a loading spinner and error state instead of silently rendering empty
- Add a `watch` on `authStore.isAuthenticated` as a belt-and-suspenders retry

## Common Runtime Errors

### `t is not defined` in page/component script

**Cause:** Using `t('key')` without importing it. `t` is not auto-imported — it must be destructured from `useI18n()` or `useLocale()` explicitly.

**Wrong:**
```js
toast.add({ title: t('success') })  // ReferenceError: t is not defined
```

**Fix — option A:** destructure from `useLocale()` at the top of `<script setup>`:
```js
const { t } = useLocale()
```

**Fix — option B:** use plain strings with `useToastStore` (preferred for simple success/error messages):
```js
toast.add('Account created successfully', 'Welcome!')
toast.add('Registration failed. Please try again.', 'Error')
```

`useToastStore().success(message, title)` takes plain strings — no i18n needed for toast notifications.

### Stale `current_wedding_id` cookie → 404 on guests

**Symptom:** `GET /api/v1/weddings/{id}/guests 404` in console after login or DB wipe.

**Cause:** The `current_wedding_id` cookie persists a wedding ID that no longer exists on the backend (e.g. DB was reset during development). The guest store calls `fetchGuests` using this stale ID.

**Not a code bug** — the guest store already returns early on error (`if (error?.value) return`), so nothing breaks. Resolves itself once the user selects a valid wedding or clears cookies. In development, clear the `current_wedding_id` cookie after wiping the DB.

## WeddingStatus Enum — Frontend ↔ Backend Contract

### Backend enum values (`WeddingStatus.java`)
```
PLANNING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
```

### Common mistake
The frontend originally used `'UPCOMING'` and `'ACTIVE'` (invented names). These do **not** exist in the enum — Jackson throws `InvalidFormatException` on deserialization, which the global handler returns as `"An unexpected error occurred"` (HTTP 500).

### Correct status mapping

| Backend enum | Frontend (lowercased via `fromApi`) | Badge class | Color |
|---|---|---|---|
| `PLANNING` | `planning` | `badge-accent` | `var(--c-accent)` |
| `CONFIRMED` | `confirmed` | `badge-info` | `var(--c-accent-2)` |
| `IN_PROGRESS` | `in_progress` | `badge-success` | `var(--c-success)` |
| `COMPLETED` | `completed` | `badge-muted` | `var(--c-muted)` |
| `CANCELLED` | `cancelled` | `badge-danger` | `var(--c-danger)` |

### Rules
- `addEvent()` always sends `status: 'PLANNING'` for new weddings — never `'UPCOMING'`.
- `fromApi()` lowercases the status: `w.status.toLowerCase()` — so frontend always works with lowercase strings.
- `upcomingEvents` getter filters on `planning | confirmed | in_progress`.
- `statusBadge(s)` in `events/index.vue` maps lowercase status → CSS class.
- i18n keys match the lowercase frontend values: `"planning"`, `"confirmed"`, `"in_progress"`, `"completed"`, `"cancelled"`.

### Any new status-driven UI must use these exact values — do not invent new status names.

## Invitation Letter Setup — Frontend ↔ Backend Contract

### Overview

The invitation letter editor (`pages/setup_and_invitation/letter_setup2.vue`) persists all letter content to the `Wedding` entity via `PUT /api/v1/weddings/{id}/settings`. There is **no separate letter-setup endpoint** — letter fields are part of the wedding settings.

### Letter Fields on `Wedding` Entity

All fields are nullable strings. `inviteSchedule` is stored as a JSON string.

| Backend field | Frontend (`letter.*`) | Type |
|---|---|---|
| `inviteTemplateId` | `letter.template` | `VARCHAR(50)` |
| `invitePrimaryColor` | `letter.primaryColor` | `VARCHAR(20)` |
| `inviteBgColor` | `letter.bgColor` | `VARCHAR(20)` |
| `inviteTitleKm/En` | `letter.titleKm/En` | `TEXT` |
| `inviteOpeningKm/En` | `letter.openingKm/En` | `TEXT` |
| `groomFatherKm/En` | `letter.groomFatherKm/En` | `VARCHAR(200)` |
| `groomMotherKm/En` | `letter.groomMotherKm/En` | `VARCHAR(200)` |
| `groomAddressKm/En` | `letter.groomAddressKm/En` | `TEXT` |
| `brideFatherKm/En` | `letter.brideFatherKm/En` | `VARCHAR(200)` |
| `brideMotherKm/En` | `letter.brideMotherKm/En` | `VARCHAR(200)` |
| `brideAddressKm/En` | `letter.brideAddressKm/En` | `TEXT` |
| `weddingDateKm/En` | `letter.weddingDateKm/En` | `VARCHAR(100)` |
| `venueKm/En` | `letter.venueKm/En` | `VARCHAR(300)` |
| `venueAddressKm/En` | `letter.venueAddressKm/En` | `TEXT` |
| `inviteContacts` | `letter.contacts` | `VARCHAR(300)` |
| `rsvpNoteKm/En` | `letter.rsvpNoteKm/En` | `TEXT` |
| `closingKm/En` | `letter.closingKm/En` | `TEXT` |
| `inviteSchedule` | `letter.schedule` | `TEXT` (JSON array) |

### `Invitation` entity — `templateId` field

`Invitation.templateId` (VARCHAR 50) records which letter template was active when the invitation was sent. Included in `InvitationRequest` (optional) and `InvitationStatusResponse`.

### Save flow (`letter_setup2.vue`)

```js
// PUT /api/v1/weddings/{id}/settings
// Must include ALL existing wedding fields to avoid wiping them
const payload = {
  title: ev.title, groomName: ev.groomName, brideName: ev.brideName,
  // ... all other settings fields ...
  inviteTemplateId: letter.template,
  inviteSchedule: JSON.stringify(letter.schedule ?? []),
  // ... all other letter fields ...
}
await http(`/api/v1/weddings/${ev.id}/settings`, { method: 'PUT', body: payload })
eventStore.updateEvent(ev.id, { inviteTemplateId: letter.template, ... })
```

### Load flow (`letter_setup2.vue` `onMounted`)

```js
const ev = activeEvent.value
if (ev.inviteTemplateId) letter.template = ev.inviteTemplateId
if (ev.inviteSchedule?.length) letter.schedule = ev.inviteSchedule  // already parsed array
// ... all other fields, only overwrite if backend value is non-empty
```

`event.js` `fromApi()` maps all letter fields from `WeddingResponse`. `inviteSchedule` is parsed: `w.inviteSchedule ? JSON.parse(w.inviteSchedule) : []`.

### `SendInvitationModal.vue` — correct send channels

| Channel | How it works |
|---|---|
| `telegram` | `POST /api/v1/weddings/{id}/guests/{guestId}/telegram/send` |
| `email` | `POST /api/v1/weddings/{id}/guests/{guestId}/email/send` |
| `whatsapp` | Browser share via `wa.me/?text=...` — no API call |
| `facebook` | Browser share — no API call |
| `copy` | `navigator.clipboard.writeText(guestInviteUrl)` — no API call |

Invite URL is per-guest: `{origin}/invite/{guest.inviteToken}` — **not** `{origin}/invite/{weddingId}`.

### `useLetterTemplates` — single unified registry

`LETTER_TEMPLATES` (exported from `composables/useLetterTemplates.ts`) is the **single source of truth** — it merges both the old `Template` (component reference) and `LetterTemplate` (CSS vars) interfaces into one. The old `BUILTIN_TEMPLATES` and `Template` interface are removed.

Each entry has: `id`, `labelEn`, `labelKm`, `thumbnail`, `previewBg`, `previewBorder`, `component`, `vars`, `overrideCSS?`.

---

## Fixes Applied (2026-06-10)

### Critical: `body` → `data` mapping in `WEBAPP_NUXT_MODULE/useOptions.ts`

The module's `useOptions.ts` did not map `body` → `data` before passing to axios. The local `CEREMONY_WEBAPP_NUXT/useOptions.ts` does this correctly, but when the module version was resolved, every `POST`/`PUT` sent an empty body — causing `"Required request body is missing"` on the backend.

**Fix**: Destructure `body` from options and set `data: body ?? restOptions.data` in `WEBAPP_NUXT_MODULE/src/runtime/app/composables/useOptions.ts`. Also added `body?: FormData | object` to `HttpOptions` interface. FormData Content-Type is left unset so the browser sets the multipart boundary.

**Rule**: Always use `body:` (not `data:`) in `useHttp` calls. Both keys now work via the fallback, but `body:` is canonical.

### API Base URL Pattern

`config.public.apiUrl` from `useRuntimeConfig()` was undefined everywhere because `runtimeConfig` was not defined in `nuxt.config.ts`. This broke gallery images, invite pages, wedding settings file uploads, etc.

**Fix**: Added `runtimeConfig.public` to `nuxt.config.ts` reading `NUXT_PUBLIC_API_URL || API_URL`. All composables and stores that need the API base URL must use:

```js
function getBase() {
  const tmpServer = useCookie('tmp_server').value
  const { config } = helper()
  return (tmpServer || config.apiUrl || '').replace(/\/$/, '')
}
```

Never use `useRuntimeConfig().public.apiUrl` directly in stores — use `helper().config.apiUrl` instead.

### `isGlobal: true` required in all store `useHttp` calls

The module's `useOptions` returns `undefined` (silently) when `isGlobal` is false and the legacy `userCatch` cookie is absent. All `useHttp` calls in stores must include `isGlobal: true`.

**Affected stores fixed**: `invitations.js`, `task.js`, `budget.js`, `giftRecord.js`, `gallery.js`, `checkin.js`.

### Auth Store OAuth Calls use `data:` (safe)

`loginWithGoogle` and `loginWithTelegram` use `data:` key. This is safe because local `useOptions.ts` falls back to `restOptions.data` when `body` is undefined. Do not change to `body:` to avoid confusion — both work.

### Auth Page Fixes

- **`login.vue`**: `const localePath = useLocalePath()` was missing; `useLocale()` → `useSarikaLocale()`.
- **`register.vue`**: `useSarikaLocale()` missing for `tBy`; `handleGoogle` now triggers GSI popup (same as login.vue); `handleTelegram` injects real Telegram widget instead of showing a toast.
- **`forgot-password.vue`**: `useLocale()` → `useSarikaLocale()`.

### OAuth / Google Sign-In Configuration

`nuxt.config.ts` must have `runtimeConfig.public.googleClientId` and `telegramBotUsername` for OAuth buttons to work. `.env` must set:

```
GOOGLE_CLIENT_ID=368784825651-jas7lhv6obu1mqf9sumo1fll6h904o8h.apps.googleusercontent.com
TELEGRAM_BOT_USERNAME=wedding001_bot
API_URL=http://localhost:8080
```

Docker uses `NUXT_PUBLIC_API_URL` (read first), dev uses `API_URL`.

### Gallery Store — API base URL

`gallery.js _apiBase()` was using `useRuntimeConfig().public.apiUrl` (undefined). Fixed to use `helper().config.apiUrl`. Image URLs like `/uploads/orgId/file.jpg` now resolve to `http://localhost:8080/uploads/...`.

### Gallery Backend — Multipart Upload

`WeddingGalleryController` previously only accepted JSON `{ fileUrl }`. Added multipart `POST` handler that accepts `file` + optional `caption`, uploads via `FileService`, saves gallery record. GET permission changed from `WEDDING_SETTING` → `VIEW_WEDDING`.

### Wishes Backend — Pagination

`WeddingWishController GET` returned a flat `List` but the frontend expected `PageResponse`. Fixed to return `PageResponse<Map>`. Permission changed from `WEDDING_SETTING` → `VIEW_WEDDING`. Added `Page<GuestWish> findAllByWeddingId(weddingId, pageable)` to `GuestWishRepository`.

### Superadmin Bypass Applied to Additional Endpoints

The null-orgId superadmin bypass (documented above under "Superadmin Bypass Pattern") was missing from:
- `BudgetController.list` + `BudgetServiceImpl.getByWedding`
- `GiftRecordController.list` + `GiftRecordServiceImpl.getByWedding`
- `InvitationController.list` (also needed `GuestRepository.findAllByWeddingId(String)`)

All fixed to check `isSuperAdmin` and pass `null` orgId, using `findById(weddingId)` instead of `findByIdAndOrganizationId`.

### `fromApi` Fixes in `event.js`

- Default status fallback: `'UPCOMING'` → `'PLANNING'` (UPCOMING is not a valid `WeddingStatus` enum value)
- Default color fallback: `STATUS_COLORS.UPCOMING` (undefined) → `STATUS_COLORS.PLANNING`
- Added `wishNotifChatId` and `giftNotifChatId` fields — were in `WeddingResponse` but missing from `fromApi`, causing wedding-settings page to always load them as empty

### Middleware Pattern

Every protected page must use `middleware: ['auth', 'permission']` — not just `'permission'`. Pages missing `auth` caused unauthenticated redirect loops. Fixed on: `gallery`, `wishes`, `tasks`, `gift_record`, `invitations`, `wedding-settings`.

### Task i18n Keys

`"tasks"` was a flat string `"Tasks"` in `en.json`/`km.json`. The tasks page uses nested keys like `$t('tasks.title')`, `$t('tasks.pending')`, etc. Expanded to a nested object with all required keys.

### Task Store — `assignedTo` must be a user ID

`toApi` in `task.js` was sending `form.assignee` (display name) as `assignedTo`. The backend calls `userRepository.findById(assignedTo)` and throws 404 for any name string. Fixed to send `form.assignedToId || null`.

### Check-in Store Fix

- `checkinGuest` used `data:` → fixed to `body:`
- `fromLog` mapped `checkinTime` but backend returns `checkedInAt` — fixed with `l.checkedInAt ?? l.checkinTime`
- Manual check-in modal replaced raw "Guest ID" input with guest name search dropdown

### Auto Check-in on Gift Record

`GiftRecordServiceImpl.create()` now auto checks in the guest (sets status `ATTENDED`, creates `CheckinLog`) when:
1. `guestId` is provided in the request
2. Guest status is `CONFIRMED` or `INVITED`
3. Guest has not already been checked in (`existsByGuestIdAndWeddingId`)

This mirrors `QrServiceImpl.recordGift()` so both the QR path and regular gifts API give auto check-in.

### Invitation Store — `isGlobal: true` + `RTYModal` removed

All `useHttp` calls in `invitations.js` were missing `isGlobal: true` — silently failing. Also `invitations.vue` used `<RTYModal>` (non-existent component) — replaced with standard `<Teleport>/<Transition>` modal. `canSendInvite` was checking `auth.user?.role` (singular, undefined) — fixed to check `auth.user?.roles` array.

### Budget Page — Finance Summary Visible

`fetchSummary()` was called but `summary` data (`totalIncome`, `netProfit`, etc.) was never displayed. Added Finance P&L Summary section to `budget/index.vue` showing income, expenses, net profit, and `profitStatus` badge.

### Invite `[token].vue` — Template + Theme

- API base URL fixed: `config.public.apiUrl` → `helper().config.apiUrl`
- `tBy` added (was used but not imported)
- `TEMPLATE_MAP` extended to cover all `BUILTIN_TEMPLATES` keys: `blossom→Sakura`, `forest→Garden`, `vintage→Rustic`
- `inviteTheme` now derives colors from `BUILTIN_TEMPLATES` vars when no `inviteColors` JSON stored
- Same fix applied to `useInviteActions.js` BASE URL

### Template Setup Page (`letter_setup2.vue`)

Replaced stub with a full invitation template management page:
- Planners: view org-assigned templates, activate one via `PUT /api/v1/invitation-templates/active/{templateId}`
- SUPER_ADMIN: CRUD all templates, assign to orgs via searchable org dropdown (loads `GET /api/v1/organizations?page=0&size=200`)
- Org selector shows already-assigned badge, prevents double-assign, supports revoke

### Docker — Node 22 Required

`Dockerfile` must use `node:22-alpine` (not 20). Nuxt 4, `@nuxtjs/i18n`, and several dependencies require Node ≥22. Also add `RUN apk add --no-cache python3 make g++` for native addon compilation. Remove `--prefer-offline` from `npm ci`.

**Run frontend only (backend already running):**
```bash
cd WEDDING/
docker compose up webapp --no-deps -d --build
```

Built-in templates (8): `classic`, `royal`, `modern`, `blossom`, `forest`, `midnight`, `vintage`, `document`.

## Translation Management System (TMS)

### Overview

A full dynamic translation system stored in the DB. Keys are identifiers (never translated); values are translated per language. AI translates once on creation; language switch fetches from DB only — no AI call.

### Backend

**Entity**: `translations` table — `translation_key`, `language_code`, `value`, `feature`, `reference_id`, `field`.

**Endpoints** (`TranslationController`):

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/translations?lang=km` | Get `{ key: value }` map for a language — called on language switch |
| GET | `/api/v1/translations/all` | Full list for admin table |
| POST | `/api/v1/translations` | Upsert single entry |
| POST | `/api/v1/translations/batch` | Upsert batch |
| POST | `/api/v1/translations/ai-translate` | AI translate + auto-persist to DB |
| DELETE | `/api/v1/translations/{id}` | Delete single entry |
| DELETE | `/api/v1/translations/key/{key}` | Delete all languages for a key |

**AI translate endpoint body:**
```json
{ "input": { "key": "value" }, "languages": [{ "code": "km", "name": "Khmer" }], "feature": "ceremony" }
```
Response: `{ key: { en: "...", km: "..." } }` — and saves all to DB automatically.

### Frontend

**Store**: `useTranslationStore` (`stores/translationStore.js`)
- `loadLanguage(lang)` — fetches `?lang=km` map, called by plugin on startup and locale switch
- `fetchAll()` — loads full list for admin table
- `upsert(key, lang, value, meta)` — upsert single entry
- `aiTranslate(input, languages, meta)` — calls `/ai-translate`, saves to DB, updates local map
- `deleteByKey(key)` — removes all language entries for a key
- `tr(key)` getter — returns `map[key] ?? key`
- `grouped` getter — groups all entries by key for the admin table

**Plugin**: `plugins/translations.js`
- Uses `nuxtApp.$i18n` (NOT `useI18n()` — that throws outside setup)
- Calls `loadLanguage(locale)` on startup
- Watches `i18n.locale` → reloads map on every language switch

**Composable**: `useTr` (`composables/useTr.js`)
```js
const { tr, trRef, hasTr } = useTr()

// In template — string, updates automatically on language switch:
{{ tr('ceremony.welcome.title') }}
{{ tr('ceremony.welcome.title', 'Fallback text') }}

// As reactive computed ref (for use in computed/watch/v-bind):
const label = trRef('wedding.venue')
```

### Flow

```
CREATE (AI called once):
  Enter key + source lang + value
      → POST /api/v1/translations/ai-translate
      → Saves all languages to DB
      → Done — AI never called again for this key

LANGUAGE SWITCH (no AI, DB only):
  User switches to KM
      → GET /api/v1/translations?lang=km
      → translationStore.map = { key: "ខ្មែរ...", ... }
      → tr('key') instantly returns KM value
```

### Admin Page (`/admin/translations`)

- Table: all keys as rows, active language codes as columns
- **Inline edit**: click any cell to edit the value for that language
- **Cell AI ✦**: translate a single missing cell using another language as source
- **Row AI ✦✦**: fill all missing languages for one row
- **AI Fill Missing**: bulk-fill every empty cell across all rows
- **Add Key (2-step modal)**:
  1. Enter key, feature, source language, source value
  2. AI auto-translates to ALL active languages → review/edit each value → Save All

### Plugin — Critical Note

**Never use `useI18n()` in a Nuxt plugin** — it requires `setup` context and throws `"Must be called at the top of a setup function"`. Always use `nuxtApp.$i18n` instead:

```js
// ✓ correct
export default defineNuxtPlugin((nuxtApp) => {
  const i18n = nuxtApp.$i18n
  watch(i18n.locale, (lang) => load(lang))
})

// ✗ wrong — throws SyntaxError at app initialization
export default defineNuxtPlugin(() => {
  const { locale } = useI18n()  // crashes
})
```

### Language CRUD (`/admin/languages`)

SUPER_ADMIN manages available languages via `useLanguageStore` and `GET/POST/PUT/DELETE /api/v1/languages`. Active languages drive the translation table columns and the AI translate target list. Default languages seeded on startup: en, km, zh, fr, ko, ja, th, vi.

### AI Feature (`/ai/translate`, `/admin/ai-config`)

- `useAIStore` — `translate(input, languages)` and `translateText(text, fieldKey, languages)`
- `AITranslateButton` component — place in any form with bilingual fields; emits `result` with `{ fieldKey: { en, km } }`
- AI config stored in `AppConfig` table (keys: `ai.api_key`, `ai.base_url`, `ai.model`) — overrides `.env` without restart
- `AIClient` reads config from DB via `AppConfigService`, falls back to env vars

**`useI18n()` vs plugin context rule** — applies to ALL composables that use Vue injection (`useI18n`, `useRouter`, `useNuxtApp`, etc.): only safe inside `setup()` or component lifecycle hooks, never at plugin module scope.

## AI Auto-Translate on Record Create

### Feature Overview

When creating a record (ceremony, task, etc.), a checkbox **"Auto translate with AI"** appears in the form. When checked and the form is saved, the record's text fields are automatically translated into all active languages and saved to the TMS (`translations` table).

The checkbox is **hidden entirely** when `ai.enabled = false` in the admin config — no frontend code change needed to disable it.

### Admin Control — Enable / Disable (`/admin/ai-config`)

The AI config page has an ON/OFF toggle that writes `ai.enabled` to `AppConfig`:

- **ON** — `AIAutoTranslateCheckbox` renders in all create forms
- **OFF** — component renders nothing (`v-if="aiStore.enabled"`)

`GET /api/v1/admin/config/ai/status` returns `{ enabled: boolean }` — authenticated (not SUPER_ADMIN only) so any logged-in user can check it. Called once after login via `useAIStore().fetchStatus()` in `plugins/auth.js`.

### `AIAutoTranslateCheckbox` Component

```vue
<AIAutoTranslateCheckbox v-model="autoTranslate" />
```

- Reads `aiStore.enabled` — hidden when false
- Shows target languages from `useLanguageStore().activeItems`
- Emits `update:modelValue` (standard v-model checkbox)

### Wiring into a Create Form

```js
const autoTranslate = ref(false)
const translationStore = useTranslationStore()
const langStore = useLanguageStore()

// After successful save:
if (autoTranslate.value && created.id) {
  const langs = langStore.activeItems.length
    ? langStore.activeItems
    : [{ code: 'en', name: 'English' }, { code: 'km', name: 'Khmer' }]
  const input = {}
  if (form.title) input['title'] = form.title
  if (form.notes) input['notes'] = form.notes
  if (Object.keys(input).length)
    translationStore.aiTranslate(input, langs, {
      keyPrefix: `task.${created.id}`,   // ← feature.recordId
      feature: 'task',
      referenceId: created.id,
    }).then(() => toast.add('Translations saved', 'AI')).catch(() => {})
}
```

Currently wired: `ceremony/index.vue`, `tasks/index.vue`.

### Critical: Simple Keys + `keyPrefix` — Never Dotted Keys in `input`

**NEVER** pass dotted keys like `task.abc123.title` in the `input` map sent to the AI. The AI interprets dots as nested JSON structure and returns the wrong shape, causing a 500.

```js
// ✗ WRONG — AI sees "task.abc.title" as nested path → 500
translationStore.aiTranslate({ 'task.abc.title': 'Book flowers' }, langs, { ... })

// ✓ CORRECT — simple field name + keyPrefix builds the full TMS key on the backend
translationStore.aiTranslate(
  { title: 'Book flowers' },           // ← simple key, AI sees this
  langs,
  { keyPrefix: 'task.abc', feature: 'task', referenceId: 'abc' }
)
// Backend stores key = "task.abc.title"
```

**Backend logic** (`TranslationController.aiTranslate`):
```
TMS key = keyPrefix + "." + fieldName   →  "task.abc123.title"
```
If no `keyPrefix`, TMS key = fieldName directly.

### `translationStore.aiTranslate` Signature

```js
translationStore.aiTranslate(
  input,      // { fieldName: "source text" }  — simple keys only
  languages,  // [{ code, name }]
  meta        // { keyPrefix?, feature?, referenceId? }
)
```

Returns the AI result `{ fieldName: { en: "...", km: "..." } }` and auto-persists all entries to the `translations` table.

### AI Translate Pages

- **`/ai/translate`** — manual translate with 10 feature presets (Wedding, Ceremony, Guest, Invitation, Task, Budget, Gift, Seating, Wish, Notification) + Custom mode. Preset fields are locked (can't rename keys). History saved per session.
- **`/ai/batch-translate`** — load real DB records per feature, select/deselect rows, translate all and save to TMS in one run with real-time progress log and 300ms delay between records to respect rate limits.

### `useAIStore` State

```js
const aiStore = useAIStore()
aiStore.enabled      // boolean — controlled by ai.enabled AppConfig key
aiStore.loading      // boolean — true while AI call in progress
aiStore.error        // string | null — last error message
aiStore.fetchStatus() // called once after login in plugins/auth.js
```

## AI Auto-Translate — All Wired Forms

| Page | File | Fields translated | TMS key prefix |
|---|---|---|---|
| Ceremony | `pages/ceremony/index.vue` | `name`, `description` | `ceremony.{id}` |
| Task | `pages/tasks/index.vue` | `title`, `notes` | `task.{id}` |
| Budget | `pages/budget/index.vue` | `category`, `vendorName`, `notes` | `budget.{id}` |
| Gift Record | `pages/gift_record/index.vue` | `description` | `gift.{id}` |

### Budget Store — `addBudget` Returns Created Record

`budgetStore.addBudget()` was updated to return `{ success: true, data: created }` so the page can read `result.data.id` for building the TMS key prefix. Previously returned only `{ success: true }`.

Always check `result.data?.id` before calling `translationStore.aiTranslate` — if the store doesn't return the created record, the key prefix will be wrong.

### Standard Wiring Pattern (copy for new forms)

```js
// 1. Add refs at the top of <script setup>
const autoTranslate = ref(false)
const translationStore = useTranslationStore()
const langStore = useLanguageStore()

// 2. Add checkbox in template before <div class="modal-footer">
// <AIAutoTranslateCheckbox v-model="autoTranslate" />

// 3. After successful create (not edit):
if (!editingRecord.value && autoTranslate.value && result.data?.id) {
  const id = result.data.id
  const langs = langStore.activeItems.length
    ? langStore.activeItems
    : [{ code: 'en', name: 'English' }, { code: 'km', name: 'Khmer' }]
  const input = {}
  if (form.title)       input['title']       = form.title
  if (form.description) input['description'] = form.description
  // add whichever text fields are translatable
  if (Object.keys(input).length)
    translationStore.aiTranslate(input, langs, {
      keyPrefix:   `featureName.${id}`,
      feature:     'featureName',
      referenceId: id,
    }).then(() => toast.add('Translations saved', 'AI')).catch(() => {})
}
```

### Store Requirements for Auto-Translate

For a store's `addXxx` action to support auto-translate, it must return the created record id:

```js
// ✓ correct — returns created record
async addBudget(form) {
  ...
  const created = fromApi(data.value?.data ?? data.value)
  return { success: true, data: created }  // ← data.id available
}

// ✗ wrong — page can't get the id for keyPrefix
async addBudget(form) {
  return { success: true }  // ← no data
}
```

---

## CEREMONY_WEBAPP_NUXT — Global Shared Composables (NO DUPLICATION)

### Rule: Never duplicate these patterns — always use the shared composables

Three composables in `app/composables/` are shared across ALL page composables. When implementing any new CRUD page, these replace all manual state and boilerplate:

| Composable | Location | Replaces |
|---|---|---|
| `useModalCrud()` | `composables/useModalCrud.js` | Modal state, `openAdd/Edit/close`, `confirmDelete`, `doDelete`, `save` |
| `useLangTabs()` | `composables/useLangTabs.js` | `langTabItems`, `activeLangIndex`, `flagEmoji`, `emptyTranslations`, `populateTranslations`, `tr` |
| `useFormErrors()` | `composables/useFormErrors.js` | `errors`, `clearError`, `addError`, `resetErrors`, `hasNoErrors` |

---

### `useModalCrud()` — Modal + CRUD State

Provides all modal lifecycle and CRUD save/delete wiring. Every page composable must use this instead of declaring `showModal`, `editingItem`, etc. manually.

```js
const crud = useModalCrud()

// Open add modal (pass a reset callback)
crud.openAdd(() => Object.assign(form, defaultForm()))

// Open edit modal (pass a populate callback)
crud.openEdit(item, (i) => Object.assign(form, { name: i.name, ... }))

// Save — calls createFn or updateFn depending on editingItem
await crud.save(
  () => myStore.addItem({ ...form }),           // create
  () => myStore.updateItem(crud.editingItem.value.id, { ...form }),  // update
)

// Delete
crud.confirmDelete(item)        // sets deletingItem
crud.doDelete((item) => myStore.deleteItem(item.id))  // calls deleteFn, shows toast
```

**Spread into the composable return:**
```js
return {
  ...crud,            // exposes: showModal, editingItem, saving, deletingItem, deleting,
                      //          openAdd, openEdit, closeModal, confirmDelete, doDelete, save
  // override closeModal if extra cleanup needed (e.g. clear selectedCoverMedia)
  closeModal,
}
```

**When NOT to use the spread:**
If you override `closeModal` (to clear extra state), define it locally and include it separately — the local definition shadows the spread.

---

### `useLangTabs()` — Language Tabs

Provides dynamic language tabs from `langStore.activeItems`. Never hardcode `{ en: '', km: '' }` — always use this composable to build translation maps so new languages added in `/admin/languages` appear automatically.

```js
const {
  langStore,
  langTabItems,      // computed — array of { label, slot } for RTab :items
  activeLangIndex,   // ref — current tab index (v-model on RTab)
  activeLang,        // computed — current lang code string
  flagEmoji,         // (code) => '🇰🇭'
  emptyTranslations, // (fields) => { name: { en:'', km:'' }, desc: { en:'', km:'' } }
  populateTranslations, // (existing, fields) => fills from item.translations with fallback ''
  tr,                // (item, field) => item.translations[field][locale] || item[field] || ''
} = useLangTabs()

// In defaultForm():
translations: emptyTranslations(['name', 'description'])

// In openEdit():
translations: populateTranslations(item.translations, ['name', 'description'])

// In template cell / computed:
t(rowData, 'name')   // display-locale-aware value
```

**Template pattern with RTab:**
```html
<RTab v-model="activeLangIndex" :items="langTabItems" not-clear-route>
  <template v-for="lang in langStore.activeItems" :key="lang.code" #[lang.code]>
    <div :dir="lang.direction === 'RTL' ? 'rtl' : 'ltr'">
      <RInput v-model="form.translations.name[lang.code]" :placeholder="`Name in ${lang.name}`" />
    </div>
  </template>
</RTab>
```

`not-clear-route` is always required inside drawers/modals to prevent URL param wipe on tab switch.

---

### `useFormErrors()` — Validation Errors

Reactive per-field error map with helpers. Always use instead of `const errors = reactive({})` inline.

```js
const { errors, clearError, addError, resetErrors, hasNoErrors } = useFormErrors()

const validate = () => {
  resetErrors()
  if (!form.name?.trim()) addError('name', 'Name is required.')
  if (form.name.length > 200) addError('name', 'Name must be 200 characters or fewer.')
  return hasNoErrors()
}

const save = async () => {
  if (!validate()) return
  // ...
}
```

```html
<RInput v-model="form.name" :error="!!errors.name" @on-input="clearError('name')" />
<span v-if="errors.name" class="field-error">{{ errors.name }}</span>
```

---

### Canonical New Page Composable Template

Copy this skeleton when creating any new `useXxxPage.js`:

```js
export function useMyFeaturePage() {
  // ── Service layer ─────────────────────────────────────────────────────────
  const myStore = useMyStore()
  const { tBy } = useSarikaLocale()

  // ── Shared composables (NEVER duplicate manually) ─────────────────────────
  const crud = useModalCrud()
  const { langStore, langTabItems, activeLangIndex, emptyTranslations, populateTranslations, tr } = useLangTabs()
  const { errors, clearError, addError, resetErrors, hasNoErrors } = useFormErrors()

  // ── Form ──────────────────────────────────────────────────────────────────
  const FIELDS = ['name', 'description']   // translatable fields

  const defaultForm = () => ({
    name: '',
    // ... other fields
    translations: emptyTranslations(FIELDS),
  })
  const form = reactive(defaultForm())

  // ── Init ──────────────────────────────────────────────────────────────────
  const init = async () => {
    if (!langStore.items.length) await langStore.fetchLanguages()
    myStore.fetchItems()
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    resetErrors()
    if (!form.name?.trim()) addError('name', 'Name is required.')
    return hasNoErrors()
  }

  // ── Modal handlers ────────────────────────────────────────────────────────
  const openAdd = () => {
    resetErrors()
    crud.openAdd(() => Object.assign(form, defaultForm()))
  }

  const openEdit = (item) => {
    resetErrors()
    crud.openEdit(item, (i) => Object.assign(form, {
      name: i.name,
      translations: populateTranslations(i.translations, FIELDS),
    }))
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const save = async () => {
    if (!validate()) return
    await crud.save(
      () => myStore.addItem({ ...form }),
      () => myStore.updateItem(crud.editingItem.value.id, { ...form }),
    )
  }

  const confirmDelete = (item) => crud.confirmDelete(item)
  const doDelete = () => crud.doDelete((item) => myStore.deleteItem(item.id))

  return {
    myStore,
    ...crud,
    form, errors, clearError,
    langTabItems, activeLangIndex, langStore,
    tBy, tr,
    init, openAdd, openEdit, save, confirmDelete, doDelete,
  }
}
```

---

### Checklist — Global Composables

Before marking a composable complete, verify:

- [ ] `useModalCrud()` used — no manual `showModal`, `editingItem`, `saving`, `deletingItem`, `deleting` refs
- [ ] `useLangTabs()` used — no inline `langTabItems` computed, no `flagEmoji` copy-paste, no hardcoded `{ en:'', km:'' }` translation maps
- [ ] `useFormErrors()` used — no inline `errors = reactive({})`, no manual `clearError`
- [ ] `emptyTranslations(fields)` used in `defaultForm()` — never hardcode field/lang combinations
- [ ] `populateTranslations(item.translations, fields)` used in `openEdit()` — never manually build per-lang maps
- [ ] `tr(item, field)` used in DataTable cells — never inline `item?.translations?.[field]?.[locale.value]`
- [ ] Store actions return `{ data }` on success, `{ error }` on failure — required for `crud.save` and `crud.doDelete` to detect outcome
- [ ] `crud.save(createFn, updateFn)` handles success toast + `closeModal()` automatically — do not duplicate those calls

---

## CEREMONY_WEBAPP_NUXT — `useEventPage()` — Event Lifecycle (NO DUPLICATION)

### Rule: Never write `usePolling` + `watch(activeEvent.id)` + init guard in a page — use `useEventPage()`

Every event-scoped page needs the same three things:
1. Wait for `eventStore` to be initialized before fetching
2. Re-fetch when the active event changes (e.g. user switches wedding)
3. Auto-poll for live updates

**Before (duplicated in 22+ pages — DO NOT write this):**
```js
// ✗ wrong — copy-pasted in every page
usePolling(async () => {
  if (eventStore.activeEvent?.id) await myStore.fetchData(0)
}, 30_000)

watch(() => eventStore.activeEvent?.id, (id) => { if (id) myStore.fetchData(0) })

onMounted(async () => {
  if (!eventStore.initialized) await eventStore.fetchEvents()
  if (eventStore.activeEvent?.id) myStore.fetchData(0)
})
```

**After — use `useEventPage(fetchFn, pollInterval)` in the page composable:**
```js
// ✓ correct — in useMyFeaturePage.js
const { eventStore, init } = useEventPage(
  () => myStore.fetchData(0),   // called on mount + event change + every poll tick
  30_000,                       // poll interval in ms — omit to disable polling
)

// In the page file — just one line:
onMounted(init)
```

### API

```js
const { eventStore, init, fetch } = useEventPage(fetchFn, pollInterval?)
```

| Return | Type | Purpose |
|---|---|---|
| `eventStore` | Store | Access `activeEvent`, `initialized`, etc. in the composable |
| `init` | `async () => void` | Call in `onMounted` — initializes store if needed, then fetches |
| `fetch` | `async () => void` | Trigger a manual re-fetch (e.g. after a CRUD save) |

### Rules

- Always call `useEventPage` **inside the page composable** (`useXxxPage.js`), not directly in the page `<script setup>`. The composable owns the lifecycle.
- `pollInterval` is optional — omit it for pages that do not need live updates (e.g. settings pages).
- When the page composable also has an `init` that loads extra data (languages, secondary stores), wrap `useEventPage`'s `init` inside the composable's own `init`:

```js
// In useMyFeaturePage.js — when you need extra init steps
const { eventStore, init: eventInit, fetch } = useEventPage(() => myStore.fetchData(0), 30_000)

const init = async () => {
  if (!langStore.items.length) await langStore.fetchLanguages()  // extra step
  await eventInit()   // then run the event lifecycle init
}
```

- **Never add a `watch(eventStore.activeEvent?.id)` in the page file** — `useEventPage` already registers it.
- **Never add `usePolling(...)` in the page file** — `useEventPage` already registers it when `pollInterval` is provided.

### Poll intervals by page (reference)

| Page | Interval |
|---|---|
| Dashboard | 30s |
| Check-in | 5s |
| Gift Record | 10s |
| Budget | 30s |
| Tasks | 30s |
| Tables | 30s |
| Guests | 30s |
| Ceremony | 60s |
| Notifications | 30s |
| Settings / forms | no polling |

Stores that already return the created object directly (task, gift, guest, ceremony): callers get the object as return value, not wrapped in `{ success, data }`. Check each store's return signature before wiring.

---

## CEREMONY_WEBAPP_NUXT — i18n String Rule: Never Hardcode in `tBy()`

### Rule: Static UI strings belong in locale files, not inline `tBy({ en, km })` calls

`tBy({ en: '...', km: '...' })` hardcodes strings in code. Problems:
- Strings scattered across files — impossible to audit or find
- Only works for the two hardcoded languages — adding French requires changing every `tBy()` call in code
- Can't be edited without a code deploy
- Same string duplicated across multiple components

### ✓ Correct — use `$t('key')` with locale files

```js
// ✗ wrong — hardcoded bilingual string in code
tBy({ en: 'Add Task', km: 'បន្ថែមភារកិច្ច' })
tBy({ en: 'Wedding day! 🎉', km: 'ថ្ងៃពិធីមហាមង្គល! 🎉' })
tBy({ en: 'Name is required.', km: 'ត្រូវការឈ្មោះ' })

// ✓ correct — key defined once in locale files
$t('tasks.add')
$t('events.wedding_day')
$t('validation.name_required')
```

**`app/locales/en.json`:**
```json
{
  "tasks": {
    "add": "Add Task",
    "edit": "Edit Task",
    "delete": "Delete Task"
  },
  "events": {
    "wedding_day": "Wedding day! 🎉"
  },
  "validation": {
    "name_required": "Name is required."
  }
}
```

**`app/locales/km.json`:**
```json
{
  "tasks": {
    "add": "បន្ថែមភារកិច្ច",
    "edit": "កែប្រែភារកិច្ច",
    "delete": "លុបភារកិច្ច"
  },
  "events": {
    "wedding_day": "ថ្ងៃពិធីមហាមង្គល! 🎉"
  },
  "validation": {
    "name_required": "ត្រូវការឈ្មោះ"
  }
}
```

Adding a third language (French) → create `fr.json` with the same keys. **No code changes needed.**

### In `<script setup>` — use `useI18n()`

```js
const { t } = useI18n()

// In computed, methods, expressions:
const label = computed(() => t('tasks.add'))
toast.add(t('tasks.created'), t('common.success'))
```

In templates, `$t()` is auto-available — no import needed:
```html
<button>{{ $t('tasks.add') }}</button>
<RInput :placeholder="$t('tasks.title_placeholder')" />
```

### In composables — use `useI18n()` inside the function body

```js
export function useTaskPage() {
  const { t } = useI18n()   // ✓ called inside function body — safe

  const save = async () => {
    toast.add(t('validation.title_required'), t('common.error'))
  }
}
```

**Never call `useI18n()` at module scope** (outside a function) — it throws outside setup context.

### When `tBy()` is still acceptable (narrow cases only)

`tBy` is only for **runtime bilingual values from API/store data** — not static UI copy:

```js
// ✓ acceptable — content comes from the API/DB at runtime
tBy({ en: event.titleEn, km: event.titleKm })
tBy({ en: guest.nameEn, km: guest.nameKm })

// ✗ wrong — static UI label hardcoded as bilingual object
tBy({ en: 'Save', km: 'រក្សាទុក' })
```

### For dynamic entity content (multilingual from DB) — use TMS `tr()`

```js
// Article/ceremony/event names stored in the translations table
const { tr } = useLangTabs()
tr(article, 'title')        // reads article.translations[currentLocale]['title']
tr(ceremony, 'name')
```

### Locale file key naming convention

```
feature.action         tasks.add, tasks.edit, tasks.delete
feature.field          tasks.title, tasks.notes, tasks.due_date
feature.status         tasks.pending, tasks.in_progress, tasks.completed
feature.label          tasks.total, tasks.overdue
common.save            shared across all pages
common.cancel
common.delete
common.error
common.success
validation.required    validation.name_required, validation.email_invalid
```

### Checklist

- [ ] All button labels use `$t('...')` — no inline `tBy({ en, km })`
- [ ] All placeholder text uses `$t('...')`
- [ ] All toast messages use `t('...')` from `useI18n()`
- [ ] All validation error strings use `t('...')`
- [ ] Both `en.json` and `km.json` have the new key
- [ ] Key follows `feature.action` naming convention
- [ ] `tBy()` used only for runtime API data fields, never for static copy

---

## CEREMONY_WEBAPP_NUXT — All Translations in DB (Single Source of Truth)

### Rule: ALL strings live in the DB translations table — locale files are seed-only

There is **one source of truth** for every string in the app: the `translations` table.

- **Static locale files (`en.json`, `km.json`)** — used only as the initial seed to populate the DB on first setup. After seeding, they are ignored at runtime.
- **`$t('key')` / `useI18n()`** — do not use for new code. Only exists for backward compat with legacy pages not yet migrated.
- **`tr('key')` from `useTr()`** — use for ALL UI strings (buttons, labels, placeholders, toasts, validation messages).
- **`tr(item, 'field')` from `useLangTabs()`** — use for entity content (article titles, ceremony names, etc. stored in `*_translations` tables).

```js
// ✗ wrong — hardcoded, can't change without deploy, breaks new languages
tBy({ en: 'Add Task', km: 'បន្ថែមភារកិច្ច' })
$t('tasks.add')

// ✓ correct — comes from DB, zero-code language addition
const { tr } = useTr()
tr('tasks.add')           // UI label from translations table
tr('common.save')         // shared label
tr('validation.required') // validation message
```

### Why DB-only is correct

| Concern | Static locale files | DB (TMS) |
|---|---|---|
| Add a new language | Create `fr.json` + `nuxt.config.ts` + deploy | Admin UI only — `/admin/languages` → "AI Fill Missing" |
| Fix a typo | Code change + deploy | Edit inline in `/admin/translations` |
| Bundle size | +50–100KB (en.json + km.json bundled) | Strings not in bundle — smaller JS |
| Runtime speed | O(1) in-memory lookup | O(1) in-memory lookup — identical |
| Startup cost | Zero (bundled) | Already paid — plugin fires `GET /translations?lang=en` on every load |
| Offline | Works | Shows raw keys if backend down |

### Performance — not a concern

The TMS plugin already runs on every app load:

```js
// plugins/translations.js — already fires on startup
await translationStore.loadLanguage(locale.value)
```

Moving UI strings into the DB adds keys to an **existing request** — not a new one. Runtime reads (`tr('key')`) are O(1) dictionary lookups from `translationStore.map` — identical speed to `$t()`.

**Flash of raw keys** is prevented by `await` in the plugin — the app does not render until the translation map is loaded, same as bundled locale files.

**Cache** — the backend sets `Cache-Control: max-age=300` on `GET /api/v1/translations`. After the first visit, the browser serves translations from disk cache — effectively zero network cost.

### How to add a new language (complete flow, zero code)

```
1. /admin/languages → "Add Language" → { code: "fr", name: "French", flag: "FR", direction: "LTR" }

2. /admin/translations → "AI Fill Missing"
   → AI translates every key that has no French value
   → Saves to DB automatically (~30s for full app)

3. Done. Users see French in the language switcher immediately.
   No .json file. No nuxt.config.ts change. No deploy.
```

### Seeding locale files → DB (one-time migration)

When migrating a page from `$t()` → `tr()`, seed its keys into the DB first:

```js
// Run once via /admin/translations "Add Key" modal or batch upsert:
POST /api/v1/translations/batch
[
  { "translationKey": "tasks.add",    "languageCode": "en", "value": "Add Task" },
  { "translationKey": "tasks.add",    "languageCode": "km", "value": "បន្ថែមភារកិច្ច" },
  { "translationKey": "tasks.edit",   "languageCode": "en", "value": "Edit Task" },
  { "translationKey": "tasks.edit",   "languageCode": "km", "value": "កែប្រែភារកិច្ច" },
]
```

Then replace in code:
```js
// Before
tBy({ en: 'Add Task', km: 'បន្ថែមភារកិច្ច' })
$t('tasks.add')

// After
tr('tasks.add')
```

### `useTr()` — correct usage in all contexts

```js
// In <script setup> or composable function body:
const { tr, trRef } = useTr()

// Template — reactive string, re-renders on locale switch:
{{ tr('tasks.add') }}
{{ tr('tasks.add', 'Fallback if key missing') }}

// Reactive ref — for use in computed/watch/v-bind:
const label = trRef('tasks.add')

// In toasts / non-reactive places:
toast.add(tr('tasks.saved'), tr('common.success'))
```

### Key naming convention — same as locale files

```
feature.action       tasks.add, tasks.edit, tasks.delete
feature.field        tasks.title, tasks.notes, tasks.due_date
feature.status       tasks.pending, tasks.in_progress, tasks.completed
feature.label        tasks.total, tasks.overdue
common.save          shared across all pages
common.cancel
common.delete
common.error
common.success
validation.name_required
validation.email_invalid
```

### Checklist — translation compliance

- [ ] All button labels use `tr('...')` — not `tBy({ en, km })` or `$t('...')`
- [ ] All placeholders use `tr('...')`
- [ ] All toast messages use `tr('...')` 
- [ ] All validation error messages use `tr('...')`
- [ ] The key exists in the `translations` table with at least `en` and `km` values
- [ ] Key follows `feature.action` naming convention
- [ ] `tBy()` is only used for runtime API data: `tBy({ en: item.nameEn, km: item.nameKm })`
- [ ] Entity content (article title, ceremony name) uses `tr(item, 'field')` from `useLangTabs()`

---

## TMS Seed File — `translations-seed.json`

### Overview

`CEREMONY_WEBAPP_NUXT/translations-seed.json` is the canonical source of all static UI translation keys. Every new key introduced during TMS migration must be added here. The file is an array of `{ translationKey, languageCode, value }` objects.

```json
[
  { "translationKey": "common.save",   "languageCode": "en", "value": "Save" },
  { "translationKey": "common.save",   "languageCode": "km", "value": "រក្សាទុក" },
  { "translationKey": "tasks.add",     "languageCode": "en", "value": "Add Task" },
  { "translationKey": "tasks.add",     "languageCode": "km", "value": "បន្ថែមភារកិច្ច" }
]
```

### Rules

- **Every `tr('key')` call in the app must have a corresponding entry in `translations-seed.json`** — at minimum `en` and `km`.
- **Always use the Read tool before editing the file** — the Edit tool requires it.
- **Append new keys at the bottom**, before the closing `]`.
- **One entry per language per key** — not one object with both languages.
- **Key naming follows `feature.action` convention** — `common.save`, `tasks.add`, `content.delete_category`, etc.
- **Do not add entity-content keys** (article titles, ceremony names, etc.) — those belong in the `*_translations` DB tables, not this seed file.

### When to add to `translations-seed.json`

Add a new block whenever you:
1. Replace a `tBy({ en: '...', km: '...' })` literal with `tr('some.key')` during TMS migration
2. Add a new UI string to any page or component using `tr('some.key')`

### Importing the seed into the DB

There are two ways to run the import:

#### Option A — Admin UI (recommended, no terminal needed)

1. Log in as `SUPER_ADMIN`
2. Go to `/admin/translations`
3. Click **"Import Seed"** button (top-right of the page header)
4. Result toast: `"Seeded X new entries, skipped Y existing"`

**Behavior**: reads `translations-seed.json` at runtime, compares against the current DB state, and only POSTs entries where the exact `translationKey + languageCode` pair does not already exist. Never overwrites customized values.

#### Option B — CLI script (for CI / Docker init)

```bash
# First get a JWT token:
# POST http://localhost:8080/api/v1/auth/login → copy access_token

node scripts/seed-translations.mjs \
  --api http://localhost:8080 \
  --token eyJhbGci...

# Or via env vars:
API_URL=http://localhost:8080 AUTH_TOKEN=xxx node scripts/seed-translations.mjs
```

Script location: `CEREMONY_WEBAPP_NUXT/scripts/seed-translations.mjs`

Output:
```
📦  Loaded 180 entries from translations-seed.json
🔍  Fetching existing translations…
   Found 38 existing entries in DB
⬆️   Will seed 142 new entries (skipping 38 existing)
   Chunk 1/2 (100 entries)… ✓
   Chunk 2/2 (42 entries)… ✓
✅  Done. Seeded: 142  Skipped: 38
```

### How import works (skip logic)

Both methods use the same logic implemented in `translationStore.importSeed(entries)`:

1. Fetch all existing `{ translationKey, languageCode }` pairs from `GET /api/v1/translations/all`
2. Build a Set of `"key::lang"` strings
3. Filter seed entries — keep only those whose `"key::lang"` is NOT in the set
4. POST filtered entries in chunks of 100 via `POST /api/v1/translations/batch`
5. Return `{ seeded, skipped }` counts

**Import is idempotent** — running it multiple times produces the same result. Existing DB values are never overwritten.

### After a DB wipe / fresh environment

On a fresh DB (e.g. new developer machine, staging redeploy), run the import once after the backend starts:

```bash
# 1. Start backend
cd WED_BUILDER_SERVER && ./mvnw spring-boot:run

# 2. Login and get token (or use the Admin UI button)
node scripts/seed-translations.mjs --api http://localhost:8080 --token <token>
```

The DataSeeder seeds demo users and roles on startup — but NOT translations. The seed script / Admin UI button must be run manually.

