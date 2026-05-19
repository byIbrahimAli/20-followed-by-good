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

## 🔌 APIs we're using

### Content

- **Quran MCP** — `https://mcp.quran.ai` (verified text, search, tafsir during development)
- **Tafsir APIs** — commentary for assignment engine
- **Audio APIs** — listen + repeat for memorisation

### User

- **Streak Tracking** — habit continuity
- **Activity & Goals** — daily check-ins
- **Collections** — memorisation sets / decks

### Auth (starter)

- OAuth2 + `@quranjs/api` BFF — session and user-scoped routes via `/api/*`

## 🛠 Tech stack

- **Cursor** + **Quran MCP** + **Google Stitch** (design via MCP)
- **Next.js** — `@quranjs/create-app` starter
- **Quran Foundation SDK** — content and user APIs

## 🚀 Quick start

```bash
npm install
cp .env.example .env.local
```

Set in `.env.local`: `APP_BASE_URL`, `CLIENT_ID`, `CLIENT_SECRET`, `SESSION_SECRET` (and optional `PORT`). For **pre-production** OAuth/API testing, also set `OAUTH2_BASE_URL`, `TOKEN_HOST`, and the `apis-prelive.quran.foundation` service URLs — see `.env.example` (placeholders only; never commit secrets).

For **Stitch MCP** in Cursor, export your key (never commit it):

```bash
export GOOGLE_STITCH_API_KEY="your-key-here"
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
