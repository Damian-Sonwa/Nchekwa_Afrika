# Deployment Guide

This guide will help you deploy the GBV App to Vercel (frontend) and Render (backend).

## Prerequisites

- GitHub account (for connecting repositories)
- Vercel account (free tier available)
- Render account (free tier available)
- MongoDB Atlas account (or your MongoDB connection string)

## Architecture

- **Frontend**: React + Vite app deployed on Vercel
- **Backend**: Node.js + Express API deployed on Render
- **Database**: MongoDB Atlas (cloud database)

## Part 1: Deploy Backend to Render

### Step 1: Push Code to GitHub

1. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub and push:
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `gbv-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Root Directory**: `backend` ⚠️ **IMPORTANT: Set this!**
   - **Build Command**: `npm install` (or leave empty, it will auto-detect)
   - **Start Command**: `npm start` (or leave empty, it will use package.json)
   - **Plan**: Choose **Starter** (free tier)

5. Add Environment Variables:
   Click on **"Environment"** tab and add:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   ENCRYPTION_KEY=your-32-character-encryption-key
   ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   ```

   **Important Notes:**
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a strong random string (minimum 32 characters)
   - `ENCRYPTION_KEY`: Must be exactly 32 characters
   - `ALLOWED_ORIGINS`: Will be your Vercel frontend URL (update after frontend deployment)

6. Click **"Create Web Service"**
7. Wait for deployment to complete
8. Copy your backend URL (e.g., `https://gbv-backend.onrender.com`)

### Step 3: Update Render Health Check

Render will automatically use the `/health` endpoint defined in `render.yaml`.

## Part 2: Deploy Frontend to Vercel

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

5. Add Environment Variables:
   Click on **"Environment Variables"** and add:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   VITE_SOCKET_URL=https://your-backend-url.onrender.com
   ```

   Replace `your-backend-url.onrender.com` with your actual Render backend URL.

6. Click **"Deploy"**
7. Wait for deployment to complete
8. Copy your frontend URL (e.g., `https://gbv-app.vercel.app`)

### Step 3: Update Backend CORS Settings

1. Go back to Render dashboard
2. Edit your backend service
3. Update the `ALLOWED_ORIGINS` environment variable:
   ```
   ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   ```
4. Save and redeploy

## Part 3: Alternative - Deploy via CLI

### Frontend (Vercel)

```bash
cd frontend
vercel login
vercel
```

Follow the prompts and add environment variables when asked.

### Backend (Render)

You can also use Render CLI:

```bash
npm install -g render-cli
render login
render deploy
```

## Environment Variables Summary

### Backend (Render)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `10000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key-32-chars-min` |
| `ENCRYPTION_KEY` | Data encryption key | `exactly-32-characters-long` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://gbv-app.vercel.app` |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://gbv-backend.onrender.com/api` |
| `VITE_SOCKET_URL` | WebSocket server URL | `https://gbv-backend.onrender.com` |

## Post-Deployment Checklist

- [ ] Backend deployed and accessible at `/health` endpoint
- [ ] Frontend deployed and accessible
- [ ] Environment variables set correctly
- [ ] CORS configured to allow frontend origin
- [ ] MongoDB connection working
- [ ] Test API endpoints from frontend
- [ ] Test WebSocket connections (chat feature)

## Troubleshooting

### Backend Issues

1. **MongoDB Connection Failed**
   - Verify `MONGODB_URI` is correct
   - Check MongoDB Atlas network access (allow all IPs or Render IPs)
   - Ensure database name is `gvp_app`

2. **CORS Errors**
   - Verify `ALLOWED_ORIGINS` includes your frontend URL
   - Check for trailing slashes
   - Ensure protocol matches (https)

3. **Port Issues**
   - Render automatically sets `PORT` environment variable
   - Your code should use `process.env.PORT || 3000`

### Frontend Issues

1. **API Connection Failed**
   - Verify `VITE_API_URL` is correct
   - Check backend is running and accessible
   - Test backend `/health` endpoint directly

2. **Build Errors**
   - Check Node.js version compatibility
   - Review build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`

### General Issues

1. **Environment Variables Not Working**
   - Restart services after adding variables
   - Verify variable names match exactly
   - Check for typos in values

2. **WebSocket Not Connecting**
   - Verify `VITE_SOCKET_URL` is set correctly
   - Check backend Socket.IO configuration
   - Ensure CORS allows WebSocket connections

## Custom Domain Setup

### Vercel (Frontend)

1. Go to project settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Render (Backend)

1. Go to service settings → Custom Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `ALLOWED_ORIGINS` to include custom domain

## Monitoring

- **Vercel**: Check deployment logs and analytics in dashboard
- **Render**: Monitor logs, metrics, and health checks in dashboard
- **MongoDB Atlas**: Monitor database performance and connections

## Security Notes

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use strong secrets** - Generate random strings for `JWT_SECRET` and `ENCRYPTION_KEY`
3. **Restrict MongoDB access** - Use IP whitelisting in MongoDB Atlas
4. **Enable HTTPS** - Both Vercel and Render provide HTTPS by default
5. **Regular updates** - Keep dependencies updated for security patches

## Cost Considerations

- **Vercel**: Free tier includes generous limits for personal projects
- **Render**: Free tier available but services may spin down after inactivity
- **MongoDB Atlas**: Free tier (M0) available with 512MB storage

## Support

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/

