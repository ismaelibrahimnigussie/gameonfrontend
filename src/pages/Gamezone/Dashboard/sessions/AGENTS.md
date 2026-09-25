# Session screen

Follow `Dashboard/AGENTS.md`. `sessions.jsx` (the parent of this folder) owns React state. This folder is the view.

## How it fits

`LoungeTabs` renders `sessions.jsx` and passes handlers from `d`. The page keeps filters, selection, the open session id, toasts, confirm, and the round-result draft. It calls `getRemainingTime` every second. When the open session is playing and the timer hits zero, it calls `onPauseSession` once per tick until the status changes.

`SessionBoard` is the list. `SessionDetail` is the open session. Overlays (`RoundResultDialog`, `ConfirmDialog`, `ToastStack`) stay mounted for both.

Time, price, names, and filtering are pure functions in `sessionModel.js`. They take `now` as an argument. Do not close them over component state.

## Files

| File | What it does |
|---|---|
| `SessionBoard.jsx` | Header, revenue cards, status tabs, search, day and sort filters, bulk delete bar, empty state, card grid |
| `SessionCard.jsx` | One session. Checkbox, timer, player chips, one primary button, overflow menu |
| `SessionDetail.jsx` | Back button, timer hero, player toggle, transfer reminder, detail tabs |
| `SessionPanels.jsx` | `PlayerChips`, `OverviewPanel`, `RoundsPanel`, `PricingPanel` |
| `RoundResultDialog.jsx` | Optional results before `onContinueSession(id, results)` |
| `sessionUi.jsx` | `TimeBar`, `ActionButton`, `OverflowMenu`, `ConfirmDialog`, `ToastStack` |
| `sessionModel.js` | `sessionKey`, durations, `getRemainingTime`, `getPlayerRemainingTime`, `getSessionPricing`, `getSessionPlayers`, `getSessionRounds`, `filterSessions`, `STATUS_CONFIG` |

## Actions the page calls

| UI | Handler |
|---|---|
| New session | `onAddSession` → `openModal('session')` |
| Start, pause, resume, end, extra time | `runAction`, which calls the matching `handle*` with the session id |
| New round from the detail view | opens `RoundResultDialog`, then `onContinueSession` |
| New round from a card when time is up | `onContinueSession(id)` with no results |
| Cancel and delete | confirm dialog, then `onCancelSession` / `onDeleteSession` |
| Player chip | `onViewPlayerProfile` |
| Transfer or flexible leave | `onTransferPlayer`, `onLeaveFlexiblePlayer` |
| Add player | `onAddPlayerToSession` |

Do not import `SessionAPI` here. Do not sort the full list on every timer tick unless `sortBy === 'remaining'`.
