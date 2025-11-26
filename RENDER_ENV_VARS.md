# How to Add Environment Variables in Render

This guide shows you exactly how to add environment variables to your Render backend service.

## Step-by-Step Instructions

### Step 1: Access Your Render Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Log in to your account
3. Click on your backend service (e.g., `gbv-backend`)

### Step 2: Navigate to Environment Tab

1. In your service dashboard, look for the tabs at the top:
   - **Settings**
   - **Environment** ← Click this tab
   - **Logs**
   - **Events**
   - etc.

2. Click on the **"Environment"** tab

### Step 3: Add Environment Variables

You'll see a section called **"Environment Variables"** with:
- A list of existing variables (if any)
- An **"Add Environment Variable"** button or **"Add Variable"** button

#### For each variable, follow these steps:

1. Click **"Add Environment Variable"** or **"Add Variable"**
2. A form will appear with two fields:
   - **Key** (or **Name**)
   - **Value**

3. Enter the variable one by one:

   **Variable 1: EMAIL_PROVIDER**
   - **Key:** `EMAIL_PROVIDER`
   - **Value:** `resend`
   - Click **"Save"** or **"Add"**

   **Variable 2: RESEND_API_KEY**
   - **Key:** `RESEND_API_KEY`
   - **Value:** `re_xxxxxxxxxxxxx` (replace with your actual Resend API key)
   - Click **"Save"** or **"Add"**

   **Variable 3: EMAIL_FROM**
   - **Key:** `EMAIL_FROM`
   - **Value:** `onboarding@resend.dev` (for testing - no verification needed)
   - **OR:** `noreply@yourdomain.com` (for production - domain must be verified in Resend)
   - **Format:** Must be a valid email: `email@domain.com` or `Name <email@domain.com>`
   - Click **"Save"** or **"Add"**

   **Variable 4: FRONTEND_URL**
   - **Key:** `FRONTEND_URL`
   - **Value:** `https://your-frontend-url.vercel.app` (replace with your actual Vercel URL)
   - Click **"Save"** or **"Add"**

### Step 4: Verify Variables

After adding all variables, you should see them listed in the Environment Variables section:
- ✅ EMAIL_PROVIDER = resend
- ✅ RESEND_API_KEY = re_xxxxxxxxxxxxx
- ✅ EMAIL_FROM = noreply@yourdomain.com
- ✅ FRONTEND_URL = https://your-frontend-url.vercel.app

### Step 5: Save and Redeploy

1. After adding all variables, Render may automatically trigger a redeploy
2. If not, you can manually trigger a redeploy:
   - Go to the **"Events"** or **"Manual Deploy"** tab
   - Click **"Deploy latest commit"** or **"Redeploy"**

### Step 6: Verify Configuration

After deployment, check the **"Logs"** tab. You should see:
```
📧 Email Provider: resend
📧 Sending confirmation email to: user@example.com
✅ Confirmation email sent via Resend
```

## Visual Guide

```
Render Dashboard
├── Your Service (gbv-backend)
    ├── Settings
    ├── Environment ← Click here
    │   ├── Environment Variables
    │   │   ├── [Add Environment Variable] ← Click to add
    │   │   │   ├── Key: EMAIL_PROVIDER
    │   │   │   ├── Value: resend
    │   │   │   └── [Save]
    │   │   ├── [Add Environment Variable]
    │   │   │   ├── Key: RESEND_API_KEY
    │   │   │   ├── Value: re_xxxxxxxxxxxxx
    │   │   │   └── [Save]
    │   │   └── ... (repeat for each variable)
    ├── Logs
    └── Events
```

## Important Notes

### Getting Your Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to **API Keys** in the dashboard
3. Click **"Create API Key"**
4. Copy the key (starts with `re_`)
5. Paste it as the value for `RESEND_API_KEY`

### Email From Address

- For Resend, you need to verify your domain first
- Or use Resend's test domain: `onboarding@resend.dev` (for testing only)
- In production, use: `noreply@yourdomain.com` (after domain verification)

### Frontend URL

- This should be your Vercel deployment URL
- Example: `https://nchekwa-afrika.vercel.app`
- Make sure it matches your actual Vercel frontend URL

## Troubleshooting

### Variables Not Showing Up

- Make sure you clicked **"Save"** after entering each variable
- Refresh the page and check again
- Variables are case-sensitive: `EMAIL_PROVIDER` not `email_provider`

### Changes Not Taking Effect

- Render needs to redeploy for environment variable changes to take effect
- Check the **"Events"** tab to see if a redeploy was triggered
- You may need to manually trigger a redeploy

### Still Using Console Mode

- Check that `EMAIL_PROVIDER=resend` (not `console`)
- Verify `RESEND_API_KEY` is set correctly
- Check server logs for configuration messages

## Example: Complete Environment Variables List

For a complete Render backend setup, you should have:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
ENCRYPTION_KEY=your-32-character-encryption-key
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=https://your-frontend-url.vercel.app
```

## Quick Copy-Paste Format

When adding variables in Render, use this format:

**Key:** `EMAIL_PROVIDER`  
**Value:** `resend`

**Key:** `RESEND_API_KEY`  
**Value:** `re_xxxxxxxxxxxxx`

**Key:** `EMAIL_FROM`  
**Value:** `noreply@yourdomain.com`

**Key:** `FRONTEND_URL`  
**Value:** `https://your-frontend-url.vercel.app`

---

**Note:** After adding environment variables, Render will automatically redeploy your service. Wait for the deployment to complete, then test email sending.

