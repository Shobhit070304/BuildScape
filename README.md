# BuildScape

Learn modern software engineering by building real-world projects phase by phase.

---

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS, `@react-oauth/google`
- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), JWT

---

## Status

### ✅ Phase 1: Frontend & UI
- Landing page with modern dark theme and curriculum overview
- Project library (`/projects`) with search and track/difficulty filters
- Project overview page (`/projects/[slug]`) with full curriculum roadmap and sticky enrollment box
- Interactive workspace window (`/projects/[slug]/workspace`) with phase-by-phase Markdown guidance, progress tracker, and local storage fallback
- User profile page (`/profile`) tracking enrolled projects and completion progress

### ✅ Phase 2: Backend & Authentication
- **MongoDB Models:** `User`, `Project`, `Phase`, `UserProjectEnrollment`, `UserTaskProgress`
- **Google OAuth & JWT:** ID token verification, session JWTs, and protected routes
- **REST APIs:** Project listing, full project details, enrollment, phase completion, and enrolled projects tracking
- **Frontend Sync:** Google login in Navbar, cloud progress saving with `useProgress`, and clear one-click logout
- **Backend structure:** Routes → controllers → services → repositories → Mongoose models
- **Project content:** `frontend/data/projects.json` is the single source used for the frontend fallback and explicit database seeding

---

## Quick Start

### 1. Environment Setup

**`backend/.env`**
```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
```

**`frontend/.env`**
```env
API_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 2. Seed Database (optional)

The server never seeds or deletes project records at startup. Run this command when you intentionally want to upsert the curated project data:

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
- `GET /api/projects/my/enrolled` — Get user enrolled projects *(protected)*
- `GET /api/projects/:slug` — Project details & phases
- `POST /api/projects/:slug/enroll` — Enroll in project *(protected)*
- `POST /api/projects/:slug/phases/:phaseId/complete` — Mark phase complete *(protected)*
- `GET /api/projects/:slug/progress` — Get user progress *(protected)*
