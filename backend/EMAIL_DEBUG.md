# Email Debugging Guide

If users are not receiving confirmation or password reset emails, follow these steps to diagnose and fix the issue.

## Step 1: Check Email Configuration

Visit the test endpoint to verify your email configuration:

```
GET https://your-backend-url.onrender.com/api/auth/test-email
```

This will show you:
- Which email provider is configured
- Whether API keys are set
- Whether required environment variables are present

## Step 2: Test Email Sending

Test actual email sending by adding your email to the test endpoint:

```
GET https://your-backend-url.onrender.com/api/auth/test-email?testEmail=your@email.com
```

This will:
- Attempt to send a test email
- Show any errors that occur
- Help identify configuration issues

## Step 3: Check Render Logs

1. Go to your Render dashboard
2. Click on your backend service
3. Click the **"Logs"** tab
4. Look for email-related log messages when a user registers or requests a password reset

### What to Look For:

**✅ Good Signs:**
```
📧 Email Provider: sendgrid
📧 Sending confirmation email to: user@example.com
📧 From: noreply@nchekwaafrika.com
✅ Confirmation email sent via SendGrid
```

**❌ Bad Signs:**
```
⚠️  SENDGRID_API_KEY not set, falling back to console
💡 Using console mode - emails will be logged only
❌ SendGrid API error: ...
❌ Failed to send email via SendGrid: ...
```

## Step 4: Verify Environment Variables in Render

Make sure all these variables are set correctly in Render:

1. Go to your Render service → **Environment** tab
2. Verify these variables exist and have correct values:

```
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@nchekwaafrika.com
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Common Issues:

**Issue 1: EMAIL_PROVIDER not set or set to "console"**
- **Symptom:** Logs show "Using console mode"
- **Fix:** Set `EMAIL_PROVIDER=sendgrid` in Render

**Issue 2: SENDGRID_API_KEY missing or incorrect**
- **Symptom:** Logs show "SENDGRID_API_KEY not set, falling back to console"
- **Fix:** 
  1. Get your API key from [SendGrid Dashboard](https://app.sendgrid.com/settings/api_keys)
  2. Set `SENDGRID_API_KEY=SG.xxxxxxxxxxxxx` in Render

**Issue 3: EMAIL_FROM not verified**
- **Symptom:** SendGrid API returns error about unverified sender
- **Fix:** 
  - Verify your sender email in SendGrid dashboard (Settings → Sender Authentication)
  - For testing: Use a verified single sender email
  - For production: Verify your domain and use `noreply@yourdomain.com`

**Issue 4: FRONTEND_URL incorrect**
- **Symptom:** Links in emails point to wrong URL
- **Fix:** Set `FRONTEND_URL` to your actual Vercel frontend URL

## Step 5: Check SendGrid Dashboard

1. Go to [SendGrid Dashboard](https://app.sendgrid.com)
2. Navigate to **Activity** → **Email Activity**
3. Look for:
   - Failed emails (red status)
   - Error messages
   - Delivery status
   - Bounce/spam reports

## Step 6: Common Error Messages and Solutions

### Error: "Invalid API key" or "Unauthorized"
- **Cause:** SENDGRID_API_KEY is incorrect or expired
- **Fix:** Generate a new API key in SendGrid and update it in Render

### Error: "Sender email not verified" or "The from address does not match a verified Sender Identity"
- **Cause:** EMAIL_FROM is not verified in SendGrid
- **Fix:** 
  - Go to SendGrid → Settings → Sender Authentication
  - Verify a Single Sender (for testing) or Authenticate Your Domain (for production)
  - Use the verified email address as EMAIL_FROM

### Error: "Rate limit exceeded"
- **Cause:** Too many emails sent (free tier: 100/day)
- **Fix:** Wait until the next day or upgrade your SendGrid plan

### Error: "Email address is invalid"
- **Cause:** The recipient email address is malformed
- **Fix:** Validate email addresses before sending

## Step 7: Verify Email is Actually Being Called

Check the logs when a user registers:

1. User registers → Check logs for:
   ```
   📧 Email Provider: sendgrid
   📧 Sending confirmation email to: user@example.com
   ```

2. If you see "Using console mode" instead:
   - EMAIL_PROVIDER is not set to "sendgrid"
   - Check Render environment variables

3. If you see errors:
   - Check the error message
   - Verify API key and configuration
   - Check SendGrid dashboard for delivery status

## Step 8: Test the Full Flow

1. **Register a new user:**
   ```
   POST /api/auth/register
   {
     "email": "test@example.com",
     "password": "testpassword123"
   }
   ```

2. **Check logs** for email sending attempt

3. **Check SendGrid dashboard** for email delivery status

4. **Check email inbox** (and spam folder)

## Step 9: Enable Detailed Logging

The code now includes comprehensive logging. When emails fail, you'll see:
- Error message
- Error stack trace
- Configuration status
- API response details

## Still Not Working?

If emails still aren't being sent after following these steps:

1. **Check Render Logs** for any error messages
2. **Verify SendGrid API Key** is active in SendGrid dashboard
3. **Verify sender email** in SendGrid dashboard (Settings → Sender Authentication)
4. **Check SendGrid Dashboard** for delivery status and errors
5. **Verify FRONTEND_URL** matches your actual frontend URL
6. **Try the test endpoint:** `/api/auth/test-email?testEmail=your@email.com`

## Quick Checklist

- [ ] EMAIL_PROVIDER is set to "sendgrid" in Render
- [ ] SENDGRID_API_KEY is set and correct in Render
- [ ] EMAIL_FROM is set to a verified sender email
- [ ] FRONTEND_URL is set to your actual frontend URL
- [ ] SendGrid API key is active in SendGrid dashboard
- [ ] Sender email is verified in SendGrid (Settings → Sender Authentication)
- [ ] Logs show "Email Provider: sendgrid" (not "console")
- [ ] Logs show "✅ Confirmation email sent via SendGrid"
- [ ] Check SendGrid dashboard for email delivery status
- [ ] Check spam folder in email inbox

## Support

If you continue to have issues:
1. Check Render logs for specific error messages
2. Check SendGrid dashboard for delivery status
3. Verify all environment variables are set correctly
4. Test with the `/api/auth/test-email` endpoint
5. Verify sender authentication in SendGrid dashboard
