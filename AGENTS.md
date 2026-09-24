# AGENTS.md

Instructions for AI agents and humans working in this repository.

## What this is

GameOn frontend: a Vite + React SPA with **three isolated portals** (player, game zone, admin) sharing one Axios client. Backend is a separate API. Do not invent backend routes; follow `src/api/modules/*`.

## Commands

```bash
npm install
cp .env.example .env
npm run dev
npm run lint
npm run build
```

Default API: `http://localhost:3000/api` via `VITE_API_BASE_URL`.

## Layout (put new code here)

| Area | Path | Rule |
|---|---|---|
| Routes | `src/config/routes.js` | Import constants. Do not hardcode `/GameZoneAuth`, admin ops paths, etc. |
| HTTP client | `src/api/client.js` | Per-request Bearer token from path (or `config.authRole`) |
| Session | `src/api/authSession.js` + `src/api/authConfig.js` | Persist / read / clear / 401 events |
| Auth API | `src/api/modules/auth.js` | Login/register/logout only |
| REST modules | `src/api/modules/*.api.js` | Thin wrappers. Return interceptor payload. No `try/catch { throw error }` |
| HTTP helpers | `src/lib/http.js` | `unwrapList`, `unwrapData`, `getApiErrorMessage`, `sanitizePhone` |
| Auth state | `src/context/*AuthContext.jsx` | One provider per role. Use `usePersistedAuth` |
| Admin UI | `src/pages/Admin/` | Pages in `dashboard/`, primitives in `components/ui.jsx`, chrome in `layout.jsx` |
| Game zone UI | `src/pages/Gamezone/` | Keep page files; do not grow `GameZoneDashboard.jsx` further |
| Player UI | `src/pages/User/UserPortal.jsx` | Player QR + station assignment |

There is **no** unified `AuthContext`. It was removed. Do not bring it back.

## Hard rules

1. **Never** write `client.defaults.headers.common.Authorization`. The interceptor picks the token per URL.
2. **Never** log in twice. Auth pages call `userLogin` / `zoneLogin` / `adminLogin`, then `onAuthSuccess()` with **no credentials**. `App.jsx` only navigates.
3. **Never** gate the whole tree on `{!isLoading && children}` in auth providers. `ProtectedRoute` already takes `isAuthenticated` + `isLoading`.
4. **Never** read/write `localStorage` auth keys ad hoc. Use `authSession.js`.
5. **Never** duplicate admin UI primitives. Import from `src/pages/Admin/components/ui.jsx`.
6. **Never** print `ADMIN_PORTAL_PATH` in the UI.
7. **Never** commit `.env` files or tokens.
8. Match existing style: JavaScript (not TypeScript yet), functional components, Tailwind utility classes, named exports for UI primitives.
9. Keep comments short and factual. No changelog comments, no emoji in new code.
10. Prefer editing existing modules over adding parallel “v2” files.

## Auth model

Three roles, three storage slots, three React contexts:

| Role key | Context | Token storage | Exclusive login |
|---|---|---|---|
| `user` | `UserAuthContext` | `user_token` | no |
| `gamezone` | `GameZoneAuthContext` | `gamezone_token` (+ legacy `zoneToken`) | yes (clears other roles) |
| `admin` | `AdminAuthContext` | `admin_token` | no |

On HTTP 401 the client clears that role and dispatches `*-auth-expired`. Contexts listen via `usePersistedAuth`.

Token attachment lives in `getRouteToken()` in `src/api/client.js`:

- Public: `/auth/*`, game-zone register/login, verified zones, numeric `/gamezones/:id`, GET credit packages → no token
- Zone routes (`/games`, `/game-details`, `/stations`, `/gamezone/plays`, `/gamezones/profile`, most `/credits/zone/*`) → zone token **if present**, else fall through
- Shared `/stations` used by admin → admin token when no zone token
- Override: `client.get(url, { authRole: 'admin' })`

If a backend path is used by more than one role, pass `authRole` at the call site. Do not set a global header.

Session restore is **synchronous** from `localStorage` (see `usePersistedAuth`). `isLoading` is for in-flight login, not boot.

## API conventions

The Axios interceptor returns `response.data` (the JSON body), not the Axios response.

```js
// good
const payload = await GameZoneAPI.getAllZones();
const zones = unwrapList(payload);

// bad
const { data } = await client.get('/gamezones'); // already unwrapped
client.defaults.headers.common.Authorization = `Bearer ${token}`;
```

Envelope shapes still vary (`data`, `data.data`, `data.items`). Always go through `unwrapList` / `unwrapData` / `getApiErrorMessage`.

Phone values: `sanitizePhone()` before login/register.

## UI conventions

- Landing + player + game-zone auth: dark (`#020208`, cyan `#00F0FF`, purple `#7B2CBF`).
- Admin portal: light slate. Do not mix the leftover dark-theme admin mock into live admin pages.
- Admin pages are presentational. Data and mutations stay in `AdminPortal.jsx` until a later split.
- `GameZoneDashboard.jsx` is already too large (~150 KB). New session/station/player UI goes into `pages/Gamezone/Dashboard/*`, not the parent.

## Adding a feature (checklist)

1. Add or reuse a function in `src/api/modules/<resource>.api.js`.
2. If the path is role-ambiguous, pass `{ authRole: 'admin' | 'gamezone' | 'user' }`.
3. If it needs a new URL, add it to `src/config/routes.js` and `App.jsx`.
4. Wire UI in the matching portal folder.
5. Handle loading, empty, and API error states (`getApiErrorMessage`).
6. `npm run lint` and `npm run build`.
7. If the UI changed, verify the flow in the browser (desktop + mobile if layout changed).

## Do not

- Install new UI libraries without need (`sonner` and `framer-motion` are already unused — do not pile on).
- Use `window.prompt` / `window.alert` for money or credit actions; use the admin `ConfirmDialog` / `Modal`.
- Treat the hidden admin path as access control.
- Refactor `GameZoneDashboard.jsx` and admin data layer in the same PR unless asked.
- Change `ADMIN_PORTAL_PATH` without an explicit product decision (bookmarks depend on it).

## Known debt

See `AUDIT.md`. Highest leftover: split `GameZoneDashboard.jsx`, shared searchable select, typed API envelopes, remove unused deps.

When you finish a pass that changes architecture, append to `AUDIT.md` rather than rewriting history.
