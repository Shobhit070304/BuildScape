# BuildScape

Learn modern software engineering by building real-world projects phase by phase.

---

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS, `@react-oauth/google`
- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), JWT

---

## Status

### ✅ Phase 1: Frontend & UI
- Landing page with modern dark theme and curriculum overview
- Project library (`/projects`) with search and track/difficulty filters
- Interactive project workspace (`/projects/[slug]`) with phase-by-phase Markdown guidance, progress tracker, and local storage fallback

### ✅ Phase 2: Backend & Authentication
- **MongoDB Models:** `User`, `Project`, `Phase`, `UserProjectEnrollment`, `UserTaskProgress`
- **Google OAuth & JWT:** ID token verification, session JWTs, and protected routes
- **REST APIs:** Project listing, full project details, enrollment, and phase completion tracking
- **Frontend Sync:** Google login in Navbar and cloud progress saving with `useProgress`

---

## Quick Start

### 1. Environment Setup

**`backend/.env`**
```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**`frontend/.env`**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 2. Seed Database

```bash
cd backend
npm install
npm run seed
```

### 3. Run Development Servers

```bash
# Backend (http://localhost:4000)
cd backend
npm run dev

# Frontend (http://localhost:3000)
cd frontend
npm run dev
```

---

## API Summary

- `GET /health` — Health check
- `POST /api/auth/google` — Google OAuth login / registration
- `GET /api/auth/me` — Current user profile *(protected)*
- `GET /api/projects` — List all projects
- `GET /api/projects/:slug` — Project details & phases
- `POST /api/projects/:slug/enroll` — Enroll in project *(protected)*
- `POST /api/projects/:slug/phases/:phaseId/complete` — Mark phase complete *(protected)*
- `GET /api/projects/:slug/progress` — Get user progress *(protected)*
