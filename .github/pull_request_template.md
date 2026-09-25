## What

-

## Why

-

## How to test

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Clicked the changed flow in the browser (list steps below)

Steps:

1.

## Risk

- [ ] Auth / tokens
- [ ] Admin credits or roles
- [ ] Game-zone sessions (local session update vs full lounge reload)
- [ ] Routing

## Structure

- [ ] New UI or mutations went into the focused module, not `GameZoneDashboard.jsx` or `AdminPortal.jsx`
- [ ] No source file added or grown past about 300 lines without a split

## Notes

Agents: follow `AGENTS.md`. Do not set `axios.defaults.headers.common.Authorization`. Session rules live in `sessionRules.js` and `sessionPaymentRules.js`. Admin mutations live in `adminActions.js`.
