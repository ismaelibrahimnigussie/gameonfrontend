# Auth contexts

Follow the repo `AGENTS.md`. There is one context per role. Do not add a unified `AuthContext`.

## How they relate

`App.jsx` wraps the tree in `AdminAuthProvider`, `GameZoneAuthProvider`, and `UserAuthProvider`. Each provider calls `usePersistedAuth(role)` from `src/hooks/usePersistedAuth.js`.

`usePersistedAuth` reads the session synchronously from `authSession.js`. `isLoading` means a login is in flight, not that the app is still booting. The provider always renders `children`. `ProtectedRoute` is what waits or redirects.

On `admin-auth-expired`, `gamezone-auth-expired`, or `user-auth-expired`, the matching context clears its React state. The client already cleared storage.

Game-zone login is exclusive: persisting it clears the user and admin sessions. Admin and player logins do not clear the others.

Login pages call `adminLogin`, `zoneLogin`, or `userLogin`, then `onAuthSuccess()` with no credentials. `App.jsx` only navigates.

## Files

| File | Hook | Use |
|---|---|---|
| `AdminAuthContext.jsx` | `useAdminAuth` | Admin profile, `adminLogin`, `adminLogout` |
| `GameZoneAuthContext.jsx` | `useGameZoneAuth` | Zone profile, `zoneLogin`, `zoneLogout`, `getZoneToken`, `updateZoneUser` |
| `UserAuthContext.jsx` | `useUserAuth` | Player profile, `userLogin`, `userLogout` |

Do not put REST calls for games, sessions, or credits in these files. Those belong in `src/api/modules`.
