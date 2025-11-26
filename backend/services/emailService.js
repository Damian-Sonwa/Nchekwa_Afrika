/**
 * Email Service
 * 
 * Handles sending emails for:
 * - Email confirmation
 * - Password reset
 * - Other notifications
 * 
 * Supports multiple email providers:
 * - SendGrid (recommended)
 * - Nodemailer (SMTP)
 * - Console fallback for development
 */

/**
 * Validate email address format
 */
function validateEmailFormat(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  // Basic email format validation: email@domain.com
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Get valid from email address
 */
function getValidFromEmail() {
  const emailFrom = process.env.EMAIL_FROM;
  
  // If EMAIL_FROM is not set or invalid, use default
  if (!emailFrom || !validateEmailFormat(emailFrom)) {
    console.warn('⚠️  EMAIL_FROM is not set or invalid');
    console.warn('💡 Set EMAIL_FROM to a verified email address (e.g., noreply@nchekwaafrika.com)');
    // Return a default - user should set this in production
    return 'noreply@nchekwaafrika.com';
  }
  
  return emailFrom.trim();
}

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
    console.log('💡 Email confirmation link (for manual use):', confirmationLink);
    return await sendViaConsole(email, confirmationLink, confirmationToken);
  }
  
  // Check which email service is configured
  const emailProvider = process.env.EMAIL_PROVIDER || 'console';
  console.log(`📧 Email Provider: ${emailProvider}`);
  console.log(`📧 Sending confirmation email to: ${email}`);
  console.log(`📧 FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);
  console.log(`📧 EMAIL_FROM: ${process.env.EMAIL_FROM || 'NOT SET'}`);
  
  try {
    switch (emailProvider.toLowerCase()) {
      case 'sendgrid':
        const sendgridResult = await sendViaSendGrid(email, confirmationLink, confirmationToken, 'confirm');
        if (!sendgridResult) {
          console.error('❌ SendGrid returned false - email was not sent');
          throw new Error('SendGrid email sending failed');
        }
        return sendgridResult;
      case 'nodemailer':
      case 'smtp':
        const nodemailerResult = await sendViaNodemailer(email, confirmationLink, confirmationToken, 'confirm');
        if (!nodemailerResult) {
          console.error('❌ Nodemailer returned false - email was not sent');
          throw new Error('Nodemailer email sending failed');
        }
        return nodemailerResult;
      case 'console':
      default:
        console.log('💡 Using console mode - emails will be logged only. Set EMAIL_PROVIDER to "sendgrid" or "nodemailer" to send actual emails.');
        return await sendViaConsole(email, confirmationLink, confirmationToken);
    }
  } catch (error) {
    console.error('❌ Email service error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    // Re-throw the error so the calling code knows it failed
    throw error;
  }
}

/**
 * Send email via SendGrid API
 */
async function sendViaSendGrid(email, link, token, type = 'confirm') {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  
  if (!sendgridApiKey) {
    console.warn('⚠️  SENDGRID_API_KEY not set, falling back to console');
    console.warn('💡 To send emails via SendGrid, set SENDGRID_API_KEY in your environment variables');
    return await sendViaConsole(email, link, token);
  }

  try {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(sendgridApiKey);
    
    const fromEmail = getValidFromEmail();
    console.log(`📧 From: ${fromEmail}`);
    console.log(`📧 To: ${email}`);
    
    // Validate recipient email
    if (!validateEmailFormat(email)) {
      throw new Error(`Invalid recipient email format: ${email}`);
    }
    
    const htmlContent = getEmailTemplate(link, type);
    const subject = type === 'confirm' 
      ? 'Confirm Your Email - Nchekwa_Afrika'
      : 'Reset Your Password - Nchekwa_Afrika';
    
    const msg = {
      to: email,
      from: fromEmail,
      subject: subject,
      html: htmlContent,
    };
    
    await sgMail.send(msg);
    
    const emailType = type === 'confirm' ? 'Confirmation' : 'Password reset';
    console.log(`✅ ${emailType} email sent via SendGrid`);
    return true;
  } catch (error) {
    console.error('❌ SendGrid API error:', error);
    if (error.response) {
      console.error('❌ Error details:', JSON.stringify(error.response.body, null, 2));
    }
    console.error('❌ Error message:', error.message);
    throw error;
  }
}

/**
 * Send email via Nodemailer (SMTP)
 */
async function sendViaNodemailer(email, link, token, type = 'confirm') {
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
    console.warn('💡 Required SMTP env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD');
    return await sendViaConsole(email, link, token);
  }

  try {
    console.log(`📧 SMTP Host: ${smtpConfig.host}:${smtpConfig.port}`);
    console.log(`📧 SMTP User: ${smtpConfig.auth.user}`);
    
    const transporter = nodemailer.createTransport(smtpConfig);
    
    const fromEmail = process.env.EMAIL_FROM || smtpConfig.auth.user;
    console.log(`📧 From: ${fromEmail}`);
    console.log(`📧 To: ${email}`);
    
    const htmlContent = getEmailTemplate(link, type);
    const subject = type === 'confirm' 
      ? 'Confirm Your Email - Nchekwa_Afrika'
      : 'Reset Your Password - Nchekwa_Afrika';
    
    const info = await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: subject,
      html: htmlContent,
    });

    const emailType = type === 'confirm' ? 'Confirmation' : 'Password reset';
    console.log(`✅ ${emailType} email sent via Nodemailer`);
    console.log('✅ Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email via Nodemailer:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error code:', error.code);
    throw error;
  }
}

/**
 * Console fallback (for development)
 */
async function sendViaConsole(email, link, token) {
  const emailType = link.includes('reset') ? 'PASSWORD RESET' : 'EMAIL CONFIRMATION';
  console.log('\n📧 ============================================');
  console.log(`📧 ${emailType} (Development Mode)`);
  console.log('📧 ============================================');
  console.log('📧 To:', email);
  console.log('📧 Subject:', link.includes('reset') ? 'Reset Your Password - Nchekwa_Afrika' : 'Confirm Your Email - Nchekwa_Afrika');
  console.log('📧 Link:', link);
  if (token) {
    console.log('📧 Token:', token);
  }
  console.log('📧 ============================================\n');
  
  // In development, we still return true since the link is shown in console/logs
  // and returned in the API response
  return true;
}

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} resetLink - Full password reset URL
 * @param {string} resetToken - Reset token (for development)
 * @returns {Promise<boolean>} - Success status
 */
async function sendPasswordResetEmail(email, resetLink, resetToken) {
  // If no email provided, skip sending (development mode)
  if (!email) {
    console.log('⚠️  No email address provided, skipping email send');
    return await sendViaConsole(email, resetLink, resetToken);
  }
  
  // Check which email service is configured
  const emailProvider = process.env.EMAIL_PROVIDER || 'console';
  console.log(`📧 Email Provider: ${emailProvider}`);
  console.log(`📧 Sending password reset email to: ${email}`);
  console.log(`📧 FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);
  console.log(`📧 EMAIL_FROM: ${process.env.EMAIL_FROM || 'NOT SET'}`);
  
  try {
    switch (emailProvider.toLowerCase()) {
      case 'sendgrid':
        const sendgridResult = await sendViaSendGrid(email, resetLink, resetToken, 'reset');
        if (!sendgridResult) {
          console.error('❌ SendGrid returned false - email was not sent');
          throw new Error('SendGrid email sending failed');
        }
        return sendgridResult;
      case 'nodemailer':
      case 'smtp':
        const nodemailerResult = await sendViaNodemailer(email, resetLink, resetToken, 'reset');
        if (!nodemailerResult) {
          console.error('❌ Nodemailer returned false - email was not sent');
          throw new Error('Nodemailer email sending failed');
        }
        return nodemailerResult;
      case 'console':
      default:
        return await sendViaConsole(email, resetLink, resetToken);
    }
  } catch (error) {
    console.error('❌ Email service error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    // Re-throw the error so the calling code knows it failed
    throw error;
  }
}

/**
 * Get email HTML template
 */
function getEmailTemplate(link, type = 'confirm') {
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
      <a href="${link}" style="display: inline-block; background-color: #a3ff7f; color: #0a3d2f; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Confirm Email</a>
    </div>
    
    <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
    <p style="color: #888; font-size: 12px; word-break: break-all; background-color: #f9f9f9; padding: 10px; border-radius: 4px;">${link}</p>
    
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
  
  if (type === 'reset') {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #0a3d2f; margin: 0; font-size: 24px;">${appName}</h1>
      <p style="color: #666; margin: 5px 0 0 0;">You are safe here</p>
    </div>
    
    <h2 style="color: #0a3d2f; margin-top: 0;">Reset Your Password</h2>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${link}" style="display: inline-block; background-color: #a3ff7f; color: #0a3d2f; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Reset Password</a>
    </div>
    
    <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
    <p style="color: #888; font-size: 12px; word-break: break-all; background-color: #f9f9f9; padding: 10px; border-radius: 4px;">${link}</p>
    
    <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 1 hour.</p>
    
    <p style="color: #e74c3c; font-size: 14px; margin-top: 20px;"><strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
      For security reasons, this link can only be used once and will expire after 1 hour.
    </p>
  </div>
</body>
</html>
    `;
  }
  
  // Default template
  return `<p>Click here: <a href="${link}">${link}</a></p>`;
}

module.exports = {
  sendConfirmationEmail,
  sendPasswordResetEmail,
};
