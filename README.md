# BuildScape

BuildScape is a learning platform for production software projects. Visitors can browse project blueprints; signed-in learners can enroll, follow phases, save private notes, and share checked public repositories on a developer profile. Administrators can manage projects and review curriculum reports.

## Project layout

- `frontend/` — Next.js App Router application.
- `backend/` — Express API, MongoDB models, and seed/migration scripts.
- `backend/data/projects.json` — local seed input used only by the seed script. Do not commit or push changes to this file.

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

To seed or refresh the local MongoDB database from `backend/data/projects.json`, run `npm run seed` from `backend/`. The seed file is local input; do not commit or push changes to it. The application does not seed the production database on startup.

## Checks

Run the backend type check and unit tests:

```bash
cd backend
npm run check
```

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
- Confirm `GET /health` returns `200` and `GET /health/ready` returns `200` after MongoDB connects.
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
