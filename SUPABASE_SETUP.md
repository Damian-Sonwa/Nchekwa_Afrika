# Supabase Authentication Setup Guide

This guide will help you set up Supabase OAuth, email confirmation, and password reset for the Auth page.

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project or use an existing one

## 🔧 Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: `nchekwa-afrika` (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait for project to be ready (2-3 minutes)

## 🔑 Step 2: Get API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## 🌐 Step 3: Configure OAuth Providers

### Google OAuth Setup

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Click on **Google**
3. Enable Google provider
4. You'll need to:
   - Create a Google OAuth app at [Google Cloud Console](https://console.cloud.google.com)
   - Get **Client ID** and **Client Secret**
   - Add authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
5. Paste Client ID and Client Secret in Supabase
6. Click **Save**

### Fingerprint Authentication Setup (Optional)

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Click on **Apple** (used as placeholder for Fingerprint authentication)
3. Enable Apple provider (used as placeholder for Fingerprint authentication)
4. Follow Fingerprint authentication setup instructions
5. Add redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`

## 📧 Step 4: Configure Email Settings

1. Go to **Authentication** → **Email Templates** in Supabase dashboard
2. Customize email templates if desired:
   - **Confirm signup** - Email confirmation template
   - **Reset password** - Password reset template
3. Go to **Settings** → **Auth**
4. Configure:
   - **Site URL**: Your frontend URL (e.g., `https://nchekwa-afrika.vercel.app`)
   - **Redirect URLs**: Add your frontend URL and auth callback URLs

## 🔐 Step 5: Set Environment Variables

### Frontend (Vercel)

Add these environment variables in your Vercel project settings:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:**
- Replace `your-project-ref` with your actual Supabase project reference
- Use the **anon/public** key (not the service_role key)
- These are safe to expose in frontend code

### Local Development

Create a `.env` file in the `frontend` directory:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ✅ Step 6: Configure Email Confirmation

1. Go to **Authentication** → **Settings** in Supabase dashboard
2. Under **Email Auth**:
   - ✅ Enable **"Enable email confirmations"**
   - ✅ Enable **"Secure email change"**
3. Set **Email confirmation expiry** (default: 24 hours)
4. Configure **SMTP settings** (optional, uses Supabase's default email service)

## 🔄 Step 7: Configure Redirect URLs

In Supabase dashboard → **Authentication** → **URL Configuration**:

1. **Site URL**: `https://your-frontend-url.vercel.app`
2. **Redirect URLs**: Add:
   ```
   https://your-frontend-url.vercel.app/auth
   https://your-frontend-url.vercel.app/auth?verified=true
   https://your-frontend-url.vercel.app/auth?reset=true
   https://your-frontend-url.vercel.app/auth?oauth=true
   ```

## 🧪 Step 8: Test the Integration

### Test Email/Password Signup

1. Go to your Auth page
2. Click **"Sign up"**
3. Enter email and password
4. Check your email for confirmation link
5. Click the confirmation link
6. Should see: "Your email is verified! Welcome to Nchekwa Afrika!"
7. User should be redirected to `/user-details`

### Test Email/Password Login

1. Go to Auth page
2. Enter verified email and password
3. Should see: "Welcome back!"
4. User should be redirected to `/app` or `/user-details`

### Test Google OAuth

1. Go to Auth page
2. Click **"Google"** button
3. Complete Google OAuth flow
4. Should be redirected back and logged in automatically
5. No email confirmation needed for OAuth

### Test Password Reset

1. Go to Auth page
2. Click **"Forgot password?"**
3. Enter email address
4. Check email for reset link
5. Click reset link
6. Enter new password
7. Should see: "Your password has been updated successfully!"
8. Can now login with new password

## 🐛 Troubleshooting

### "Invalid API key" Error

- ✅ Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
- ✅ Verify you're using the **anon/public** key, not service_role key
- ✅ Ensure environment variables are set in Vercel (not just local .env)

### "Email not confirmed" Error

- ✅ Check that email confirmation is enabled in Supabase
- ✅ Verify user clicked the confirmation link in their email
- ✅ Check spam folder if email not received
- ✅ Verify redirect URLs are configured correctly

### OAuth Not Working

- ✅ Verify OAuth provider is enabled in Supabase dashboard
- ✅ Check that redirect URI is added to both Supabase and OAuth provider (Google/Fingerprint)
- ✅ Ensure redirect URI matches exactly: `https://your-project-ref.supabase.co/auth/v1/callback`

### Password Reset Not Working

- ✅ Verify email is sent (check Supabase logs)
- ✅ Check that redirect URL is configured correctly
- ✅ Ensure user clicks the link within the expiry time (default: 1 hour)

### "Invalid or expired reset token"

- ✅ Token expires after 1 hour (default)
- ✅ Token can only be used once
- ✅ User must request a new reset link if token expired

## 📝 Important Notes

1. **MongoDB Still Used**: The rest of the app (user profiles, settings, data) still uses MongoDB. Only authentication on the Auth page uses Supabase.

2. **Session Management**: Supabase sessions are stored in localStorage and managed automatically. The app uses Supabase user ID as `anonymousId` for compatibility.

3. **Email Service**: Supabase uses its built-in email service by default. You can configure custom SMTP in Supabase settings if needed.

4. **Security**: The `anon` key is safe to expose in frontend code. Never expose the `service_role` key.

5. **Rate Limits**: Supabase free tier includes:
   - 50,000 monthly active users
   - Unlimited email sends
   - 500MB database storage

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase OAuth Setup](https://supabase.com/docs/guides/auth/social-login)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)

## ✅ Checklist

Before going live:

- [ ] Supabase project created
- [ ] API keys copied and added to Vercel environment variables
- [ ] Google OAuth configured (if using)
- [ ] Email confirmation enabled
- [ ] Redirect URLs configured
- [ ] Site URL set in Supabase
- [ ] Tested email/password signup
- [ ] Tested email/password login
- [ ] Tested Google OAuth (if using)
- [ ] Tested password reset
- [ ] Verified email templates look good
- [ ] Checked spam folder for test emails

---

**Need Help?** Check Supabase dashboard logs for detailed error messages and authentication activity.

