# ✨ Followed By Good

A spiritually intelligent habit platform that turns guilt into growth — when you slip, get a Quran-centred good deed to restore balance.

## 💡 Intent

Bad deeds happen. **Followed By Good** helps you respond with restorative accountability: log what happened, receive a tailored ayah and action, build memorisation and check-in habits, and grow with community support — all grounded in verified Quran content.

## 🌱 Core idea

- **Habit stacking** — pair triggers with positive Quran-backed actions
- **Ayah Assignment Engine** — semantic match from slip → relevant ayah + tafsir-guided next step
- **Daily check-ins** — goals and activity tracking
- **Memorisation** — listen, repeat, and deck-based review
- **Trigger mapping** — understand patterns and replace them
- **Social layer** — accountability without shame

## 🏆 Hackathon constraints

| Item | Detail |
|------|--------|
| **Deadline** | May 20, 2026 |
| **APIs** | ≥1 Content API (or Quran MCP) + ≥1 User API |
| **Team** | Per hackathon rules |
| **Submission** | Demo link, 2–3 min video, API usage write-up |

## API usage (hackathon submission)

| Feature | BFF route | Quran Foundation API |
|--------|-----------|----------------------|
| Ayah assignment (search) | `POST /api/fbg/assign` → `GET /api/search` | Search API (content) |
| Ayah text & translation | `POST /api/fbg/assign` → `GET /api/reader/[chapterId]` | Reader / Content API |
| Listen (recitation) | `GET /api/fbg/audio?verseKey=` | Content Audio API (verse recitation) |
| Dashboard intentions (signed in) | `GET /api/bootstrap` | Goals API (`goals` scope) |
| Save for later (signed in) | `POST /api/collections` | Collections API |
| Developer toolkit | `/developer`, `/api/*` | Bootstrap, notes, bookmarks, etc. |

**Content APIs:** Search + Reader power the Recovery Loop ayah assignment; Audio API powers Listen on assign and memorize. **User APIs:** Goals (today’s plan) and Collections (save ayah) when OAuth session is present; slips and SRS schedules stay in `localStorage` for privacy in v1.

### Demo checklist (mobile UI + recovery loop)

1. **Desktop** — open `/` on a wide screen; app appears as a centered **390×844** phone frame on `#0A0A0A` night background.
2. **Home** — “What slipped today?” slip card only (+ sign-in banner when logged out).
3. Log a slip → **Continue** → assign page shows Arabic + translation (Search + Reader APIs, or demo fallback on prelive).
4. **Begin memorizing** → SRS session → grade **Easy** → open **Memorize** tab for in-review list + metrics.
5. Bottom tabs: **Home** (`/`), **Memorize** (`/memorize` hub), **Community** (`/community` mock).
6. Optional: `/?demo=1` seeds a due Anger review card.

**APIs hit:** `POST /api/fbg/assign` (Search → Reader → demo fallback), `GET /api/fbg/assign?id=`, `GET /api/fbg/audio?verseKey=`, `GET /api/bootstrap` (goals when signed in), optional `POST /api/collections`.

```bash
npm run lint && npm run build && npm test && npm run test:e2e
```

### Manual test flow

1. Open `/` — slip card only.
2. Log a slip from the textarea, **Continue**.
3. Assign page — **Begin memorizing** or **Save for later**.
4. `/memorize/[sessionId]` — blur, type recall, grade easy/hard.
5. **Memorize** tab — full in-review list with metrics header.

## 🔌 APIs we're using

### Content

- **Quran MCP** — `https://mcp.quran.ai` (verified text, search, tafsir during development)
- **Tafsir APIs** — commentary for assignment engine
- **Audio APIs** — listen + repeat for memorisation

### User

- **Streak Tracking** — habit continuity
- **Activity & Goals** — daily check-ins
- **Collections** — memorisation sets / decks

### Auth (Quran Foundation OAuth2)

Two token types (see [QF quickstart](https://api-docs.quran.foundation/docs/quickstart/)):

| Token | How | Used for |
|-------|-----|----------|
| **App token** | `POST /oauth2/token` · `grant_type=client_credentials` · `scope=content` | Search, Reader, Audio (`/api/fbg/assign`, `/api/fbg/audio`, `/api/search`) — automatic via `@quranjs/api` server client |
| **User token** | Authorization code · `/api/auth/start` → `/callback` | Collections, goals, notes (signed-in features; may require QF to enable user scopes on production) |

Verify credentials: `npm run smoke:oauth`

## 🛠 Tech stack

- **Cursor** + **Quran MCP** + **Google Stitch** (design via MCP)
- **Next.js** — `@quranjs/create-app` starter
- **Quran Foundation SDK** — content and user APIs

## 🚀 Quick start

```bash
npm install
cp .env.example .env.local
```

Set in `.env.local`: `APP_BASE_URL`, `CLIENT_ID`, `CLIENT_SECRET`, `SESSION_SECRET` (and optional `PORT`). For **production**, omit service URL overrides. For **prelive**, use the full prelive block in `.env.example` — never mix environments. Run `npm run smoke:oauth` before `npm run dev`.

For **Stitch MCP** in Cursor, export your key (never commit it):

```bash
export GOOGLE_STITCH_API_KEY="your-key-here"
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Vercel:** see [docs/deploy-vercel.md](./docs/deploy-vercel.md) for project settings, env vars, and `APP_BASE_URL` resolution on preview/production.

Starter kit details: see [START_HERE.md](./START_HERE.md) and [docs/](./docs/).

## 📁 Repo layout

```
followed-by-good/
├── .cursor/          # MCP (Quran + Stitch) and project rules
├── src/              # Next.js app
├── docs/             # Architecture and recipes
├── scripts/          # Dev and SDK helpers
├── AGENTS.md         # Engineering rules for AI contributors
└── START_HERE.md     # Scaffold and verify steps
```

## 📚 Docs

- [START_HERE.md](./START_HERE.md) — install, env, SDK, smoke tests
- [AGENTS.md](./AGENTS.md) — auth, security, testing expectations
- [docs/](./docs/) — architecture and integration recipes
