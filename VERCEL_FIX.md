# Fix Vercel Environment Variables

## Issue
Your frontend is getting 404 errors because the API URL is missing `/api`.

## Quick Fix

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`nchekwa-afrika` or your project name)
3. Go to **Settings** → **Environment Variables**
4. Find `VITE_API_URL` and update it to:
   ```
   https://nchekwa-afrika.onrender.com/api
   ```
   ⚠️ **Make sure it ends with `/api`!**

5. Also check `VITE_SOCKET_URL` is set to:
   ```
   https://nchekwa-afrika.onrender.com
   ```
   (This one should NOT have `/api`)

6. After updating, go to **Deployments** tab
7. Click the **"..."** menu on the latest deployment
8. Click **"Redeploy"** to apply the new environment variables

## Verify

After redeployment, check the browser console. You should see:
- `📡 API URL: https://nchekwa-afrika.onrender.com/api` (with `/api` at the end)

If you still see it without `/api`, the environment variable wasn't updated correctly.

