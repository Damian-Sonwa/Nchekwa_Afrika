# Fix: Email Confirmation Links Using Localhost Instead of Vercel URL

## Problem
Email confirmation links are using `localhost:3000` instead of `https://nchekwa-afrika.vercel.app`, causing "This site can't be reached" errors.

## Root Cause
Supabase uses its **Site URL** setting as the base for email confirmation links, even if you pass `emailRedirectTo` in the signup options. If the Site URL is set to `http://localhost:3000`, that's what will be used in the email links.

## Solution: Update Supabase Site URL

### Step 1: Go to Supabase Dashboard
1. Log in to [supabase.com](https://supabase.com)
2. Select your project: `nchekwa-afrika` (or your project name)

### Step 2: Update Site URL
1. Navigate to **Authentication** → **URL Configuration**
2. Find the **Site URL** field
3. Change it from `http://localhost:3000` to:
   ```
   https://nchekwa-afrika.vercel.app
   ```
4. Click **Save**

### Step 3: Update Redirect URLs
In the same **URL Configuration** section, under **Redirect URLs**, ensure you have:
```
https://nchekwa-afrika.vercel.app/auth
https://nchekwa-afrika.vercel.app/auth?verified=true
https://nchekwa-afrika.vercel.app/auth?reset=true
https://nchekwa-afrika.vercel.app/auth?oauth=true
```

**Important:** Remove `http://localhost:3000` from redirect URLs if you don't need it for local development.

### Step 4: Verify Email Templates
1. Go to **Authentication** → **Email Templates**
2. Click on **"Confirm signup"** template
3. Verify the template includes: `{{ .ConfirmationURL }}`
4. The confirmation URL will now use your Site URL as the base

## Why This Happens

Supabase constructs email confirmation links like this:
```
{Site URL}/auth/v1/verify?token=...&type=signup&redirect_to={emailRedirectTo}
```

Even though we pass `emailRedirectTo: https://nchekwa-afrika.vercel.app/auth?verified=true`, Supabase still uses the Site URL as the base domain. If Site URL is `localhost:3000`, the link becomes:
```
http://localhost:3000/auth/v1/verify?token=...&redirect_to=https://nchekwa-afrika.vercel.app/auth?verified=true
```

This causes the "site can't be reached" error because localhost isn't accessible from email clients.

## After Fixing

1. **Test the fix:**
   - Sign up with a new email
   - Check the confirmation email
   - The link should now start with `https://nchekwa-afrika.vercel.app`

2. **Verify in console:**
   - When signing up, check browser console
   - You should see: `✅ Using production URL for email confirmation: https://nchekwa-afrika.vercel.app`

3. **Test the confirmation link:**
   - Click the link in the email
   - Should redirect to: `https://nchekwa-afrika.vercel.app/auth?verified=true`
   - Should not show "site can't be reached" error

## For Local Development

If you need to test locally:
1. Keep Site URL as `https://nchekwa-afrika.vercel.app` (production URL)
2. Add `http://localhost:3000/auth` to Redirect URLs for local testing
3. Email links will still use production URL (which is correct - emails are opened from any device)

## Quick Checklist

- [ ] Site URL set to `https://nchekwa-afrika.vercel.app`
- [ ] Redirect URLs include production URLs
- [ ] Email templates configured correctly
- [ ] Tested signup and received email
- [ ] Confirmation link works (no localhost error)

---

**Note:** After changing the Site URL, existing users who haven't confirmed their email will need to request a new confirmation email, as the old links will still point to localhost.

