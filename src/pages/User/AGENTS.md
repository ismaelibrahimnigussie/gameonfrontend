# Player portal

Follow the repo `AGENTS.md`. Dark theme. Route: `USER_DASHBOARD_PATH`.

## How it fits

`App.jsx` renders `UserPortal` behind `ProtectedRoute` and passes `authUser` plus `onLogout`. Login is `src/pages/UserAuth.jsx` and `UserAuthForm.jsx`, not this folder. `UserAuth` calls `userLogin`, then `onAuthSuccess()` with no credentials.

## Files

| File | What it does |
|---|---|
| `UserPortal.jsx` | Loads players, sessions, stats, and pending station requests for the logged-in user. Selecting a player calls `loadPlayerProfile` |
| `ScannerPanel.jsx` | Camera or manual QR entry. Calls `resolveStation` from the portal |

## Assignment

A scan resolves the station with `StationAPI.getStationByQR`, then `PlayersAPI.requestStationAssignment`. The player id is `selectedPlayer.player_id` or `selectedPlayerId`. Do not read an id that exists only inside the load effect.

A failed first load sets `loadError`. A failed profile load sets `profileError`. The 15-second session refresh keeps the list already on screen if the request fails. QR failures set `scanError`.
