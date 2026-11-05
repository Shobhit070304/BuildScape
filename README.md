# BuildScape

BuildScape is a learning platform for production software projects. Visitors can browse project blueprints; signed-in learners can enroll, follow phases, save private notes, and share checked public repositories on a developer profile. Administrators can manage projects and review curriculum reports.

## Project layout

- `frontend/` — Next.js App Router application.
- `backend/` — Express API, MongoDB models, and seed/migration scripts.
- `backend/data/projects.json` — private local seed input used by the seed script; the ignored data file is not included in the repository.

## Requirements

- Node.js 22 or newer.
- npm.
- MongoDB Atlas or another replica set deployment. Progress clearing and project deletion use transactions.
- Google OAuth web client credentials, with the frontend and backend origins configured in Google Cloud.

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and fill in the required values.
2. Copy `frontend/.env.local.example` to `frontend/.env.local` and set the same Google client ID and the backend URL.
3. Install dependencies and start the API:

   ```bash
   cd backend
   npm ci
   npm run dev
   ```

4. In a second terminal, start the frontend:

   ```bash
   cd frontend
   npm ci
   npm run dev
   ```

The frontend runs at `http://localhost:3000`; the API runs at `http://localhost:4000` by default.

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | No | Set to `production` for deployment. |
| `PORT` | No | API port; defaults to `4000`. |
| `CORS_ORIGIN` | Yes | One frontend origin, without a path. Use HTTPS in production. |
| `MONGODB_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Random secret of at least 32 characters. |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth web client ID. |
| `ADMIN_EMAIL` | Yes for admin tools | Verified Google account allowed to administer curriculum. |
| `GROQ_API_KEY` | Yes in production | Groq API key for the workspace assistant. Keep it on the backend. |
| `GROQ_MODEL` | No | Groq model; defaults to `openai/gpt-oss-20b`. |
| `UPSTASH_REDIS_REST_URL` | Yes in production | HTTPS REST URL for the Upstash Redis database. |
| `UPSTASH_REDIS_REST_TOKEN` | Yes in production | Server-side Upstash REST token. Never expose it in frontend variables. |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Backend base URL, without a trailing slash. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Yes | Same Google OAuth web client ID as the backend. |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical production site URL. Defaults to the Vercel URL or BuildScape site URL. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | No | Google Search Console verification token. |

## Curriculum data

The current difficulty levels are **Beginner**, **Intermediate**, and **Advanced**. Run the idempotent migration against an existing database before deploying this version:

```bash
cd backend
npm ci
npm run migrate:difficulties
```

The migration maps `Entry` and `Basic` to `Beginner`, maps `Expert` to `Advanced`, and stops if it finds any other unsupported value. Back up production data before running migrations.

To seed or refresh a local MongoDB database, place your privately maintained `projects.json` at `backend/data/projects.json`, then run `npm run seed` from `backend/`. The data directory is ignored by Git and must be supplied separately. The application does not seed the production database on startup.

## Checks

Run the backend type check and unit tests:

```bash
cd backend
npm run check
```

## AI assistant and caching

The enrolled project workspace has a phase-aware AI tutor powered only by Groq. It streams concise answers, limits its scope to the current project and phase, and returns a fixed fallback for unrelated questions. Chat history is stored in Upstash per user, project, and phase for 24 hours; the three built-in starter prompts also use a 24-hour Upstash response cache when a new conversation starts. Saved phase notes are never sent to the model. If Groq is unavailable, the assistant displays a short offline next-step suggestion. Free-tier limits and model availability can change, so availability is not guaranteed.

Upstash Redis is the only application cache. Public project lists and details use a five-minute Redis TTL, and admin project writes invalidate those entries. If Redis is temporarily unavailable, public reads fall back to MongoDB without keeping a process-local cache. User progress, enrollment, and private notes are not cached.

Create an API key in [Groq Console](https://console.groq.com/keys) and a Redis database in Upstash. Set `GROQ_API_KEY`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` in the backend environment. `GROQ_MODEL` defaults to `openai/gpt-oss-20b`; override it only if you choose another model available to your account. Never put the key in `frontend/.env.local`.

Run frontend lint and production build:

```bash
cd frontend
npm run check
```

## Deployment

### Backend

Deploy `backend/` as a Node.js service (for example, Render or Railway):

- Build: `npm ci && npm run build`
- Start: `npm start`
- Set the backend environment variables above. Use MongoDB Atlas or a replica set so transaction-based actions work.
- Set `CORS_ORIGIN` to the exact HTTPS frontend origin.
- Confirm `GET /health` returns `200` and `GET /health/ready` returns `200` after MongoDB and Upstash are reachable.
- Run the difficulty migration once against the target database before serving this release.
- Ensure the database already contains the intended curriculum. Seeding is an explicit operation and does not happen at startup.

### Frontend

Deploy `frontend/` to Vercel with the root directory set to `frontend/`:

- Build: `npm run build`
- Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, and `NEXT_PUBLIC_SITE_URL`.
- Add the deployed frontend origin to the Google OAuth client configuration.

## API overview

The API provides health/readiness checks, Google sign-in and logout, public project and profile reads, enrollment and phase progress, private phase notes, curriculum issue reports, repository checks, username updates, and admin project/issue management. Protected endpoints use the `bs_token` HTTP-only cookie; admin routes verify the user's current database role.

Repository checks confirm that a GitHub repository exists and is public. They do not verify repository ownership or inspect repository contents.
