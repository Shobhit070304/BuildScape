# BuildScape

> Master modern software engineering by building real-world distributed systems and production architectures phase by phase.

---

## ⚡ Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, TypeScript
- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, Google OAuth

---

## 🚀 Quick Start (Local Development)

### 1. Environment Configuration

Create `backend/.env` from `backend/.env.example` and `frontend/.env.local` from `frontend/.env.local.example`:

**`backend/.env`**
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_min_32_chars
CORS_ORIGIN=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GEMINI_API_KEY=your_server_side_gemini_key
GEMINI_MODEL=your_gemini_model_id
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

The project AI guide uses Google’s official Gemini SDK. Set `GEMINI_API_KEY` and `GEMINI_MODEL` on the backend. Keep the API key server-side; do not add it to a `NEXT_PUBLIC_` variable.

### 2. Install & Run

```bash
# Terminal 1 — Backend (http://localhost:4000)
cd backend
npm install
npm run dev

# Terminal 2 — Frontend (http://localhost:3000)
cd frontend
npm install
npm run dev
```

### Project catalog source

`backend/data/projects.json` is the only project catalog. The API validates and syncs it to MongoDB when the backend starts; MongoDB stores enrollment and phase progress. Keep projects phase-based and use only Beginner, Intermediate, or Expert difficulty. Restart the backend after editing the catalog; the frontend cache refreshes within five minutes. To sync it manually:

```bash
cd backend
npm run seed
```

---

## 🚢 Deployment Guide

### Deploy Backend (Render / Railway / Fly.io)

1. Connect your repository and set the **Root Directory** to `backend`.
2. Configure build & start commands:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
3. Add Environment Variables:
   - `PORT`: `4000` (or leave default assigned by platform)
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas connection URI
   - `JWT_SECRET`: Random 32+ character string
   - `CORS_ORIGIN`: Your deployed frontend URL (e.g. `https://your-app.vercel.app`)
   - `GOOGLE_CLIENT_ID`: Google OAuth Client ID
   - `GEMINI_API_KEY`: Server-side Gemini API key for project AI help
   - `GEMINI_MODEL`: Gemini model identifier
   - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`: Required when enabling project AI in production. These provide a shared per-account rate limit across backend instances; project caching also uses them when configured.

### Deploy Frontend (Vercel)

1. Import your repository into Vercel and select `frontend` as the **Root Directory**.
2. Framework preset will automatically be set to **Next.js**.
3. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL (e.g. `https://your-backend.onrender.com`)
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth Client ID

---

## 📡 API Reference

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | API and MongoDB readiness probe | Public |
| `GET` | `/api/projects` | List all curated production builds | Public |
| `GET` | `/api/projects/:slug` | Full project details and phase blueprints | Public |
| `POST` | `/api/auth/google` | Google OAuth login and HTTP-only session cookie | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Required |
| `GET` | `/api/projects/my/enrolled` | List current user's enrolled projects | Required |
| `POST` | `/api/projects/:slug/enroll` | Enroll in a project | Required |
| `GET` | `/api/projects/:slug/progress` | Get phase completion status | Required |
| `DELETE` | `/api/projects/:slug/progress` | Clear completed phases and reset the current phase | Required |
| `POST` | `/api/projects/:slug/ai-help` | Project and phase scoped AI help (12 requests per 10 minutes) | Enrolled user |
| `POST` | `/api/projects/:slug/phases/:id/complete` | Mark a phase completed (requires enrollment) | Required |
| `DELETE` | `/api/projects/:slug/phases/:id/complete` | Mark a phase incomplete | Required |
| `PUT` | `/api/projects/:slug/phases/:id/current` | Save the current phase | Required |
| `GET` | `/api/projects/my/bookmarks` | List saved projects | Required |
| `PUT` / `DELETE` | `/api/projects/:slug/bookmark` | Add or remove a saved project | Required |
| `GET` / `PUT` | `/api/projects/:slug/notes` | Read or save private project notes | Required |
`JWT_SECRET` must be a non-placeholder secret with at least 32 characters in production. The API requires `MONGODB_URI` and `GOOGLE_CLIENT_ID` in production.
