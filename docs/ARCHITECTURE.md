# Architecture

GameOn frontend is a single-page app with three products behind one Vite build.

```
Browser
  └─ App.jsx
       ├─ AdminAuthProvider
       ├─ GameZoneAuthProvider
       └─ UserAuthProvider
            └─ Routes
                 ├─ /                      Home (portal picker)
                 ├─ /auth/user             Player login
                 ├─ /user/dashboard        Player portal
                 ├─ /GameZoneAuth          Venue login / register
                 ├─ /GameZoneDashboard     Venue console
                 ├─ ADMIN_PORTAL_PATH      Admin login
                 └─ ADMIN_DASHBOARD_PATH   Admin portal
```

Route strings live in `src/config/routes.js`. `/gamezone/dashboard` redirects to `/GameZoneDashboard`.

## Auth

Each role has its own:

- `localStorage` keys (`src/api/authConfig.js`)
- persist/clear helpers (`src/api/authSession.js`)
- React context
- 401 window event (`admin-auth-expired`, `gamezone-auth-expired`, `user-auth-expired`)

`usePersistedAuth(role)` hydrates profile from storage on first render and clears it on expiry.

Game-zone **login** is exclusive: it wipes user and admin sessions. Admin and user logins do not wipe each other.

`ProtectedRoute` must receive both `isAuthenticated` and `isLoading`. Loading shows `AuthBootScreen`; unauthenticated redirects.

Login pages own the credential call. `onAuthSuccess` is navigation only.

## HTTP

`src/api/client.js` is the only Axios instance.

1. Request interceptor chooses a token from the URL (or `config.authRole`).
2. It sets `Authorization: Bearer …` on **that request only**.
3. Response interceptor unwraps `response.data`.
4. On 401 it clears the role that was actually sent and emits the expiry event.

Do not attach a default Authorization header. That was a cross-role leak.

Public routes (no token): `/auth/*`, `POST /gamezones`, `/gamezones/login`, `/gamezones/verified`, `GET /gamezones/:id`, `GET /credits/packages`.

## Portals

### Player (`src/pages/User`)

QR scan → resolve station → request assignment. Uses `PlayersAPI`, `SessionsAPI`, `StationAPI`.

### Game zone (`src/pages/Gamezone`)

`GameZoneDashboard.jsx` still owns most data loading and session mutations. Child pages under `Dashboard/` render slices (overview, games, sessions, stations, profile). New work should move logic down into those pages, not into the parent.

### Admin (`src/pages/Admin`)

`AdminPortal.jsx` is the orchestrator (fetch, mutations, modal state). Presentational pieces:

- `components/ui.jsx` — Button, Input, Select, Modal, Toast, …
- `components/layout.jsx` — sidebar, headers, drawer, mobile nav
- `components/cards.jsx` — zone/package/credit rows
- `dashboard/*` — one file per nav page
- `dashboard/SystemCosts.jsx` — already self-contained

Admin visual language is light slate. Ignore any older dark-theme mocks.

## Shared helpers

`src/lib/http.js`:

- `unwrapList(payload)` — arrays hidden under `data` / `items` / `data.data`
- `unwrapData(payload)` — single records
- `getApiErrorMessage(error, fallback)`
- `sanitizePhone(value)`

## State

No global store. Portal state is React context (auth) plus local `useState` in the portal shell. Do not add Redux/Zustand unless a portal’s state graph is split and still too heavy.
