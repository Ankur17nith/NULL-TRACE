# NULL//TRACE

> Tactical Cyber-Forensics & Network Investigation Simulator

NULL//TRACE is an immersive cyber-investigation simulator blending authentic terminal operations, live topological network mapping, forensic artifact analysis, and tactical incident response.

---

## Architecture Overview

- **Frontend (`/`)**: React 19 + Vite + Zustand + GSAP + Vanilla CSS cyber aesthetic.
- **Backend (`/backend`)**: Express.js + Mongoose (MongoDB Atlas) production API for health monitoring and global operator leaderboards.

---

## Local Development

### 1. Run Frontend
```bash
npm install
npm run dev
```
The client will start at `http://localhost:5173`.

### 2. Run Backend
```bash
cd backend
npm install
npm run dev
```
The server will start on port `5000` (or `process.env.PORT`) binding to `0.0.0.0`.

Verify health endpoint:
```bash
curl http://localhost:5000/health
```

---

## Deploy Backend to Render

Follow these steps to deploy the NULL//TRACE API backend to **Render Web Services**:

### 1. Create Render Web Service
- Sign in to the [Render Dashboard](https://dashboard.render.com/).
- Click **New +** > **Web Service**.

### 2. Connect GitHub Repository
- Connect your GitHub account and select your `NULL-TRACE` repository.

### 3. Select Correct Root Directory
Set the **Root Directory** to:
```text
backend
```

### 4. Build Command
Set the **Build Command** to:
```bash
npm install
```
*(or `npm ci`)*

### 5. Start Command
Set the **Start Command** to:
```bash
npm start
```

### 6. Environment Variables
Under the **Environment Variables** section in Render, configure:
```env
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
MONGO_URI=YOUR_MONGODB_ATLAS_URI
JWT_SECRET=YOUR_SECRET
```
> **Note:** Render sets `PORT` automatically; the server dynamically binds to `process.env.PORT || 5000` on `0.0.0.0`.

### 7. Health Check Path
In Render's **Advanced Settings**, set the **Health Check Path** to:
```text
/health
```

### 8. Deploy
- Click **Create Web Service**.
- Render will install dependencies and execute `npm start`.

### 9. Test /health
Once deployed, verify the endpoint in your browser or via curl:
```bash
curl https://YOUR-RENDER-SERVICE.onrender.com/health
```
Expected response:
```json
{
  "status": "ok",
  "service": "NULL//TRACE API",
  "environment": "production",
  "database": "connected",
  "timestamp": "..."
}
```

### 10. Configure Frontend Vercel Environment Variable
When deploying the frontend to **Vercel** (Root directory: `.`, Build command: `npm run build`, Output directory: `dist`), add the following environment variable in the Vercel dashboard:
```env
VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com
```

---

## Production Security & Deployment Checklist

- [x] Backend dynamically binds to `process.env.PORT` on `0.0.0.0`.
- [x] Public unauthenticated `GET /health` endpoint for uptime monitoring.
- [x] Strict CORS supporting local dev (`http://localhost:5173`) and production `FRONTEND_URL`.
- [x] MongoDB Atlas connection via `process.env.MONGO_URI` with graceful degraded mode.
- [x] In-memory fallback if MongoDB connection is pending or unreachable.
- [x] No sensitive credentials or `.env` files committed.
- [x] Frontend dynamically utilizes `VITE_API_URL` without hardcoded localhost URLs.
