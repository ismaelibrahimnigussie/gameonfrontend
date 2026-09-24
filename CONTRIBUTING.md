# Contributing

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Point `VITE_API_BASE_URL` at a running GameOn API (default `http://localhost:3000/api`).

## Workflow

1. Branch from the current integration branch (today: `refactored_branch` / `main`).
2. Keep PRs to one portal or one layer (auth, admin UI, game-zone sessions).
3. Use route constants and `src/lib/http.js` helpers.
4. Run `npm run lint` and `npm run build` before you push.
5. If you changed UI, click through the flow in the browser (not just a screenshot).

Read [AGENTS.md](./AGENTS.md) before large edits. It is the working contract for this repo.

## Code style

- JavaScript + React function components
- Tailwind utilities; admin is light slate, public/game-zone is dark
- No new default Axios headers
- No new auth context
- No drive-by refactors of `GameZoneDashboard.jsx` unless that is the task

## Commits

Write commits that say what changed and why, in the same language as the surrounding git history. Do not bundle unrelated formatting with behavior changes.
