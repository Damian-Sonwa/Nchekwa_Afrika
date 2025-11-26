/**
 * Email Service
 * 
 * Handles sending emails for:
 * - Email confirmation
 * - Password reset
 * - Other notifications
 * 
 * Supports multiple email providers:
 * - Resend (recommended)
 * - Nodemailer (SMTP)
 * - Console fallback for development
 */

const crypto = require('crypto');

/**
 * Send email confirmation
 * @param {string} email - User's email address
 * @param {string} confirmationLink - Full confirmation URL
 * @param {string} confirmationToken - Confirmation token (for development)
 * @returns {Promise<boolean>} - Success status
 */
async function sendConfirmationEmail(email, confirmationLink, confirmationToken) {
  // If no email provided, skip sending (development mode)
  if (!email) {
    console.log('⚠️  No email address provided, skipping email send');
    return await sendViaConsole(email, confirmationLink, confirmationToken);
  }
  
  try {
    // Check which email service is configured
    const emailProvider = process.env.EMAIL_PROVIDER || 'console';
    
    switch (emailProvider.toLowerCase()) {
      case 'resend':
        return await sendViaResend(email, confirmationLink, confirmationToken);
      case 'nodemailer':
      case 'smtp':
        return await sendViaNodemailer(email, confirmationLink, confirmationToken);
      case 'console':
      default:
        return await sendViaConsole(email, confirmationLink, confirmationToken);
    }
  } catch (error) {
    console.error('❌ Email service error:', error);
    // Fallback to console in case of error
    return await sendViaConsole(email, confirmationLink, confirmationToken);
  }
}

/**
 * Send email via Resend API
 */
async function sendViaResend(email, confirmationLink, confirmationToken) {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.warn('⚠️  RESEND_API_KEY not set, falling back to console');
    return await sendViaConsole(email, confirmationLink, confirmationToken);
  }

  try {
    const { Resend } = require('resend');
    const resend = new Resend(resendApiKey);
    
    const fromEmail = process.env.EMAIL_FROM || 'noreply@nchekwa-afrika.com';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    
    const htmlContent = getEmailTemplate(confirmationLink, 'confirm');
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Confirm Your Email - Nchekwa_Afrika',
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      throw error;
    }

    console.log('✅ Confirmation email sent via Resend:', data?.id);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email via Resend:', error);
    throw error;
  }
}

/**
 * Send email via Nodemailer (SMTP)
 */
async function sendViaNodemailer(email, confirmationLink, confirmationToken) {
  const nodemailer = require('nodemailer');
  
  const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  };

  if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
    console.warn('⚠️  SMTP configuration incomplete, falling back to console');
    return await sendViaConsole(email, confirmationLink, confirmationToken);
  }

  try {
    const transporter = nodemailer.createTransport(smtpConfig);
    
    const fromEmail = process.env.EMAIL_FROM || smtpConfig.auth.user;
    const htmlContent = getEmailTemplate(confirmationLink, 'confirm');
    
    const info = await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: 'Confirm Your Email - Nchekwa_Afrika',
      html: htmlContent,
    });

    console.log('✅ Confirmation email sent via Nodemailer:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email via Nodemailer:', error);
    throw error;
  }
}

/**
 * Console fallback (for development)
 */
async function sendViaConsole(email, confirmationLink, confirmationToken) {
  console.log('\n📧 ============================================');
  console.log('📧 EMAIL CONFIRMATION (Development Mode)');
  console.log('📧 ============================================');
  console.log('📧 To:', email);
  console.log('📧 Subject: Confirm Your Email - Nchekwa_Afrika');
  console.log('📧 Confirmation Link:', confirmationLink);
  if (confirmationToken) {
    console.log('📧 Token:', confirmationToken);
  }
  console.log('📧 ============================================\n');
  
  // In development, we still return true since the link is shown in console/logs
  // and returned in the API response
  return true;
}

/**
 * Get email HTML template
 */
function getEmailTemplate(confirmationLink, type = 'confirm') {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  const appName = 'Nchekwa_Afrika';
  
  if (type === 'confirm') {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #0a3d2f; margin: 0; font-size: 24px;">${appName}</h1>
      <p style="color: #666; margin: 5px 0 0 0;">You are safe here</p>
    </div>
    
    <h2 style="color: #0a3d2f; margin-top: 0;">Confirm Your Email Address</h2>
    <p>Thank you for signing up! Please confirm your email address by clicking the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${confirmationLink}" style="display: inline-block; background-color: #a3ff7f; color: #0a3d2f; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Confirm Email</a>
    </div>
    
    <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
    <p style="color: #888; font-size: 12px; word-break: break-all; background-color: #f9f9f9; padding: 10px; border-radius: 4px;">${confirmationLink}</p>
    
    <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 7 days.</p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
      If you didn't create an account with ${appName}, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
    `;
  }
  
  // Default template
  return `<p>Click here to confirm: <a href="${confirmationLink}">${confirmationLink}</a></p>`;
}

module.exports = {
  sendConfirmationEmail,
};

