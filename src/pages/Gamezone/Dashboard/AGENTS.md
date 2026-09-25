# Lounge screens

Follow the repo `AGENTS.md` and `src/pages/Gamezone/AGENTS.md`.

`LoungeTabs.jsx` switches on `d.activeTab` and passes fields from `d` into one page. `modals/DashboardModals.jsx` mounts every modal and each modal reads `d` itself. Both must keep using the object from `useLoungeDashboard()`. Do not give a page its own copy of sessions or stations.

## Screens

| File | Tab | What it does |
|---|---|---|
| `overview.jsx` | overview | Credit balance, station counts, shortcuts to add a game or station |
| `games.jsx` | games | Game list. Opens the game modal through `openModal` |
| `stations.jsx` | stations | Filter and sort stations. Renders `stations/StationCard.jsx` and `StationPrintDialog` |
| `sessions.jsx` | sessions | List state only. See `sessions/AGENTS.md` |
| `profile.jsx` | profile | Zone profile summary. Edit form is `profile/ProfileForm.jsx`. Save goes to `handleSaveProfile` |
| `LoungeTabs.jsx` | — | Banners for unverified zones and zero credits, then the active page |
| `settings.jsx` | — | Unused locked placeholder. Do not mount it unless asked |

## Modals

All take `{ d }` and return null when `d.modal.type` is not theirs.

| File | `modal.type` | What it does |
|---|---|---|
| `modals/DashboardModals.jsx` | — | Renders the set below |
| `modals/GameModal.jsx` | `game` | Create or edit a game |
| `modals/StationModal.jsx` | `station` | Create or edit a station |
| `modals/DetailModal.jsx` | `detail` | Game rule: duration, extra time, prices |
| `modals/SessionModal.jsx` | `session` | Create a session or show an invite QR. Fields are `SessionFormSections.jsx` |
| `modals/SessionAddPlayerModal.jsx` | `session-add-player` | Pick a replacement player for a waiting session |
| `modals/TransferPlayerModal.jsx` | `transfer-player` | Destination station and replacement player |
| `modals/PlayerProfileModal.jsx` | `player-profile` | Stats, history, and the unpaid-round queue |
| `modals/SessionPaymentModal.jsx` | `session-payment` | End a session, record a payment, or pay queued rounds |

Catalog create and edit handlers come from `catalogActions`. Session handlers come from `useSessionActions`. Do not call `SessionAPI` from a modal.
