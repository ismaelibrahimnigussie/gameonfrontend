# Security

## Secrets

- Do not commit `.env`, `.env.*`, or files that look like `*.env`.
- Vite exposes every `VITE_*` variable to the browser. Never put private API keys, admin passwords, or signing secrets in `VITE_*`.
- `VITE_API_BASE_URL` is a public origin, not a secret.

## Auth tokens

Tokens are stored in `localStorage`:

- `user_token` / `user_profile`
- `gamezone_token` / `gamezone_profile` (plus legacy `zoneToken`)
- `admin_token` / `admin_profile`

That is XSS-sensitive. Treat any script injection as a session theft. Do not introduce `dangerouslySetInnerHTML` or untrusted HTML.

The Axios client attaches the token **per request**. Do not copy tokens into `axios.defaults` or log them.

On HTTP 401 the matching role is cleared and a `*-auth-expired` event is fired. Do not swallow 401s in page-level empty `catch` blocks if the user should be signed out — the interceptor already handles sign-out.

Game-zone login wipes other roles on the same browser. That is intentional.

## Admin portal

`ADMIN_PORTAL_PATH` (`/ops/…`) is obscure, not authorization. Real access control is the admin JWT and backend role checks.

Do not:

- Render the ops path on the login screen or in marketing pages
- Link it from the public home page
- Commit a “real” path in chat logs or screenshots of production

Changing the path is a product decision; existing operators bookmark it.

## Frontend threat model (short)

| Risk | Mitigation |
|---|---|
| Stolen `localStorage` token | Short-lived JWTs on the API; HTTPS; no XSS |
| CSRF | Bearer tokens in headers (not cookies) |
| Mixed-role token leak | Route-based interceptor; no global Authorization header |
| Open admin URL | JWT still required; do not advertise the path |
| Dependency CVEs | `npm audit` on install; keep lockfile committed |

## Reporting

If you find a vulnerability in this client or the API it calls, report it privately to the repo owners. Do not open a public issue with tokens, customer data, or exploit details.
