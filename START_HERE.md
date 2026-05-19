# Start Here

## 0. Scaffold a new app (recommended)

This repo implements the `next` template from `@quranjs/create-app`. For a fresh scaffold:

```bash
npx @quranjs/create-app@latest followed-by-good
cd followed-by-good
```

## 1. Install and configure

From the repo root:

```bash
npm install
cp .env.example .env.local
```

Set these required values in `.env.local` (see [`.env.local.example`](./.env.local.example)):

- `PORT` (optional, defaults to `3000`)
- `APP_BASE_URL`
- `CLIENT_ID` and `CLIENT_SECRET` from [Quran Foundation](https://api-docs.quran.foundation/request-access/)
- `SESSION_SECRET` (long random string)

**Production (recommended):** Use your production client credentials and **omit** all `*_BASE_URL` / `GATEWAY_URL` overrides — the SDK defaults to `oauth2.quran.foundation` and `apis.quran.foundation`.

**Pre-production:** Use prelive credentials **and** the full prelive host block in `.env.example`. Never mix prelive OAuth with production API hosts.

**OAuth:** The server fetches short-lived access tokens automatically (`client_credentials` + `scope=content`). You do not paste tokens into `.env.local`. Verify setup:

```bash
npm run smoke:oauth
```

Docs: [QF quickstart](https://api-docs.quran.foundation/docs/quickstart/) · [Token exchange](https://api-docs.quran.foundation/docs/oauth2_apis_versioned/1.0.0/oauth-2-token-exchange/)

**Sign-in (optional):** Register `http://localhost:3000/callback` as a redirect URI in the QF portal. Production clients may not have user/OAuth features enabled by default.

## 2. Choose SDK source

Remote (npm):

```bash
npm run sdk:remote -- latest
```

Local (`api-js/packages/api`):

```bash
npm run sdk:local -- /absolute/path/to/api-js/packages/api
```

Check what is installed:

```bash
npm run sdk:status
```

## 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 4. Verify quickly

```bash
npm run smoke:oauth
npm run lint
npm run build
npm test
npm run smoke:config
npm run smoke:routes
```

## 5. Read next

- [README.md](./README.md)
- [docs/architecture.md](./docs/architecture.md)
- [docs/recipes](./docs/recipes)
