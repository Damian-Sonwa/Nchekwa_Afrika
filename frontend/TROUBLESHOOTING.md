# Troubleshooting Guide

## Common Issues

### 1. Icon Import Errors

**Error:** `The requested module doesn't provide an export named: 'Exit'`

**Solution:** `Exit` is not a valid export from `lucide-react`. Use `LogOut` instead.

**Fixed in:**
- `frontend/src/pages/Onboarding.jsx` - Changed `Exit` to `LogOut`

### 2. Blank Screen / Module Errors

If you see a blank screen, check:

1. **Browser Console** - Look for import/export errors
2. **Terminal** - Check for build errors
3. **Dependencies** - Make sure all packages are installed:
   ```bash
   cd frontend
   npm install
   ```

### 3. API Connection Issues

If the frontend can't connect to the backend:

1. **Check backend is running:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Check API URL in frontend:**
   - Default: `http://localhost:3000/api`
   - Can be set in `.env` file: `VITE_API_URL=http://localhost:3000/api`

### 4. MongoDB Connection Issues

If backend can't connect to MongoDB:

1. **Check .env file:**
   ```bash
   cd backend
   cat .env
   ```

2. **Verify connection:**
   ```bash
   node scripts/forceTestConnection.js
   ```

### 5. Port Already in Use

If you get "port already in use" error:

1. **Change port in .env:**
   ```
   PORT=3001
   ```

2. **Or kill the process:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

## Valid Lucide React Icons

Common icons used in this app:
- `Shield`, `Lock`, `Heart`, `LogOut`
- `Home`, `MessageSquare`, `BookOpen`, `Settings`
- `AlertCircle`, `Phone`, `MapPin`, `Search`
- `Plus`, `Trash2`, `Save`, `CheckCircle`
- `Send`, `Upload`, `File`, `Image`

For full list: https://lucide.dev/icons/


