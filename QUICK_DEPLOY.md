# Quick Deployment Guide

## Quick Steps

### 1. Backend (Render) - 5 minutes

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. New → Web Service → Connect GitHub repo
4. Settings:
   - **Root Directory**: `backend` ⚠️ **CRITICAL: Must set this!**
   - **Build Command**: `npm install` (or leave empty)
   - **Start Command**: `npm start` (or leave empty)
5. Add environment variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your-mongodb-uri
   JWT_SECRET=your-jwt-secret-32-chars-min
   ENCRYPTION_KEY=exactly-32-characters-long
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```
6. Deploy and copy backend URL

### 2. Frontend (Vercel) - 5 minutes

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Add New Project → Import GitHub repo
3. Settings:
   - **Root Directory**: `frontend`
   - **Framework**: Vite (auto-detected)
4. Add environment variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```
5. Deploy and copy frontend URL

### 3. Update Backend CORS

1. Go back to Render
2. Update `ALLOWED_ORIGINS` with your Vercel URL
3. Redeploy

## Done! 🎉

Your app is now live at your Vercel URL.

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

