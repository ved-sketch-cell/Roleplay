# Put ROLEPLAY on GitHub

This is the complete multi-file project. Keep `src`, `public`, `backend`, and the root setup files together.

## Create your repository

1. Extract `ROLEPLAY-Fullstack.zip`.
2. Create a new **private** GitHub repository named `roleplay`. Leave the repository empty: this folder already includes its README and ignore rules.
3. Open a terminal inside the extracted `ROLEPLAY-Fullstack` folder.
4. Run these commands, replacing `YOUR_USERNAME` with your GitHub username:

```sh
git init -b main
git add .
git status
git commit -m "Add ROLEPLAY full-stack source"
git remote add origin https://github.com/YOUR_USERNAME/roleplay.git
git push -u origin main
```

Use GitHub's sign-in flow or a personal access token when Git asks for authentication. Keep tokens out of source files and remote URLs. Review the staged filenames shown by `git status`; local `.env` files, dependencies, generated builds, databases, and backups are excluded by the included ignore rules.

If you prefer GitHub Desktop, use **File → Add local repository**, select this folder, create a repository there when prompted, and publish it with **Keep this code private** selected.

## Run the complete stack

Install Docker Desktop with Compose and Python 3, then run inside the project folder:

```sh
python backend/scripts/setup_env.py
docker compose up --build
```

On Windows you can use `py` instead of `python`.

- Website: http://localhost:8080/
- Mobile preview: http://localhost:8080/original.html?demo=1#/home
- Backend-connected discovery: http://localhost:8080/#/app/people
- Backend-connected chat: http://localhost:8080/#/app/messages
- API documentation: http://localhost:8000/docs
- Development email inbox: http://localhost:8025/

The setup script creates fresh local secrets. Keep the generated `.env` private. Starting this stack runs it locally; use the README's operator guidance before choosing an online deployment.

## Work on the frontend only

Use Node.js 22.12 or newer and pnpm. The `.nvmrc` file selects Node 22 for nvm users.

```sh
pnpm install --frozen-lockfile
pnpm run dev
```

Open http://localhost:5173/original.html?demo=1#/home for the mobile preview, or http://localhost:5173/ for the website. The mobile preview uses device-local sample data. Connected account and messaging pages require the FastAPI backend.

Check changes before committing:

```sh
pnpm run typecheck
pnpm run test:journeys
pnpm run build
```

## Key places to edit

| File or folder | Purpose |
| --- | --- |
| `src/app/mobile/ConversationHeat.tsx` | Heat rail, labels, feedback and details sheet |
| `src/app/mobile/heat-meter.css` | Heat meter appearance and responsive sizing |
| `src/app/mobile/conversationProfiles.ts` | Heat levels and fictional conversation profiles |
| `src/app/mobile/app-refinement.css` | Shared app UI refinements |
| `src/app/OriginalApp.tsx` | Mobile routes and navigation |
| `src/app/components/` | App screens and games |
| `src/website/` | Landing and web pages |
| `src/backend/` | Web UI connected to the API |
| `backend/app/` | FastAPI services |
| `backend/alembic/` | PostgreSQL migrations |
| `compose.yaml` | Local web, API, worker, database and Redis services |

## Automation and service boundaries

The included GitHub Actions workflow runs frontend and backend checks. It does not publish the app. Backend tests use disposable PostgreSQL and Redis services.

The original mobile app is still a device-local preview, including counselling requests and written bot replies. Connected web discovery, chat, recovery, moderation, and notifications use the backend. AI recommendation prompt interpretation needs a server-held provider key; AI bot conversation inference is not included. See the README and service guides for these boundaries.
