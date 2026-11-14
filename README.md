# BuildScape — Production Systems Engineering Platform

BuildScape is an architecture-first platform designed to help engineers escape tutorial hell. Learners construct real-world distributed systems (in-memory cache engines, container runtimes, concurrent HTTP servers, event streams, and AI inference pipelines) backed by automated milestone verification, phase-aware AI tutoring, and verifiable proof-of-work portfolios.

---

## 🌟 Core Feature Suite

### 1. 🎯 Track-Based Guided Engineering (`/tracks/[track]`)
* Dedicated curriculums for **Golang**, **TypeScript**, **Python**, **Spring Boot**, **Rust**, and **React**.
* Consistent 3-tier difficulty levels: **Beginner**, **Intermediate**, and **Advanced**.
* Full-height smooth hover sidebar slider rail for instant track switching.
* Clear visual progress tracking across enrolled milestones.

### 2. 🔐 Sleek Two-Sided Google OAuth (`/login` & `/auth`)
* Dedicated distraction-free split auth experience matching top-tier SaaS design.
* Pure Google OAuth (no passwords, instant 1-click token exchange, and automatic redirect to target workspace).
* Left column: Minimal greeting, Google sign-in button, and value propositions.
* Right column: Interactive distributed systems constellation connecting the BuildScape Core Engine with live technology nodes.

### 3. 📈 GitHub-Style Activity Heatmap & Coding Streak
* 365-day visual activity calendar aggregated from real milestone completions, task progress, enrollments, and community discussions.
* Live calculation of **Current Streak** and **Longest Streak** with timezone normalization.
* Integrated into both the private workspace dashboard (`/profile`) and public developer profiles (`/profile/[username]`).

### 4. ⭐ Global Product Reviews & Rating Wall (`/api/reviews`)
* Verified community reviews featuring flat, clean un-glowing stars and authentic builder comments.
* Full CRUD support with Redis caching: authenticated users can submit, view, edit, and delete their platform review directly from their profile page.

### 5. 🔍 Interactive Architecture Diagram Viewer
* Interactive lightbox viewer for system architecture diagrams powered by Mermaid.
* Smooth mouse wheel zoom, click-and-drag panning, fit-to-screen reset, 2x retina PNG export, and vector SVG copy.

### 6. 🔖 "Save to Build" Bookmarking & Learning Queue
* One-click project bookmarking from any project card or catalog filter.
* Populated with full project metadata (title, track, difficulty level, estimated hours) in the personal profile queue.

### 7. ⚡ Upstash Redis High-Performance Caching
* Cache-aside strategy for public project catalogs, global review lists, and platform statistics.
* Instant cache invalidation on administrative updates, submissions, and deletes.

---

## 🏗️ Project Architecture

```
Buildscape/
├── frontend/                     # Next.js 16 (App Router) + React 19 + Tailwind CSS
│   ├── app/
│   │   ├── login/                # Split-screen Google OAuth page
│   │   ├── projects/             # Projects catalog with full-page track slider rail
│   │   ├── tracks/[track]/       # Dedicated curriculum & roadmap pages per stack
│   │   ├── profile/              # Developer workspace, activity heatmap & review editor
│   │   ├── profile/[username]/   # Public verifiable developer profile
│   │   ├── verify/[id]/          # Official verifiable certificate verification
│   │   ├── discussions/          # Community technical discussions & accepted solutions
│   │   ├── blog/                 # Architectural notes & engineering write-ups
│   │   └── admin/                # Curriculum & issue administration
│   ├── components/               # Modular UI components (Heatmap, Lightbox, PhaseViewer)
│   ├── context/                  # AuthContext (session state & saved projects)
│   └── lib/                      # API client, track metadata & utilities
│
└── backend/                      # Node.js + Express + TypeScript + MongoDB + Upstash Redis
    ├── src/
    │   ├── config/               # Database, Redis, and environment validation
    │   ├── controllers/          # Request handling (Auth, Projects, Reviews, Users)
    │   ├── middleware/           # JWT authentication, CSRF protection, error handling
    │   ├── models/               # Mongoose schemas (User, Project, Review, Enrollment)
    │   ├── services/             # Core business logic, verification & Redis caching
    │   └── scripts/              # Seed scripts & data migrations
    └── data/                     # Project markdown blueprints (README_1.md - README_7.md)
```

---

## 🚀 Quickstart & Local Development

### Prerequisites
* **Node.js**: v20 or newer
* **MongoDB**: Atlas or local replica set deployment
* **Google OAuth Credentials**: Web Client ID from Google Cloud Console
* **Upstash Redis** *(Optional in dev, required for caching/assistant in prod)*

### 1. Backend Setup
```bash
cd backend
cp .env.example .env     # Fill in MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID
npm install
npm run dev              # Starts Express API on http://localhost:4000
```

### 2. Frontend Setup
```bash
cd frontend
cp .env.local.example .env.local  # Fill in NEXT_PUBLIC_API_URL, NEXT_PUBLIC_GOOGLE_CLIENT_ID
npm install
npm run dev                       # Starts Next.js on http://localhost:3000
```

---

## 🧪 Verification & Type Safety

To verify the codebase at any time, run:

```bash
# Frontend type check & linter
cd frontend
npx tsc --noEmit
npm run lint

# Backend type check
cd backend
npm run lint
```

---

## 📄 License
ISC © BuildScape Team
