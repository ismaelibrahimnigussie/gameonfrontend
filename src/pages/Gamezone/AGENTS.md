# Game zone shell

Follow the repo `AGENTS.md`. Dark theme (`#020208`, cyan `#00F0FF`, purple `#7B2CBF`).

## How it fits

`GameZoneAuth.jsx` (in `src/pages`, with `GameZoneAuthParts.jsx` and `gameZoneAuthSchemas.js`) calls `zoneLogin` and then `onAuthSuccess()` with no credentials. Zone login clears other roles.

`GameZoneDashboard.jsx` calls `useLoungeDashboard()` once. The returned object is `d`. The shell shows the load gate, the refresh overlay, the toast, the wallet, and `Sidebar`. It renders `LoungeTabs` and `DashboardModals` with that same `d`. Do not fetch or mutate in the shell.

Screen files and hooks live in `Dashboard/`. Read `Dashboard/AGENTS.md` and `Dashboard/hooks/AGENTS.md` before editing them.

## Files here

| File | What it does |
|---|---|
| `GameZoneDashboard.jsx` | Auth and load gate, header, sidebar, toast, overlay |
| `components/Sidebar.jsx` | Tab list and logout. Calls `onTabChange` |
| `components/FullscreenRefreshOverlay.jsx` | Full-screen cover while `loadData(true)` runs |
| `components/SearchableDropdown.jsx` | Zone dropdown used by game, station, and session forms. Do not import the admin `Select` here |
| `components/SessionPlayerPicker.jsx` | Player choice inside the session modal |

`settings.jsx` under `Dashboard/` is a locked placeholder. `LoungeTabs` does not render it.
