const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendConfirmationEmail, sendPasswordResetEmail } = require('../services/emailService');

// Helper function to generate secure token
function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Helper function to create token expiry date
function createTokenExpiry(hours = 1) {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
}

// Hash email for privacy (one-way, can't reverse)
const hashEmail = (email) => {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
};

// Generate anonymous ID
// GET handler for documentation
router.get('/anonymous', (req, res) => {
  res.status(405).json({
    error: 'Method not allowed',
    message: 'This endpoint requires a POST request',
    usage: {
      method: 'POST',
      url: '/api/auth/anonymous',
      body: {
        deviceId: 'optional-device-id'
      },
      example: {
        curl: 'curl -X POST https://your-api.com/api/auth/anonymous -H "Content-Type: application/json" -d \'{"deviceId":"optional"}\''
      }
    }
  });
});

router.post('/anonymous', async (req, res) => {
  try {
    const { deviceId } = req.body;

    // Generate unique anonymous ID
    const anonymousId = crypto.randomBytes(16).toString('hex');

    // Create or update user
    let user = await User.findOne({ deviceId });
    if (user) {
      user.anonymousId = anonymousId;
      user.lastActive = new Date();
      await user.save();
    } else {
      user = new User({
        anonymousId,
        deviceId: deviceId || null
      });
      await user.save();
    }

    res.status(201).json({
      success: true,
      anonymousId,
      message: 'Anonymous session created'
    });
  } catch (error) {
    console.error('Anonymous auth error:', error);
    res.status(500).json({ error: 'Failed to create anonymous session' });
  }
});

// Set PIN
router.post('/set-pin', async (req, res) => {
  try {
    const { anonymousId, pin } = req.body;

    if (!anonymousId || !pin || pin.length < 4) {
      return res.status(400).json({ error: 'Valid PIN required (min 4 digits)' });
    }

    const user = await User.findOne({ anonymousId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pinHash = await bcrypt.hash(pin, 10);
    user.pinHash = pinHash;
    await user.save();

    res.json({
      success: true,
      message: 'PIN set successfully'
    });
  } catch (error) {
    console.error('Set PIN error:', error);
    res.status(500).json({ error: 'Failed to set PIN' });
  }
});

// Verify PIN
router.post('/verify-pin', async (req, res) => {
  try {
    const { anonymousId, pin } = req.body;

    const user = await User.findOne({ anonymousId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await user.comparePin(pin);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    user.lastActive = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'PIN verified'
    });
  } catch (error) {
    console.error('Verify PIN error:', error);
    res.status(500).json({ error: 'Failed to verify PIN' });
  }
});

// Register with email/password (with email confirmation) - defined below after email confirmation routes

// Login with email/password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Hash email to find user
    const emailHash = hashEmail(email);
    const user = await User.findOne({ emailHash });

    if (!user) {
      console.log(`Login attempt for non-existent user: ${emailHash.substring(0, 16)}...`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user has a password set
    if (!user.passwordHash) {
      console.log(`Login attempt for user without password: ${emailHash.substring(0, 16)}...`);
      return res.status(401).json({ 
        error: 'No password set for this account. Please register first or use social login.' 
      });
    }

    // Verify password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      console.log(`Invalid password attempt for user: ${emailHash.substring(0, 16)}...`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    console.log(`Successful login for user: ${emailHash.substring(0, 16)}...`);

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate a simple token (using anonymousId for now, can be upgraded to JWT later)
    const token = user.anonymousId; // In production, use JWT here
    
    res.json({
      success: true,
      anonymousId: user.anonymousId,
      token: token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Social login (Google/Apple) - creates or finds user
router.post('/social', async (req, res) => {
  try {
    const { provider, providerId, email } = req.body;

    if (!provider || !providerId) {
      return res.status(400).json({ error: 'Provider and provider ID are required' });
    }

    const providerField = provider === 'google' ? 'googleId' : 'appleId';
    
    // Find existing user by provider ID
    let user = await User.findOne({ [providerField]: providerId });

    if (user) {
      // User exists, update last active
      user.lastActive = new Date();
      await user.save();
    } else {
      // Create new user
      const anonymousId = crypto.randomBytes(16).toString('hex');
      const userData = {
        anonymousId,
        [providerField]: providerId
      };

      // Optionally store email hash if provided
      if (email) {
        userData.emailHash = hashEmail(email);
      }

      user = new User(userData);
      await user.save();
    }

    // Generate a simple token
    const token = user.anonymousId; // In production, use JWT here
    
    res.json({
      success: true,
      anonymousId: user.anonymousId,
      token: token,
      message: 'Social login successful'
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ error: 'Failed to authenticate with social provider' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailHash = hashEmail(email);
    const user = await User.findOne({ emailHash });

    if (!user) {
      // Don't reveal if user exists for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    // Generate reset token securely
    const resetToken = generateSecureToken();
    const resetTokenExpiry = createTokenExpiry(1); // 1 hour expiry

    // Store reset token in user settings
    user.settings = user.settings || {};
    user.settings.resetToken = resetToken;
    user.settings.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Generate reset link using consistent FRONTEND_URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetLink, resetToken);
    } catch (emailError) {
      console.error('⚠️  Failed to send password reset email:', emailError);
      // Continue anyway - link is still returned in response for development
    }

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
      // Return reset link in response (for development or if email fails)
      resetLink: resetLink,
      resetToken: resetToken
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset Password (GET - token in query string for direct link clicks)
router.get('/reset-password', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Reset token is required' });
    }

    // Find user with matching reset token
    const users = await User.find({ 'settings.resetToken': token });
    const user = users.find(u => {
      const expiry = u.settings?.resetTokenExpiry;
      return expiry && new Date(expiry) > new Date();
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Token is valid - return success (frontend will handle the form)
    res.json({
      success: true,
      message: 'Token is valid. You can now reset your password.',
      valid: true
    });
  } catch (error) {
    console.error('Reset password token validation error:', error);
    res.status(500).json({ error: 'Failed to validate reset token' });
  }
});

// Reset Password (POST - token and new password in body)
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Find user with matching reset token
    const users = await User.find({ 'settings.resetToken': token });
    const user = users.find(u => {
      const expiry = u.settings?.resetTokenExpiry;
      return expiry && new Date(expiry) > new Date();
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password and clear reset token (token can only be used once)
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.settings.resetToken = undefined;
    user.settings.resetTokenExpiry = undefined;
    user.lastActive = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Confirm Email (supports both GET with query param and POST with body)
router.get('/confirm-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Confirmation token is required' });
    }

    // Find user with matching confirmation token
    // In production, use a proper EmailConfirmation model
    const users = await User.find({ 'settings.emailConfirmationToken': token });
    const user = users.find(u => {
      const expiry = u.settings?.emailConfirmationExpiry;
      return expiry && new Date(expiry) > new Date();
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired confirmation token' });
    }

    // Mark email as confirmed and clear token (token can only be used once)
    user.settings.emailConfirmed = true;
    user.settings.emailConfirmationToken = undefined;
    user.settings.emailConfirmationExpiry = undefined;
    user.lastActive = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Email confirmed successfully'
    });
  } catch (error) {
    console.error('Confirm email error:', error);
    res.status(500).json({ error: 'Failed to confirm email' });
  }
});

// Confirm Email (POST - token in body)
router.post('/confirm-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Confirmation token is required' });
    }

    // Find user with matching confirmation token
    // In production, use a proper EmailConfirmation model
    const users = await User.find({ 'settings.emailConfirmationToken': token });
    const user = users.find(u => {
      const expiry = u.settings?.emailConfirmationExpiry;
      return expiry && new Date(expiry) > new Date();
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired confirmation token' });
    }

    // Mark email as confirmed and clear token (token can only be used once)
    user.settings.emailConfirmed = true;
    user.settings.emailConfirmationToken = undefined;
    user.settings.emailConfirmationExpiry = undefined;
    user.lastActive = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Email confirmed successfully'
    });
  } catch (error) {
    console.error('Confirm email error:', error);
    res.status(500).json({ error: 'Failed to confirm email' });
  }
});

// Resend Confirmation Email
router.post('/resend-confirmation', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailHash = hashEmail(email);
    const user = await User.findOne({ emailHash });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If an account exists with this email, a confirmation link has been sent.'
      });
    }

    // Generate confirmation token securely
    const confirmationToken = generateSecureToken();
    const confirmationExpiry = createTokenExpiry(24 * 7); // 7 days expiry

    user.settings = user.settings || {};
    user.settings.emailConfirmationToken = confirmationToken;
    user.settings.emailConfirmationExpiry = confirmationExpiry;
    await user.save();

    // Generate confirmation link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const confirmationLink = `${frontendUrl}/confirm-email?token=${confirmationToken}`;
    
    // Send confirmation email
    try {
      await sendConfirmationEmail(user.emailHash ? email : undefined, confirmationLink, confirmationToken);
    } catch (emailError) {
      console.error('⚠️  Failed to send confirmation email:', emailError);
      // Continue anyway - link is still returned in response
    }

    res.json({
      success: true,
      message: 'If an account exists with this email, a confirmation link has been sent.',
      // Return confirmation link in response (for development or if email fails)
      confirmationLink: confirmationLink,
      confirmationToken: confirmationToken
    });
  } catch (error) {
    console.error('Resend confirmation error:', error);
    res.status(500).json({ error: 'Failed to resend confirmation email' });
  }
});

// Update register to send confirmation email
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const emailHash = hashEmail(email);
    const existingUser = await User.findOne({ emailHash });
    
    if (existingUser) {
      if (existingUser.passwordHash) {
        return res.status(400).json({ error: 'An account with this email already exists. Please try logging in instead.' });
      }
      
      const passwordHash = await bcrypt.hash(password, 10);
      existingUser.passwordHash = passwordHash;
      existingUser.lastActive = new Date();
      
      // Generate confirmation token securely
      const confirmationToken = generateSecureToken();
      const confirmationExpiry = createTokenExpiry(24 * 7); // 7 days expiry
      
      existingUser.settings = existingUser.settings || {};
      existingUser.settings.emailConfirmationToken = confirmationToken;
      existingUser.settings.emailConfirmationExpiry = confirmationExpiry;
      existingUser.settings.emailConfirmed = false;
      
      await existingUser.save();

      // Generate confirmation link
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const confirmationLink = `${frontendUrl}/confirm-email?token=${confirmationToken}`;
      
      // Send confirmation email
      try {
        await sendConfirmationEmail(email, confirmationLink, confirmationToken);
      } catch (emailError) {
        console.error('⚠️  Failed to send confirmation email:', emailError);
        // Continue anyway - link is still returned in response
      }
      
      const token = existingUser.anonymousId; // In production, use JWT here
      
      return res.status(200).json({
        success: true,
        anonymousId: existingUser.anonymousId,
        token: token,
        requiresEmailConfirmation: true,
        message: 'Password set successfully. Please check your email to confirm your account.',
        // Return confirmation link in response (for development or if email fails)
        confirmationLink: confirmationLink,
        confirmationToken: confirmationToken
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const anonymousId = crypto.randomBytes(16).toString('hex');
    
    // Generate confirmation token securely
    const confirmationToken = generateSecureToken();
    const confirmationExpiry = createTokenExpiry(24 * 7); // 7 days expiry

    const user = new User({
      anonymousId,
      emailHash,
      passwordHash,
      settings: {
        emailConfirmationToken: confirmationToken,
        emailConfirmationExpiry: confirmationExpiry,
        emailConfirmed: false
      }
    });
    await user.save();

    // Generate confirmation link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const confirmationLink = `${frontendUrl}/confirm-email?token=${confirmationToken}`;
    
    // Send confirmation email
    try {
      await sendConfirmationEmail(email, confirmationLink, confirmationToken);
    } catch (emailError) {
      console.error('⚠️  Failed to send confirmation email:', emailError);
      // Continue anyway - link is still returned in response
    }
    
    const token = anonymousId; // In production, use JWT here
    
    res.status(201).json({
      success: true,
      anonymousId,
      token: token,
      requiresEmailConfirmation: true,
      message: 'Account created successfully. Please check your email to confirm your account.',
      // Return confirmation link in response (for development or if email fails)
      confirmationLink: confirmationLink,
      confirmationToken: confirmationToken
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'An account with this email already exists. Please try logging in instead.' });
    }
    res.status(500).json({ error: 'Failed to create account' });
  }
});

module.exports = router;

