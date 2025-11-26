# Email Authentication Flow Documentation

This document describes the complete email authentication flow including email confirmation and password reset.

## Overview

The email authentication system supports:
- **Email Confirmation**: Verify user email addresses during registration
- **Password Reset**: Allow users to reset forgotten passwords via email

Both flows use secure token generation, expiration, and single-use tokens.

## Email Confirmation Flow

### 1. Registration
When a user registers with email/password:
1. A secure 32-byte hex token is generated
2. Token is stored in `user.settings.emailConfirmationToken`
3. Expiry is set to 7 days from creation
4. Confirmation email is sent with link: `{FRONTEND_URL}/confirm-email?token={token}`
5. User status is set to `emailConfirmed: false`

### 2. Email Sending
The confirmation email includes:
- **Subject**: "Confirm Your Email - Nchekwa_Afrika"
- **HTML Template**: Professional email with button and fallback link
- **Expiry Notice**: "This link will expire in 7 days"

### 3. Email Verification
User clicks the confirmation link:
- Frontend navigates to `/confirm-email?token={token}`
- Frontend calls `POST /api/auth/confirm-email` with token in body
- Backend validates token:
  - Checks if token exists in database
  - Verifies token hasn't expired
- On success:
  - Sets `emailConfirmed: true`
  - Clears `emailConfirmationToken` and `emailConfirmationExpiry` (single-use)
  - Updates `lastActive` timestamp

### 4. Resend Confirmation
If user needs a new confirmation link:
- User requests resend via `/api/auth/resend-confirmation`
- New token is generated (old token is replaced)
- New confirmation email is sent

## Password Reset Flow

### 1. Request Reset
User requests password reset:
1. User submits email via `/api/auth/forgot-password`
2. A secure 32-byte hex token is generated
3. Token is stored in `user.settings.resetToken`
4. Expiry is set to 1 hour from creation
5. Reset email is sent with link: `{FRONTEND_URL}/reset-password?token={token}`

### 2. Email Sending
The reset email includes:
- **Subject**: "Reset Your Password - Nchekwa_Afrika"
- **HTML Template**: Professional email with button and fallback link
- **Security Notice**: Warns if user didn't request reset
- **Expiry Notice**: "This link will expire in 1 hour"

### 3. Password Reset
User clicks the reset link:
- Frontend navigates to `/reset-password?token={token}`
- Frontend validates token by calling `GET /api/auth/reset-password?token={token}`
- User enters new password
- Frontend calls `POST /api/auth/reset-password` with token and new password
- Backend validates:
  - Token exists and hasn't expired
  - New password meets requirements (min 8 characters)
- On success:
  - Password is hashed and stored
  - `resetToken` and `resetTokenExpiry` are cleared (single-use)
  - `lastActive` timestamp is updated

## Security Features

### Token Generation
- Uses `crypto.randomBytes(32)` for cryptographically secure tokens
- Tokens are 64-character hex strings
- Helper functions: `generateSecureToken()` and `createTokenExpiry(hours)`

### Token Expiration
- **Email Confirmation**: 7 days (168 hours)
- **Password Reset**: 1 hour
- Tokens are automatically invalidated after expiry

### Single-Use Tokens
- Both confirmation and reset tokens are cleared after successful use
- Tokens cannot be reused even if not expired
- Prevents token replay attacks

### Token Storage
- Tokens stored in MongoDB `User` model under `settings` object
- Tokens are cleared immediately after use
- Expiry dates are checked on every validation

## API Endpoints

### Email Confirmation
- `POST /api/auth/register` - Creates account and sends confirmation email
- `GET /api/auth/confirm-email?token={token}` - Validates token (for direct link clicks)
- `POST /api/auth/confirm-email` - Confirms email with token in body
- `POST /api/auth/resend-confirmation` - Sends new confirmation email

### Password Reset
- `POST /api/auth/forgot-password` - Sends password reset email
- `GET /api/auth/reset-password?token={token}` - Validates reset token
- `POST /api/auth/reset-password` - Resets password with token and new password

## Email Service Configuration

The system supports multiple email providers:

### Resend (Recommended)
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=https://your-frontend-url.com
```

### Nodemailer (SMTP)
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

### Console (Development)
```env
EMAIL_PROVIDER=console
FRONTEND_URL=http://localhost:3001
```

## Testing the Flows

### Test Email Confirmation
1. Register a new account: `POST /api/auth/register` with email and password
2. Check console logs or email inbox for confirmation link
3. Click the link or navigate to `/confirm-email?token={token}`
4. Verify email is confirmed and token is cleared

### Test Password Reset
1. Request reset: `POST /api/auth/forgot-password` with email
2. Check console logs or email inbox for reset link
3. Navigate to `/reset-password?token={token}`
4. Enter new password and submit
5. Verify password is updated and token is cleared

## Error Handling

### Invalid Token
- Returns `400 Bad Request` with error message
- Token may be expired, already used, or invalid

### Missing Token
- Returns `400 Bad Request` with "Token is required" message

### Email Sending Failure
- Logs error but continues (link still returned in response for development)
- In production, configure email provider properly

## Frontend Integration

### Email Confirmation
- Frontend receives `confirmationLink` and `confirmationToken` in registration response
- Navigates to `/confirm-email?token={token}` or shows link to user
- Calls `confirmEmail(token)` API function to verify

### Password Reset
- Frontend receives `resetLink` and `resetToken` in forgot-password response (development)
- Navigates to `/reset-password?token={token}`
- Calls `resetPassword(token, newPassword)` API function to complete reset

## Environment Variables

Required variables:
- `FRONTEND_URL` - Base URL for generating email links
- `EMAIL_PROVIDER` - Email service provider (resend, nodemailer, console)
- `EMAIL_FROM` - Sender email address

Provider-specific:
- Resend: `RESEND_API_KEY`
- Nodemailer: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`

## Notes

- All tokens are single-use and expire automatically
- Email service falls back to console logging in development
- Links are always returned in API responses for development/testing
- Frontend URLs must be configured correctly for production
- Email templates use the app's color scheme (#0a3d2f, #a3ff7f)

