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
📧 Email Provider: resend
📧 Sending confirmation email to: user@example.com
📧 From: noreply@yourdomain.com
✅ Confirmation email sent via Resend
✅ Email ID: abc123...
```

**❌ Bad Signs:**
```
⚠️  RESEND_API_KEY not set, falling back to console
💡 Using console mode - emails will be logged only
❌ Resend API error: ...
❌ Failed to send email via Resend: ...
```

## Step 4: Verify Environment Variables in Render

Make sure all these variables are set correctly in Render:

1. Go to your Render service → **Environment** tab
2. Verify these variables exist and have correct values:

```
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com (or onboarding@resend.dev for testing)
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Common Issues:

**Issue 1: EMAIL_PROVIDER not set or set to "console"**
- **Symptom:** Logs show "Using console mode"
- **Fix:** Set `EMAIL_PROVIDER=resend` in Render

**Issue 2: RESEND_API_KEY missing or incorrect**
- **Symptom:** Logs show "RESEND_API_KEY not set, falling back to console"
- **Fix:** 
  1. Get your API key from [Resend Dashboard](https://resend.com/api-keys)
  2. Set `RESEND_API_KEY=re_xxxxxxxxxxxxx` in Render

**Issue 3: EMAIL_FROM not verified**
- **Symptom:** Resend API returns error about unverified domain
- **Fix:** 
  - For testing: Use `onboarding@resend.dev` (no verification needed)
  - For production: Verify your domain in Resend and use `noreply@yourdomain.com`

**Issue 4: FRONTEND_URL incorrect**
- **Symptom:** Links in emails point to wrong URL
- **Fix:** Set `FRONTEND_URL` to your actual Vercel frontend URL

## Step 5: Check Resend Dashboard

1. Go to [Resend Dashboard](https://resend.com/emails)
2. Check the **"Emails"** section
3. Look for:
   - Failed emails (red status)
   - Error messages
   - Delivery status

## Step 6: Common Error Messages and Solutions

### Error: "Invalid API key"
- **Cause:** RESEND_API_KEY is incorrect or expired
- **Fix:** Generate a new API key in Resend and update it in Render

### Error: "Domain not verified"
- **Cause:** EMAIL_FROM uses a domain that isn't verified in Resend
- **Fix:** 
  - Use `onboarding@resend.dev` for testing (no verification needed)
  - Or verify your domain in Resend dashboard

### Error: "Rate limit exceeded"
- **Cause:** Too many emails sent in a short time
- **Fix:** Wait a few minutes or upgrade your Resend plan

### Error: "Email address is invalid"
- **Cause:** The recipient email address is malformed
- **Fix:** Validate email addresses before sending

## Step 7: Verify Email is Actually Being Called

Check the logs when a user registers:

1. User registers → Check logs for:
   ```
   📧 Email Provider: resend
   📧 Sending confirmation email to: user@example.com
   ```

2. If you see "Using console mode" instead:
   - EMAIL_PROVIDER is not set to "resend"
   - Check Render environment variables

3. If you see errors:
   - Check the error message
   - Verify API key and configuration
   - Check Resend dashboard for delivery status

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

3. **Check Resend dashboard** for email delivery status

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
2. **Verify Resend API Key** is active in Resend dashboard
3. **Test with Resend's test domain:** Use `onboarding@resend.dev` as EMAIL_FROM
4. **Check Resend Dashboard** for delivery status and errors
5. **Verify FRONTEND_URL** matches your actual frontend URL
6. **Try the test endpoint:** `/api/auth/test-email?testEmail=your@email.com`

## Quick Checklist

- [ ] EMAIL_PROVIDER is set to "resend" in Render
- [ ] RESEND_API_KEY is set and correct in Render
- [ ] EMAIL_FROM is set (use onboarding@resend.dev for testing)
- [ ] FRONTEND_URL is set to your actual frontend URL
- [ ] Resend API key is active in Resend dashboard
- [ ] Domain is verified in Resend (if using custom domain)
- [ ] Logs show "Email Provider: resend" (not "console")
- [ ] Logs show "✅ Confirmation email sent via Resend"
- [ ] Check Resend dashboard for email delivery status
- [ ] Check spam folder in email inbox

## Support

If you continue to have issues:
1. Check Render logs for specific error messages
2. Check Resend dashboard for delivery status
3. Verify all environment variables are set correctly
4. Test with the `/api/auth/test-email` endpoint

