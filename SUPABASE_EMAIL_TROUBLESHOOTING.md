# Supabase Email Confirmation Troubleshooting Guide

If you're not receiving email confirmation emails from Supabase, follow these steps:

## 1. Check Supabase Dashboard Settings

### Enable Email Confirmation
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Email Auth**, ensure:
   - ✅ **"Enable email confirmations"** is checked
   - ✅ **"Secure email change"** is enabled
4. Set **Email confirmation expiry** (default: 24 hours)

### Configure Email Templates
1. Go to **Authentication** → **Email Templates**
2. Check the **"Confirm signup"** template
3. Ensure the template includes the confirmation link: `{{ .ConfirmationURL }}`

## 2. Check Redirect URLs

### Add Redirect URLs in Supabase
1. Go to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   ```
   https://nchekwa-afrika.vercel.app/auth
   https://nchekwa-afrika.vercel.app/auth?verified=true
   http://localhost:3000/auth
   http://localhost:3000/auth?verified=true
   ```

### Set Site URL
1. In **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://nchekwa-afrika.vercel.app`

## 3. Check Environment Variables

Ensure these are set in your Vercel project:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Check Browser Console

When signing up, check the browser console for:
- `📧 Signing up user: [email]`
- `🔗 Email confirmation redirect URL: [url]`
- `✅ Signup successful`
- `📧 Email confirmed? [true/false]`

If you see errors, they will be logged with `❌` prefix.

## 5. Check Supabase Logs

1. Go to **Logs** → **Auth Logs** in Supabase dashboard
2. Look for signup attempts
3. Check for any errors related to email sending

## 6. Verify Email Service Configuration

### Default Supabase Email Service
- Supabase uses its built-in email service by default
- Free tier includes unlimited email sends
- Emails are sent from `noreply@mail.app.supabase.io`

### Custom SMTP (Optional)
If you want to use a custom SMTP server:
1. Go to **Settings** → **Auth** → **SMTP Settings**
2. Configure your SMTP provider (SendGrid, Mailgun, etc.)
3. Update **"From" email address**

## 7. Common Issues and Solutions

### Issue: "Email not sent"
**Solution:**
- Check that email confirmation is enabled in Supabase settings
- Verify redirect URLs are configured correctly
- Check spam folder
- Verify email address is valid

### Issue: "Invalid redirect URL"
**Solution:**
- Ensure redirect URL is added to Supabase allowed redirect URLs
- Check that URL matches exactly (including protocol: https://)
- Verify no trailing slashes

### Issue: "Email sent but link doesn't work"
**Solution:**
- Check that Site URL is set correctly in Supabase
- Verify redirect URL is in the allowed list
- Ensure the link uses the correct domain (Vercel URL, not localhost)

### Issue: "No email received"
**Solution:**
- Check spam/junk folder
- Verify email address is correct
- Check Supabase logs for email sending errors
- Try resending confirmation email using the "Resend" button

## 8. Testing Email Confirmation

### Test Signup Flow
1. Go to `/auth` page
2. Click "Sign up"
3. Enter email and password
4. Submit form
5. Check browser console for logs
6. Check email inbox (and spam folder)
7. Click confirmation link in email
8. Should redirect to `/auth?verified=true`

### Test Resend Functionality
1. After signup, if no email received
2. Click "Resend Confirmation Email" button
3. Check browser console for logs
4. Check email inbox again

## 9. Debugging Steps

1. **Check Supabase Configuration:**
   ```bash
   # Verify environment variables are set
   echo $VITE_SUPABASE_URL
   echo $VITE_SUPABASE_ANON_KEY
   ```

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for Supabase-related logs

3. **Check Network Tab:**
   - Open DevTools → Network tab
   - Filter by "auth"
   - Check signup request/response

4. **Verify Supabase Project:**
   - Go to Supabase dashboard
   - Check project is active
   - Verify API keys are correct

## 10. Contact Supabase Support

If issues persist:
1. Check [Supabase Status Page](https://status.supabase.com/)
2. Review [Supabase Documentation](https://supabase.com/docs/guides/auth)
3. Contact Supabase support with:
   - Project reference ID
   - Error messages from console
   - Screenshot of Auth settings

## Quick Checklist

- [ ] Email confirmation enabled in Supabase dashboard
- [ ] Redirect URLs added to Supabase
- [ ] Site URL set correctly
- [ ] Environment variables set in Vercel
- [ ] Email templates configured
- [ ] Checked spam folder
- [ ] Browser console shows no errors
- [ ] Supabase logs show signup attempts

---

**Note:** Supabase sends emails from `noreply@mail.app.supabase.io` by default. Make sure to check spam folders and whitelist this address if needed.

