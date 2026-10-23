# Export verification — 20 October 2026

This package combines frontend source `e2ba088237dcc3b86c152640bc8b27578f9444d7` with the existing ROLEPLAY FastAPI backend and connected web UI. The API-connected `src/website/App.tsx`, `src/backend/`, server code, operational tooling, and CI configuration are preserved from the earlier full-stack package.

## Checked for this export

- Frozen-lockfile frontend dependency installation.
- Frontend TypeScript validation.
- 55 DOM journey groups covering 102 initial route renders. These exercise all 16 games, discovery, Daily Deck to chat, challenges, counselling requests, profile editing, bot previews, navigation, persistence, and the latest heat-meter interactions.
- Production build of both the website and mobile entry, including the prerendered landing page.
- Byte comparison of current frontend files with the hosted source, with the documented backend integrations and portable configuration retained separately.
- Hash comparison confirming 61 backend, integration, and CI files remain unchanged from the prior validated full-stack package.
- Syntax parsing of 40 backend Python files.
- Compose and CI YAML parsing, expected service declarations, loopback-only development ports, and example-only environment configuration.
- Source archive path integrity, asset inclusion, and exclusion of generated credentials, dependencies, builds, database records, and backups.

## Earlier backend validation — 12 October 2026

The unchanged backend package previously passed:

- Backend Ruff checks.
- 50 backend tests using a disposable PGlite PostgreSQL engine, a real Redis process, Uvicorn HTTP/WebSockets, and local SMTP test transport. Provider requests were mocked; no paid AI request was made.
- Alembic upgrade, schema-drift checks, downgrade to the preferences revision, and upgrade to the latest revision.

Those integration services were not rerun for this source-only export. Backend changes should be checked with the included GitHub Actions workflow and a disposable local test database.

## Verification limits

Docker/Compose and Nginx containers were not run here. Native PostgreSQL 17 concurrency, actual age/pg_dump encrypted restore, browser/phone rendering, GitHub-hosted CI, production SMTP, and model-provider inference have not been verified by this export's checks.

The original mobile app remains a device-local preview. Backend-connected discovery/chat and account features use the web app routes listed in the README. Mobile bot chat and counselling remain previews; downloading the source does not connect live providers.
