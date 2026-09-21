# Deployment

## Build

```bash
npm ci
npm run build
```

Output is `dist/`: `index.html`, hashed JS/CSS, and files from `public/`.

Preview the production bundle:

```bash
npm run preview
```

## Environment

Set `VITE_API_BASE_URL` **at build time**. Vite inlines `import.meta.env.VITE_*` into the bundle. Changing the API URL after deploy requires a rebuild.

Examples:

```bash
# staging
VITE_API_BASE_URL=https://api.staging.example.com/api npm run build

# production
VITE_API_BASE_URL=https://api.example.com/api npm run build
```

The value must include the `/api` prefix if the backend mounts routes there. Local fallback is `http://localhost:3000/api`.

## Hosting

This is a client-side router. Every host must serve `index.html` for unknown paths.

**nginx**

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Netlify** — `public/_redirects` is already in the repo and is copied into `dist/` on build:

```
/*    /index.html   200
```

**Vercel** — `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**GitHub Pages** — needs a `404.html` copy of `index.html` or a hash router. Prefer a host with rewrite support.

## Caching

- `index.html` — short cache or no-cache so clients pick up new hashed assets
- `dist/assets/*` — long cache (`immutable`); filenames include a content hash

## Checks before a release

1. `npm run lint`
2. `npm run build`
3. `npm run preview` against the real or staging API
4. Smoke: player login, game-zone login, admin login, reload while logged in, 401 logout
5. Confirm `VITE_API_BASE_URL` points at the intended environment (no leftover localhost)

## Runtime

No Node server is required in production. Any static file host works. CORS must allow the frontend origin on the API.
