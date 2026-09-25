# API

Follow the repo `AGENTS.md`. This folder is the only HTTP boundary.

## How it fits

`client.js` is the one Axios instance. Its request interceptor calls `getRouteToken()` and sets `Authorization` on that request only. The response interceptor returns `response.data`. On 401 it clears the role that was sent and emits `*-auth-expired`.

`authConfig.js` names the storage keys and expiry events. `authSession.js` is the only code that reads or writes those keys. Contexts and login pages call it. Do not touch `localStorage` auth keys from a page.

`modules/*.api.js` are thin wrappers. They return the interceptor payload. Do not add `try/catch` that only rethrows. Do not set `client.defaults.headers.common.Authorization`.

## Files

| File | What it does |
|---|---|
| `client.js` | Axios instance, per-request token, unwrap, 401 |
| `authConfig.js` | Role keys: `user_token`, `gamezone_token`, `admin_token`, legacy `zoneToken` |
| `authSession.js` | `readAuthSession`, `persistAuthSession`, `clearAuthRole`, `clearAllAuth`, `emitAuthExpired` |
| `modules/auth.js` | Login, register, and logout for all three roles |
| `modules/gamezones.api.js` | Zone register, login, profile, verified list, admin zone edits. Default export `GameZoneAPI` |
| `modules/sessions.api.js` | Player plays and zone plays: create, start, pause, resume, continue, extra time, pay, end, cancel, delete |
| `modules/stations.api.js` | Station CRUD, QR lookup, replacement players, transfer |
| `modules/games.api.js` | Games for a zone |
| `modules/gameDetails.api.js` | Station game rules (price, duration) |
| `modules/players.api.js` | Players, stats, history, station-assignment requests |
| `modules/credits.api.js` | Packages, zone balance, grants, system costs |
| `modules/users.api.js` | Registered user records used by admin |
| `modules/admins.api.js` | Admin account CRUD |
| `modules/transactions.api.js` | Credit transactions |

## Shared paths

`/stations` and `/games` can be called by a zone or by an admin. The client uses the zone token when one is present, otherwise the admin token. If a call site must force a role, pass `{ authRole: 'admin' | 'gamezone' | 'user' }`.

Public paths send no token: `/auth/*`, zone register and login, verified zones, numeric `GET /gamezones/:id`, `GET` credit packages.

Use `unwrapList`, `unwrapData`, and `getApiErrorMessage` from `src/lib/http.js` on the payload. The payload is already unwrapped, so do not read `response.data` again.
