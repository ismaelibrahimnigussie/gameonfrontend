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

`UserPortal.jsx` loads the account’s players, sessions, and stats. `ScannerPanel.jsx` reads a station QR. The assignment request uses the selected player’s id (`selectedPlayer` or `selectedPlayerId`). APIs: `PlayersAPI`, `SessionsAPI`, `StationAPI`.

### Game zone (`src/pages/Gamezone`)

`GameZoneDashboard.jsx` is the shell: auth gate, load error, and logout. `Dashboard/LoungeTabs.jsx` switches Overview, Games, Sessions, Stations, and Profile.

Data is composed in `useLoungeDashboard()`:

| Piece | Role |
|---|---|
| `useLoungeState` | Field state, lounge load, derived view |
| `catalogActions` | Create and edit games, stations, and rules |
| `useSessionActions` | Session setup, lifecycle, players, and payment |

Session UI lives under `Dashboard/sessions/`. `sessions.jsx` owns filters, selection, toasts, and which session is open. `SessionBoard` is the list, `SessionCard` is one row, `SessionDetail` plus `SessionPanels` is the open session, and `sessionModel.js` is time, price, and filtering.

A session mutation that returns the updated play (start, pause, resume, add player, leave, extra time, payment, end, cancel) writes that play into local state. Transfer is the exception: it reloads the lounge so the new waiting session is on screen. The tab refresh button still calls `loadData(true)` and shows the full-dashboard overlay.

Create rules, in order: lounge must be verified; a non-random session opens an invite QR; a random session needs credits, a game rule, no unfinished session for the chosen player, a valid Before Game payment when that timing is selected, and a station that is not already waiting, playing, or paused.

### Admin (`src/pages/Admin`)

`AdminPortal.jsx` is layout only. `useAdminPortal()` holds fetch, filters, and modal state. `adminActions.js` holds zone, credit, package, player, admin, and system-cost mutations.

Presentational pieces:

- `components/ui.jsx` — public primitives. `Select.jsx` and `dialogs.jsx` are re-exported from here.
- `components/layout.jsx` — sidebar, headers, drawer, mobile nav
- `components/cards.jsx` — zone/package/credit rows
- `dashboard/*` — one file per nav page
- `dashboard/SystemCosts.jsx` — cost rules, saved through `adminActions`

Admin visual language is light slate. Ignore any older dark-theme mocks.

Credit revoke still asks for an amount with `window.prompt`. New money actions should use `ConfirmDialog` or `Modal`.

## Shared helpers

`src/lib/http.js`:

- `unwrapList(payload)` — arrays hidden under `data` / `items` / `data.data`
- `unwrapData(payload)` — single records
- `getApiErrorMessage(error, fallback)`
- `sanitizePhone(value)`

## State

No global store. Portal state is React context (auth) plus the portal hooks above. Do not add Redux/Zustand.

Modules stay under about 300 lines. When a screen or hook crosses that, extract a component or a factory instead of growing the shell.
