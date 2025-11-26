# Email Troubleshooting Guide

If emails are not being sent, follow this troubleshooting guide.

## Quick Diagnosis

### 1. Check Email Provider Configuration

The system defaults to `console` mode, which only logs emails to the console. To send actual emails, you must configure an email provider.

**Check your environment variables:**
```bash
# In your backend/.env file or Render environment variables
EMAIL_PROVIDER=console  # ← This means emails won't be sent!
```

### 2. Verify Email Provider is Set

**For Resend:**
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=https://your-frontend-url.com
```

**For Nodemailer (SMTP):**
```env
EMAIL_PROVIDER=nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=https://your-frontend-url.com
```

## Common Issues

### Issue 1: "Using console mode - emails will be logged only"

**Problem:** `EMAIL_PROVIDER` is not set or set to `console`.

**Solution:**
1. Set `EMAIL_PROVIDER=resend` or `EMAIL_PROVIDER=nodemailer` in your `.env` file
2. Configure the required credentials for your chosen provider
3. Restart your server

### Issue 2: "RESEND_API_KEY not set"

**Problem:** Resend is selected but API key is missing.

**Solution:**
1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add `RESEND_API_KEY=re_xxxxxxxxxxxxx` to your `.env` file
4. Restart your server

### Issue 3: "SMTP configuration incomplete"

**Problem:** Nodemailer is selected but SMTP credentials are missing.

**Solution:**
1. Add all required SMTP variables to your `.env` file:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
2. For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833)
3. Restart your server

### Issue 4: Emails sent but not received

**Possible causes:**
1. **Spam folder:** Check spam/junk folder
2. **Email domain not verified:** For Resend, verify your sending domain
3. **Rate limiting:** Check if you've exceeded email sending limits
4. **Wrong email address:** Verify the email address in the request

### Issue 5: "No email address provided"

**Problem:** The email parameter is `undefined` or empty.

**Solution:**
- Check that the email is being passed correctly in the registration/reset request
- Verify the email field is not empty in the request body

## Testing Email Configuration

### Test Resend Configuration

1. Set in `.env`:
   ```env
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_FROM=noreply@yourdomain.com
   ```

2. Register a new account or request password reset

3. Check server logs for:
   ```
   📧 Email Provider: resend
   📧 Sending confirmation email to: user@example.com
   ✅ Confirmation email sent via Resend
   ✅ Email ID: abc123...
   ```

### Test Nodemailer Configuration

1. Set in `.env`:
   ```env
   EMAIL_PROVIDER=nodemailer
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   EMAIL_FROM=noreply@yourdomain.com
   ```

2. Register a new account or request password reset

3. Check server logs for:
   ```
   📧 Email Provider: nodemailer
   📧 SMTP Host: smtp.gmail.com:587
   ✅ Confirmation email sent via Nodemailer
   ✅ Message ID: <abc123@mail.gmail.com>
   ```

## Development Mode (Console)

In development, if `EMAIL_PROVIDER=console` or not set:
- Emails are logged to the console
- Confirmation/reset links are returned in API responses
- Links can be copied from console logs or API responses

**Example console output:**
```
📧 ============================================
📧 EMAIL CONFIRMATION (Development Mode)
📧 ============================================
📧 To: user@example.com
📧 Subject: Confirm Your Email - Nchekwa_Afrika
📧 Confirmation Link: http://localhost:3001/confirm-email?token=abc123...
📧 ============================================
```

## Production Deployment

### For Render (Backend)

1. Go to your Render service dashboard
2. Navigate to **Environment** tab
3. Add environment variables:
   - `EMAIL_PROVIDER=resend` (or `nodemailer`)
   - `RESEND_API_KEY=re_xxxxxxxxxxxxx` (if using Resend)
   - `EMAIL_FROM=noreply@yourdomain.com`
   - `FRONTEND_URL=https://your-frontend-url.vercel.app`
   - (Add SMTP vars if using Nodemailer)

4. Save and redeploy

### Verify Configuration

After deployment, check Render logs for:
- Email provider being used
- Successful email sends
- Any error messages

## Debugging Steps

1. **Check server logs** for email-related messages
2. **Verify environment variables** are set correctly
3. **Test with console mode first** to see if links are generated
4. **Check email provider dashboard** (Resend/Nodemailer) for delivery status
5. **Verify email address** in the request is valid
6. **Check spam folder** if emails are sent but not received

## Getting Help

If emails still aren't sending after following this guide:

1. Check server logs for specific error messages
2. Verify all environment variables are set
3. Test email provider credentials separately
4. Check email provider dashboard for delivery issues
5. Ensure `FRONTEND_URL` is set correctly for link generation

