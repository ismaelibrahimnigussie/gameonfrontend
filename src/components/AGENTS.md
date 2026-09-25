# Shared components

Follow the repo `AGENTS.md`. This folder is the public home page and the route guard. Portal UI does not live here.

## How it fits

`App.jsx` renders `Home` at `/` and wraps each authenticated route in `ProtectedRoute`. `Home` only navigates to the player and game-zone auth routes. It must not link to the admin path.

## Files

| File | What it does |
|---|---|
| `Home.jsx` | Landing page. Holds the selected portal and renders the home pieces |
| `home/content.js` | `NAV_ITEMS`, `PORTALS`, and `METRICS` copy. Change marketing text here |
| `home/PortalCards.jsx` | The two portal choices |
| `home/PortalPreview.jsx` | Detail panel for the selected portal and its launch button |
| `home/HomeFooter.jsx` | Footer |
| `ProtectedRoute.jsx` | `ProtectedRoute` redirects when logged out. `AuthBootScreen` shows while `isLoading` |

`ProtectedRoute` needs both `isAuthenticated` and `isLoading`. Do not hide the provider tree with `{!isLoading && children}`.
