# GameOn Frontend

React SPA for GameOn: three portals on one codebase.

| Portal | Who it is for | Entry |
|---|---|---|
| Player | Gamers who scan a station QR and join a session | `/auth/user` |
| Game zone | Venue operators who run stations, games, and plays | `/GameZoneAuth` |
| Admin | Operations staff who verify zones, grant credits, and manage accounts | hidden ops path in `src/config/routes.js` |

The UI talks to a separate GameOn API. This repo is the client only.

## Stack

- React 19 + Vite 8
- React Router 7
- Tailwind CSS 4
- Axios
- React Hook Form + Zod (game-zone auth)
- Lucide icons

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The API defaults to `http://localhost:3000/api` if `VITE_API_BASE_URL` is unset.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production bundle in `dist/` |
| `npm run preview` | Serve the production bundle locally |
| `npm run lint` | ESLint over the repo |

## Environment

Copy `.env.example` to `.env`. Vite only exposes variables prefixed with `VITE_`.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | no | `http://localhost:3000/api` | Backend origin, including `/api` |

Never commit `.env` files. `.gitignore` already ignores them.

## App map

```
src/
  api/            Axios client, session storage, REST modules
  config/         Route constants — use these, do not hardcode paths
  context/        Role-specific auth providers (admin, game zone, user)
  hooks/          Shared hooks (session restore + 401)
  lib/            HTTP helpers (unwrap lists, error messages, phone)
  pages/Admin/    Operations dashboard (split into dashboard/*)
  pages/Gamezone/ Venue console
  pages/User/     Player portal
```

Auth tokens live in `localStorage` and are attached **per request** by `src/api/client.js`. Do not set `axios.defaults.headers.common.Authorization`.

## Docs

| File | Audience |
|---|---|
| [AGENTS.md](./AGENTS.md) | AI agents and new contributors working in this repo |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | How the three portals, auth, and API client fit together |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Build, hosting, SPA fallback, env |
| [SECURITY.md](./SECURITY.md) | Tokens, admin path, secrets |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Local workflow and PR expectations |
| [AUDIT.md](./AUDIT.md) | Latest code audit and remaining debt |

## Production notes

- This is a static SPA. The host must rewrite unknown paths to `index.html`.
- Admin access is JWT-protected. The ops URL is obscure, not a security boundary.
- `npm run build` is the release artifact. Preview it with `npm run preview` before deploy.

## License

Private. All rights reserved unless a license file is added.
