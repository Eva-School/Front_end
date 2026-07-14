# Grade Management Frontend

Next.js 16 frontend for the Grade Management System. It uses the same-origin
`/backend-api` proxy so browser calls do not need a separate public backend URL.

## Local setup

1. Copy `.env.example` to `.env.local` and set `BACKEND_API_URL` to the local API.
2. Install dependencies with `npm ci`.
3. Start the app with `npm run dev`.

The local API is expected at `http://localhost:5080/api` by default.

## Validation

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `BACKEND_API_URL` | Server-only URL used by Next.js rewrites and route handlers. |
| `NEXT_PUBLIC_API_URL` | Browser API base; keep `/backend-api` for the local proxy. |
