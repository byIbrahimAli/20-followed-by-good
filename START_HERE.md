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

Set these required values in `.env.local`:

- `PORT` (optional, defaults to `3000`)
- `APP_BASE_URL`
- `CLIENT_ID`
- `CLIENT_SECRET`
- `SESSION_SECRET`

**Pre-production vs production:** Leave service URL overrides unset to use production (`oauth2.quran.foundation` / `apis.quran.foundation`). For Quran Foundation test credentials, set `OAUTH2_BASE_URL`, `TOKEN_HOST`, and the `*_BASE_URL` / `GATEWAY_URL` vars to the prelive hosts — see the commented block in `.env.example`. Secrets belong only in `.env.local` (gitignored).

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
