# BuildScape

> Master modern software engineering by building real-world distributed systems and production architectures phase by phase.

---

## ⚡ Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, TypeScript
- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, Google OAuth

---

## 🚀 Quick Start (Local Development)

### 1. Environment Configuration

Create `.env` in both folders:

**`backend/.env`**
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_min_32_chars
CORS_ORIGIN=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

**`frontend/.env`**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

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

### 3. Seed Database (Optional)

To seed or refresh the 17 curated production projects into MongoDB:

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
| `GET` | `/health` | Health and liveness probe | Public |
| `GET` | `/api/projects` | List all curated production builds | Public |
| `GET` | `/api/projects/:slug` | Full project details and phase blueprints | Public |
| `POST` | `/api/auth/google` | Google OAuth login and session JWT issuance | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Required |
| `GET` | `/api/projects/my/enrolled` | List current user's enrolled projects | Required |
| `POST` | `/api/projects/:slug/enroll` | Enroll in a project | Required |
| `GET` | `/api/projects/:slug/progress` | Get phase completion status | Required |
| `POST` | `/api/projects/:slug/phases/:id/complete` | Mark a phase completed and grant XP | Required |
