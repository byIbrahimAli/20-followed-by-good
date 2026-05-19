# Deploy to Vercel

Followed By Good is a standard **Next.js 14** App Router app. No `vercel.json` is required.

## Vercel project settings

| Setting | Value |
|--------|--------|
| **Framework Preset** | Next.js |
| **Root Directory** | `.` (repo root) |
| **Build Command** | `npm run build` |
| **Output Directory** | Leave empty (default) |
| **Install Command** | `npm install` |
| **Node.js** | 20.x |

Do **not** set a static `out` directory unless you add `output: 'export'` to `next.config.mjs` (not used today).

Do **not** set `PORT` on Vercel — the platform injects it at runtime.

## Environment variables

### Required (always)

| Variable | Notes |
|----------|--------|
| `CLIENT_ID` | Quran Foundation production client ID |
| `CLIENT_SECRET` | Server-only; never expose to the browser |
| `SESSION_SECRET` | Long random string for signed session cookies |

### App URL (`APP_BASE_URL`)

The server uses the public origin for OAuth redirects (`/callback`) and absolute links.

**Resolution order** (see `src/lib/resolve-app-base-url.ts`):

1. `APP_BASE_URL` if set (use for **custom domains**)
2. On Vercel **production**: `VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL`
3. On Vercel **preview**: `VERCEL_URL` for that deployment only

For a **custom domain**, set `APP_BASE_URL` explicitly, e.g. `https://followedbygood.com`.

For the default `*.vercel.app` hostname, you can omit `APP_BASE_URL` on Vercel and let the helper resolve it.

Local dev still requires `APP_BASE_URL=http://localhost:3000` in `.env.local`.

### Recommended for production

| Variable | Notes |
|----------|--------|
| `REDIS_URL` | Upstash Redis (or other). Without it, OAuth sessions use in-memory storage and **do not persist** across serverless invocations. The recovery loop (assign, listen, memorize) still works via client-credentials + `localStorage`. |

### Optional

| Variable | Default |
|----------|---------|
| `TRANSLATION_IDS` | `20` (Saheeh International) |
| `SCOPES` | See `.env.example` |
| `DEFAULT_READER_CHAPTER` | `1` |
| `DEFAULT_RECITER_ID` | — |
| `DEFAULT_TAFSIR_ID` | — |
| `REDIS_URL` | — |
| `OAUTH2_BASE_URL`, `GATEWAY_URL`, `CONTENT_BASE_URL`, … | Omit for production QF defaults |

Never mix prelive OAuth hosts with production API hosts. See `.env.example`.

## Quran Foundation OAuth

1. Register redirect URI: `{APP_BASE_URL or resolved origin}/callback`
2. For preview deploys, add each preview URL’s `/callback` in the QF portal, or test sign-in on production only.
3. Verify credentials: `npm run smoke:oauth` (locally with the same `CLIENT_ID` / `CLIENT_SECRET`).

## Pre-deploy checklist

1. Import repo → confirm **Next.js** preset and `npm run build`.
2. Set `CLIENT_ID`, `CLIENT_SECRET`, `SESSION_SECRET` in Vercel (Production + Preview as needed).
3. Set `APP_BASE_URL` if using a custom domain; otherwise rely on Vercel URL helpers.
4. Add `REDIS_URL` if demonstrating sign-in, goals, or collections.
5. Deploy and smoke-test: `/` → slip → assign → listen → memorize.

## What works without extra code

- FBG recovery loop (content API via client credentials)
- Listen / tafsir / verse BFF routes
- Themes, community mock, SRS in `localStorage`
- HTTPS for Web Speech on assign / memorize

## Limitations without Redis

- User OAuth sessions may not survive cold starts or different serverless instances.
- In-memory assignment cache (`/api/fbg/assign?id=`) is per-instance; fallbacks still return content.
