# Admin portal

Follow the repo `AGENTS.md`. Light slate theme. Do not print `ADMIN_PORTAL_PATH`.

## How it fits

```
AdminAuth.jsx          login page, calls adminLogin then onAuthSuccess()
AdminPortal.jsx        layout only: sidebar, headers, page switch, modals
  useAdminPortal()     fetch, filters, modal state, which page is open
  createAdminActions() zone, credit, package, player, admin, and cost mutations
  dashboard/*          one presentational page per nav item
  components/*         primitives, chrome, row cards, modals shell
```

Pages receive data and callbacks. They do not call the API. New fetches go in `useAdminPortal.js`. New saves and deletes go in `adminActions.js`.

`constants.js` holds `NAV_ITEMS`, `PAGE_SUBTITLES`, empty forms, `pickZoneId`, and `pickPackageId`.

## Pages

| File | Shows |
|---|---|
| `dashboard/OverviewPage.jsx` | Stats and shortcuts |
| `dashboard/ZonesPage.jsx` | Zone list |
| `dashboard/PlayersPage.jsx` | Players, search, bulk select |
| `dashboard/AdminsPage.jsx` | Admin accounts. Super Admin only |
| `dashboard/CreditsPage.jsx` | One zone's credit history, grant, revoke |
| `dashboard/Packages.jsx` | Credit packages |
| `dashboard/SystemCosts.jsx` | Cost rules. Super Admin only. Save and delete still go through `adminActions` |

## Components

Import primitives from `components/ui.jsx` only. That file re-exports `Select` (`Select.jsx`) and `Modal` / `ConfirmDialog` (`dialogs.jsx`).

| File | What it does |
|---|---|
| `components/ui.jsx` | `Avatar`, `Button`, `Input`, `Textarea`, `Badge`, `Card`, `EmptyState`, `Skeleton`, `Toast`, `StatCard`, plus the re-exports |
| `components/layout.jsx` | `DesktopSidebar`, `DesktopHeader`, `MobileHeader`, `MobileDrawer`, `MobileBottomNav` |
| `components/cards.jsx` | `ZoneRow`, `ZoneCard`, `PackageCard`, `CreditRow` |
| `components/AdminModals.jsx` | Zone, grant, package, player, and admin modal forms. Rendered by `AdminPortal` |

Credit revoke still uses `window.prompt`. New money actions use `ConfirmDialog` or `Modal`.
