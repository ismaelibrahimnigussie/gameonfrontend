# GameOn Frontend Audit

Date: 2026-09-19  
Branch: `refactored_branch`  
Scope: full `src/` tree (Vite + React SPA for player, game-zone, and admin portals)

This document records the pre-refactor findings, what this pass changed, and what is still outstanding.

## Architecture snapshot

The app is three role-specific portals on one SPA:

| Portal | Auth | Main surface |
|---|---|---|
| Player | `UserAuthContext` | `UserPortal` |
| Game zone | `GameZoneAuthContext` | `GameZoneDashboard` |
| Admin | `AdminAuthContext` | `AdminPortal` |

HTTP goes through a shared Axios client that attaches a Bearer token from the request path. Session data lives in `localStorage`.

## Findings

### Critical / correctness

1. **Axios default `Authorization` fought the route interceptor.** Auth modules, all three contexts, and `GameZoneDashboard.setupAuth()` wrote `client.defaults.headers.common['Authorization']`. The interceptor already picks a token per URL. A leftover admin or zone token on `defaults` could leak onto the next public or cross-role request.

2. **Admin `/stations` requests could send no token.** `getRouteToken()` treated every `/stations*` path as a game-zone route and returned `zoneToken` even when it was `null`, so the admin portal never fell through to the admin token.

3. **Login ran twice with the wrong payload.** `UserAuth` and `GameZoneAuth` already called `userLogin` / `zoneLogin`, then invoked `onAuthSuccess(profile)`. `App.jsx` treated that argument as credentials and logged in again.

4. **Auth providers hid the entire tree while restoring.** Each provider rendered `{!isLoading && children}`, nested. Session restore was serialized (admin, then zone, then user), and `ProtectedRoute` could not distinguish “still restoring” from “logged out”.

5. **401 handling was incomplete.** Only admin listened for `admin-auth-expired`. User and game-zone sessions could be cleared in storage while React state stayed authenticated.

### High / maintainability

6. **Dead `AuthContext.jsx`.** A fourth, unused unified auth provider duplicated login/logout/restore.

7. **`UserAuthContext` exposed admin CRUD.** `getAllUsers`, `getUserById`, `updateUserById`, `getUserStatsById`, plus `isAdmin` / `isGameZone` helpers, were never used outside the context.

8. **`AuthAPI` login/register/logout were copy-pasted three times.** Token + profile extraction, localStorage writes, and error envelopes were duplicated for user, admin, and game zone.

9. **Admin portal was a ~1,700-line god component.** UI primitives, layout chrome, page bodies, and modals all lived in `AdminPortal.jsx`. Sibling files under `pages/Admin/dashboard/` and `pages/Admin/components/` were a leftover dark-theme UI and were not imported.

10. **`loadDashboard` depended on `selectedZoneId`.** Changing the selected zone re-fetched the whole admin dashboard.

11. **Overview “Total Balance” showed a hardcoded `trend={12.5}`.** Fake analytics.

12. **Admin login page printed the hidden ops path.** Security-through-obscurity is weak; advertising the path on the form made it weaker.

### Medium

13. **API modules were inconsistent.** Some returned interceptor payloads, `UserApi` unwrapped `.data` again, `CreditAPI` / `GameAPI` wrapped every call in `try/catch { throw error }`.

14. **Game-zone login wiped admin and user sessions.** Exclusive session is defensible, but only that role did it, and it used raw `removeItem` calls instead of the session helper.

15. **`.gitignore` did not ignore `.env`.** `doc_2026-09-19_11-01-17.env` is untracked in the working tree.

16. **`sonner` and `framer-motion` are unused dependencies.**

17. **`GameZoneDashboard.jsx` is still ~150 KB.** Pages are split, but almost all session/station/player state and mutations remain in the parent.

### Low / nits

18. Route names mix styles (`/GameZoneAuth` vs `/auth/user`). Aliases exist, but new code should go through `src/config/routes.js`.

19. Response envelopes are still guessed in several places (`data.data`, `data.user`, `data.profile`).

20. Empty `catch` blocks remain in `UserPortal` polling and some dashboard loaders.

## What this refactor changed

### Auth and HTTP

- Centralized persist/read/clear in `src/api/authSession.js`.
- Deduplicated `AuthAPI` login/register/session helpers.
- Stopped writing `client.defaults.headers.common.Authorization`.
- Route matcher now uses a zone token only when one exists, then falls through to admin for shared paths such as `/stations`.
- Optional `config.authRole` override on requests.
- `usePersistedAuth` restores a role and listens for that role’s 401 expiry event.
- Providers always render children. `ProtectedRoute` takes `isLoading` and shows a boot screen instead of redirecting.
- `App.jsx` no longer re-logins after a successful portal login.
- Removed dead `AuthContext.jsx`.
- Stripped unused admin methods from `UserAuthContext`.

### Admin UI

- Extracted shared primitives to `pages/Admin/components/ui.jsx`.
- Extracted chrome to `layout.jsx`.
- Extracted cards, constants, and modals.
- Replaced unused dark-theme dashboard files with the live light-theme pages: Overview, Zones, Players, Admins, Credits, Packages.
- `AdminPortal.jsx` is now the data/handler shell.
- Removed the fake balance trend and the printed admin route.

### API hygiene

- Shared `unwrapList` / `getApiErrorMessage` / `sanitizePhone` in `src/lib/http.js`.
- `UserApi` and `CreditAPI` return the interceptor payload like the other modules.
- Dropped no-op try/catch wrappers in `games.api.js`.
- Ignored `.env` files in `.gitignore`.

## Remaining work (not in this pass)

1. Split `GameZoneDashboard.jsx` the same way as admin: move session mutations and modal state into `Dashboard/sessions.jsx` / `stations.jsx`.
2. Extract the duplicated searchable dropdown (admin `Select` vs game-zone `SearchableDropdown`) into one shared component.
3. Replace `window.prompt` credit deduction with a modal.
4. Confirm with the backend whether `/stations` and `/games` should accept both admin and zone JWTs; add `authRole` on the caller if the server is strict.
5. Consider TypeScript. Envelope guessing (`data.data` vs `data.user`) is the main source of auth/profile bugs.
6. Remove unused `sonner` and `framer-motion` if they are not planned.
7. The hidden admin path is still only obscurity. Real protection is the admin JWT (already required).

## Verification

Run after this pass:

```bash
npm run lint
npm build
```

UI was not exercised in a browser in this session (no running dev server was attached). Auth, routing, and admin page extraction should be smoke-tested manually:

- Player login / register → `/user/dashboard`
- Game-zone login / register → `/GameZoneDashboard`
- Admin login → ops dashboard, stations list, credit grant
- Reload while logged in (no bounce to login)
- 401 on an authenticated request logs that role out
