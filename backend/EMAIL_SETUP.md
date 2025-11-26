# Email Service Configuration

The email confirmation system supports multiple email providers. Configure one of the following:

## Option 1: SendGrid (Recommended)

SendGrid is a reliable transactional email service with a generous free tier (100 emails/day).

### Setup Steps:

1. **Sign up at [sendgrid.com](https://sendgrid.com)**
   - Create a free account
   - Verify your email address

2. **Create an API Key:**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name it (e.g., "GBV App Production")
   - Select "Full Access" or "Restricted Access" with Mail Send permissions
   - Copy the API key (starts with `SG.`)

3. **Verify a Sender Identity:**
   - Go to Settings → Sender Authentication
   - Click "Verify a Single Sender" (for testing) or "Authenticate Your Domain" (for production)
   - For single sender: Enter your email and verify it
   - For domain: Add DNS records to verify your domain

4. **Add to Render Environment Variables:**
   ```
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   EMAIL_FROM=noreply@nchekwaafrika.com
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

**Important Notes:**
- `EMAIL_FROM` must be a verified sender in SendGrid
- For testing: Use a verified single sender email
- For production: Use a verified domain email (e.g., `noreply@nchekwaafrika.com`)
- Free tier: 100 emails/day

## Option 2: Nodemailer (SMTP)

Use any SMTP provider (Gmail, Outlook, custom SMTP).

### Setup Steps:

1. **Configure SMTP settings in Render:**
   ```
   EMAIL_PROVIDER=nodemailer
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   EMAIL_FROM=your-email@gmail.com
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

2. **For Gmail:**
   - Enable 2-Factor Authentication
   - Generate an [App Password](https://myaccount.google.com/apppasswords)
   - Use the app password as `SMTP_PASSWORD`

3. **For Other Providers:**
   - **Outlook**: `smtp-mail.outlook.com` (port 587)
   - **SendGrid SMTP**: `smtp.sendgrid.net` (port 587)
   - **Mailgun**: `smtp.mailgun.org` (port 587)
   - **Custom**: Use your hosting provider's SMTP settings

## Option 3: Console (Development - Default)

No configuration needed. Emails will be logged to the console and the confirmation link will be returned in the API response.

Set in Render:
```
EMAIL_PROVIDER=console
FRONTEND_URL=http://localhost:3001
```

## Environment Variables

### Required for All Providers:
- `EMAIL_PROVIDER`: `sendgrid`, `nodemailer`, or `console` (default: `console`)
- `FRONTEND_URL`: Your frontend URL for generating confirmation links
- `EMAIL_FROM`: The "from" email address (must be verified for SendGrid)

### For SendGrid:
- `SENDGRID_API_KEY`: Your SendGrid API key (starts with `SG.`)

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

- **Emails not sending**: Check that `EMAIL_PROVIDER` is set correctly and required credentials are in environment variables
- **Links not working**: Verify `FRONTEND_URL` is set correctly
- **SendGrid errors**: Ensure sender email is verified in SendGrid dashboard
- **SMTP errors**: Check that app password is correct (for Gmail) and SMTP settings are correct
- **Console mode**: In development, confirmation links are returned in the API response and logged to console

## SendGrid Free Tier Limits

- **100 emails per day** (free tier)
- **Unlimited contacts**
- **Email API access**
- **Email activity dashboard**

For production with higher volume, consider upgrading to a paid SendGrid plan.

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive credentials
3. **Rotate API keys** periodically
4. **Use domain authentication** for production (not single sender)
5. **Monitor email activity** in SendGrid dashboard
