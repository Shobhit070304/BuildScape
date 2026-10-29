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
ADMIN_EMAIL=admin@example.com
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
   - `ADMIN_EMAIL`: Google account email allowed to manage projects

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
| `GET` | `/health/ready` | Database readiness probe (503 until MongoDB connects) | Public |
| `GET` | `/api/projects` | List all curated production builds | Public |
| `GET` | `/api/projects/:slug` | Full project details and phase blueprints | Public |
| `POST` | `/api/auth/google` | Google OAuth login and session JWT issuance | Public |
| `POST` | `/api/auth/logout` | Clear the current session | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Required |
| `PUT` | `/api/auth/username` | Change the authenticated user's public username | Required |
| `GET` | `/api/projects/my/enrolled` | List current user's enrolled projects | Required |
| `POST` | `/api/projects/:slug/enroll` | Enroll in a project | Required |
| `POST` | `/api/projects/:slug/verify` | Check a public GitHub repository and list its URL on the profile | Required |
| `GET` | `/api/projects/:slug/progress` | Get phase completion and repository link status | Required |
| `POST` | `/api/projects/:slug/phases/:phaseId/complete` | Mark an enrolled user's phase complete | Required |
| `DELETE` | `/api/projects/:slug/phases/:phaseId/complete` | Undo a phase checkbox while retaining earned completion and repository status | Required |
| `DELETE` | `/api/projects/:slug/progress` | Clear phase checkboxes and reset the active phase while preserving earned completion and repository status | Required |
| `GET` | `/api/users/:username` | Fetch a public developer profile | Public |
| `POST` | `/api/projects` | Create a project | Admin |
| `PUT` | `/api/projects/:slug` | Update a project | Admin |
| `DELETE` | `/api/projects/:slug` | Delete a project | Admin |

GitHub repository checks confirm only that the submitted repository is public and exists. They do not confirm repository ownership or inspect its contents.

Progress clearing and project deletion use MongoDB transactions, so the database must support transactions (MongoDB Atlas or a replica set).

Admins can manage curriculum at `/admin` after signing in with the Google account configured by `ADMIN_EMAIL`. Deleting a project permanently deletes its enrollments and phase progress after a confirmation prompt.
