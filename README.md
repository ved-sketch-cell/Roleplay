# ROLEPLAY — full-stack app

Complete source for the ROLEPLAY website, original mobile preview, and connected community backend. This package combines the latest frontend with FastAPI, PostgreSQL, Redis, password recovery, moderation, notifications, and backup tooling. It is ready to put in your own private GitHub repository.

## Quick start

Install Docker Desktop with Docker Compose and Python 3. Extract this ZIP, open a terminal inside `ROLEPLAY-Fullstack`, then run:

```sh
python backend/scripts/setup_env.py
docker compose up --build
```

On Windows, use `py backend/scripts/setup_env.py` if the `python` command is unavailable. Docker Desktop must be running with Linux containers enabled.

Open **http://localhost:8080**. The stack runs locally; this does not publish it online. Database/Redis volumes persist when you stop it with `docker compose down`.

| Address | Feature |
| --- | --- |
| `http://localhost:8080/` | Landing page |
| `http://localhost:8080/#/app/people` | Accounts, preferences, recommendations, connection requests |
| `http://localhost:8080/#/app/messages` | Accepted connections, persistent chat and presence |
| `http://localhost:8080/#/app/notifications` | Notifications and delivery preferences |
| `http://localhost:8080/#/app/recover` | Password recovery |
| `http://localhost:8080/#/app/moderation` | Assigned moderators |
| `http://localhost:8080/original.html?demo=1` | Latest original mobile preview |
| `http://localhost:8000/docs` | FastAPI development API documentation |
| `http://localhost:8025` | Local Mailpit inbox |

Create two accounts in separate browser profiles with overlapping interests and languages. Opt both into discovery, request a connection, and accept it from the other account. Then exchange real messages through the connected Messages page. Presence sharing is optional and starts private. Mailpit captures local recovery/notification emails; it does not deliver them to real inboxes.

## Included

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion and Lucide icons; the landing page, internal web pages, branding and all local artwork.
- **Backend:** FastAPI and versioned Alembic migrations for PostgreSQL.
- **Accounts:** password hashing, access tokens, rotating HttpOnly refresh cookies, session revocation, account export/deletion.
- **Recommendations:** declared-preference matching with consent, language/contact constraints, score explanations, blocks and dismissals. Authenticated `recommend_users` tool execution and optional OpenAI prompt interpretation.
- **Chat:** mutually accepted connections, authorized PostgreSQL history, pagination, idempotent sends, read receipts, retraction, WebSocket tickets and HTTP fallback.
- **Redis:** presence TTLs, opt-in sharing, realtime event delivery and rate-limit support.
- **Recovery/moderation:** single-use recovery links, encrypted outbox payloads, reports, moderator actions and audits.
- **Notifications/backups:** in-app/email preferences, retry worker, optional encrypted PostgreSQL backups and guarded restore drills.
- **Developer setup:** Docker Compose, Nginx proxy, example configuration, tests and GitHub Actions checks.

## Current UI and service boundaries

The frontend snapshot includes the latest Challenges UI; editable vibe, mindset and boundaries; discovery questionnaire and Daily Deck fixes; anonymous counselling session-request preview; the restored healing-game design; and Muse, Orbit, Pixel and Quest bot previews. Frontend source snapshot: `e2ba088237dcc3b86c152640bc8b27578f9444d7`, exported 20 October 2026. It includes the conversation-first home, compact AI companion cards, clearer discovery steps, saved challenge shortcuts, profile refinements, and the labelled gradient heat meter with live activity feedback and its redesigned details sheet.

**Find people, Messages, Notifications, recovery and moderation connect to the backend when this local stack is running.** The supplied original mobile entry remains a device-only prototype. Its local chat/game progress and profile settings do not sync to server accounts yet.

Counselling has no connected provider or booking service. Bot replies in the mobile preview are written samples. The bot client has an optional live endpoint adapter, but this package does not include an AI conversation inference backend. Optional AI recommendation search in Find people is implemented and needs your own server-held provider key/model. No API key, live SMTP account, real user database, or backup private key is included. The hosted private Site remains a frontend preview; downloading this package does not change that deployment.

## Put the code on GitHub

Create an empty **private** GitHub repository. From inside `ROLEPLAY-Fullstack`:

```sh
git init -b main
git add .
git commit -m "Add ROLEPLAY full-stack app"
git remote add origin https://github.com/YOUR_USERNAME/roleplay.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. The included `.gitignore` excludes generated secrets, dependencies, builds, databases and backups. Review `git status` before committing. GitHub Actions runs checks; it has no deployment or publishing step.

## Frontend development

Use Node.js 22.12+ and pnpm 10. Keep the API running locally, then:

```sh
pnpm install --frozen-lockfile
pnpm run dev
pnpm run typecheck
pnpm run test:journeys
pnpm run build
```

Vite forwards `/api` and WebSockets to FastAPI on `127.0.0.1:8000`. Nginx does the same inside Compose. Both `index.html` and `original.html` are included in the build, and Open app / Explore the app retain the landing-home return route. `VITE_API_BASE_URL` is a non-secret frontend override. `.env.frontend.example` documents the optional frontend settings; API credentials belong on the server.

## API development without Docker

Use Python 3.12+, PostgreSQL 17, Redis 6.2+ and a local SMTP capture server. Copy `backend/.env.example` to `backend/.env` and set its database URL, JWT secret and generated Fernet key.

```sh
cd backend
python -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows PowerShell instead: .venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
alembic upgrade head
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 --ws-max-size 16384
```

Run `python -m app.worker` in a second terminal with the same settings. Compose automatically runs migrations before API readiness. Existing installations can run `python backend/scripts/setup_env.py --upgrade` to add missing settings while preserving existing values.

## Operator configuration and guides

For optional AI discovery, configure server `OPENAI_API_KEY` and a compatible `OPENAI_MODEL`. Standard preference matching works without AI. Actual AI requests require consent and may incur provider charges. For real email delivery, configure SMTP credentials, sender and STARTTLS instead of Mailpit. For deployment, use HTTPS, secure cookies, explicit CORS origins and restricted database/Redis access. Chat is not end-to-end encrypted.

Assign a moderator after creating the operator account:

```sh
docker compose exec api python -m scripts.grant_moderator --email OPERATOR_EMAIL
```

| Guide | Purpose |
| --- | --- |
| [COMMUNITY-BACKEND.md](docs/COMMUNITY-BACKEND.md) | Chat, recovery, notifications, moderation and presence |
| [RECOMMENDATIONS.md](docs/RECOMMENDATIONS.md) | Preference scoring and AI tool contract |
| [BACKUPS.md](docs/BACKUPS.md) | Encrypted backups and guarded restore drills |
| [BACKEND-ROADMAP.md](docs/BACKEND-ROADMAP.md) | Remaining backend/product work |
| [AI-BOT-INTEGRATION.md](docs/AI-BOT-INTEGRATION.md) | Mobile bot previews and future inference endpoint |
| [APP-JOURNEYS.md](docs/APP-JOURNEYS.md) | Mobile routes, interactions and prototype data boundaries |
| [GITHUB-SETUP.md](docs/GITHUB-SETUP.md) | Create your private GitHub repository and run locally |
| [EXPORT-VERIFICATION.md](docs/EXPORT-VERIFICATION.md) | Checks performed on this combined source |
| [openapi.json](docs/openapi.json) | API contract |

## Source map

| Folder | Code |
| --- | --- |
| `src/website/` | Landing and internal web screens |
| `src/app/` | Latest original mobile app and its interactions |
| `src/backend/` | Backend-connected web UI and API/socket client |
| `src/brand/`, `src/assets/`, `public/`, `src/styles/` | Branding, artwork, fonts and styles |
| `backend/app/` | API, accounts, matching, sockets, recovery, moderation and worker |
| `backend/alembic/` | Database migrations |
| `backend/tests/` | Backend tests |
| `backend/scripts/` | Local secrets setup, moderators, cleanup and demo seeding |
| `ops/backup/` | Optional encrypted backup/restore tooling |
| `.github/workflows/` | CI checks |

Third-party acknowledgments remain in `ATTRIBUTIONS.md` and `src/app/Attributions.md`. Update canonical metadata and the sitemap/robots files before changing the website domain.
