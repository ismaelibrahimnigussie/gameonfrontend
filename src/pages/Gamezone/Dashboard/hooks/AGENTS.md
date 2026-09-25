# Lounge hooks

Follow the repo `AGENTS.md`. This folder owns lounge data and mutations. UI files read the returned object. They do not import these factories directly unless they are adding a handler.

## Composition

```
useLoungeDashboard()
  lounge = useLoungeState()
             useGameZoneAuth()
             useLoungeFields()          useState buckets
             useLoungeBindings(auth, field)
               loadData, updateSessionState, showToast, openModal, closeModal, handleSaveProfile
             projectLoungeState()       one flat object
  catalog = createCatalogActions(lounge)
  sessions = useSessionActions(lounge)
               useManualSessionPlayers(lounge)    effect: invite-mode player list
               kit = createSessionActionKit(lounge)
               createSessionSetupActions(kit)
               createSessionLifecycleActions(kit)
               createPlayerSessionActions(kit)
               createPaymentActions(kit)
```

`useSessionActions` returns the handler names the screens already call (`handleCreateSession`, `handleStartSession`, and the rest). Add a new handler to the matching factory and to that return list.

## Lounge files

| File | What it does |
|---|---|
| `useLoungeDashboard.js` | Joins lounge, catalog, and session handlers into `d` |
| `useLoungeState.js` | Calls the three lounge pieces and returns the flat object |
| `useLoungeFields.js` | State: tab, lists, modal, forms, transfer and profile flags |
| `useLoungeBindings.js` | Effects and callbacks that need both auth and fields. Loads the lounge once, refreshes on `loadData(true)`, merges a returned session |
| `loungeLoad.js` | `fetchLoungeCore`, `fetchGameStations`, `mergeSessionList`, `mergeSessionModal` |
| `loungeModel.js` | Empty forms, zone id, verification, station counts, session price plan, `openModal` guards |
| `loungeView.js` | `projectLoungeState`. The only place that shapes the public lounge object |
| `catalogActions.js` | Create, update, and delete games, stations, and rules |

`loadData(true)` refetches zone, games, credits, rules, sessions, and every station list, and shows the full-screen overlay. Call it for a real lounge reload, not after a single session patch.

## Session factories

`createSessionActionKit` builds `requireVerified`, `applyZoneSession`, `runFormSubmit`, toasts, and modal helpers. Factories close over that kit.

| Factory | Handlers |
|---|---|
| `sessionSetupActions.js` | `handleCreateSession`, `handleStartRandomSessionFromStation`, `handleInviteFromStation` |
| `sessionLifecycleActions.js` | start, pause, resume, continue, extra time, cancel, delete, bulk delete |
| `sessionPlayerActions.js` | profile, add, leave, transfer. Transfer calls `loadData(true)` |
| `sessionPaymentActions.js` | `handleEndSession`, `handlePayPlayerRounds`, `proceedToPlayerPayment`, `confirmEndSessionPayment` |
| `useManualSessionPlayers.js` | While the session modal is in invite mode, loads replacement players and preselects the first |

`applyZoneSession` writes the unwrapped session through `updateSessionState` and toasts. Continue and extra time rethrow after the error toast so `sessions.jsx` can clear its pending flag. Add, leave, and extra time do not call `loadData`.

## Pure rules

`sessionRules.js` is create and roster math: ids, invite codes, occupied stations, nicknames, payload, profile roster, transfer reminder. `sessionPaymentRules.js` is `unpaidRounds`, `roundCharge` (internal), `queueRoundPayment`, `reviewQueuedPayment`, `endSessionPayment`, and `paymentRequestBody`. Payment rules are re-exported from `sessionRules.js`.

Create order: verified lounge, invite QR when not random, credits, game rule, unfinished-player block, Before Game payment (Cash or Mobile Banking and a positive price), free station, then `SessionAPI.createZoneSession`.
