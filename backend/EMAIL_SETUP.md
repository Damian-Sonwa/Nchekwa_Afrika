# Email Service Configuration

The email confirmation system supports multiple email providers. Configure one of the following:

## ⚠️ Important: Resend Free Tier Limitation

**Resend's free tier only allows sending emails to your verified email address.**

- ✅ You can send to: `madudamian25@gmail.com` (your verified email)
- ❌ You cannot send to: Other email addresses (without domain verification)

**Solutions:**
1. **For testing**: Only use `madudamian25@gmail.com` for test accounts
2. **For production**: Verify a domain at [resend.com/domains](https://resend.com/domains)
3. **Alternative**: Use SMTP/Nodemailer (see Option 2 below)

See [RESEND_LIMITATIONS.md](./RESEND_LIMITATIONS.md) for detailed solutions.

## Option 1: Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. **For testing (free tier)**: Use your verified email
   ```
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_FROM=onboarding@resend.dev
   FRONTEND_URL=https://your-frontend-url.com
   ```
   ⚠️ **Limitation**: Can only send to `madudamian25@gmail.com`

4. **For production**: Verify a domain first at [resend.com/domains](https://resend.com/domains)
   ```
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_FROM=noreply@yourdomain.com  # Must use verified domain
   FRONTEND_URL=https://your-frontend-url.com
   ```
   ✅ **After domain verification**: Can send to any email address

## Option 2: Nodemailer (SMTP)

1. Configure SMTP settings in your `.env` file:
   ```
   EMAIL_PROVIDER=nodemailer
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   EMAIL_FROM=noreply@yourdomain.com
   FRONTEND_URL=https://your-frontend-url.com
   ```

## Option 3: Console (Development - Default)

No configuration needed. Emails will be logged to the console and the confirmation link will be returned in the API response.

Set in `.env`:
```
EMAIL_PROVIDER=console
FRONTEND_URL=http://localhost:3001
```

## Environment Variables

- `EMAIL_PROVIDER`: `resend`, `nodemailer`, or `console` (default: `console`)
- `FRONTEND_URL`: Your frontend URL for generating confirmation links
- `EMAIL_FROM`: The "from" email address

### For Resend:
- `RESEND_API_KEY`: Your Resend API key

### For Nodemailer:
- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: SMTP port (usually 587 or 465)
- `SMTP_SECURE`: `true` for port 465, `false` for other ports
- `SMTP_USER`: SMTP username/email
- `SMTP_PASSWORD`: SMTP password or app password

## Testing

1. Register a new account with an email address
2. Check your email inbox (or console logs if using console mode)
3. Click the confirmation link
4. Verify that the email is confirmed

## Troubleshooting

- **Emails not sending**: Check that `EMAIL_PROVIDER` is set correctly and required credentials are in `.env`
- **Links not working**: Verify `FRONTEND_URL` is set correctly
- **Console mode**: In development, confirmation links are returned in the API response and logged to console

