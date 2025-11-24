const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Settings Routes
 * 
 * Handles all user settings updates and retrieval.
 * Settings are stored in the User model's settings field.
 */

// Get all settings
router.get('/:anonymousId', async (req, res) => {
  try {
    const { anonymousId } = req.params;
    const user = await User.findOne({ anonymousId }).select('settings userDetails emailHash');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      settings: user.settings || {},
      userDetails: user.userDetails || {},
      hasEmail: !!user.emailHash
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

// Update settings
router.patch('/:anonymousId', async (req, res) => {
  try {
    const { anonymousId } = req.params;
    const { settings } = req.body;

    if (!anonymousId) {
      return res.status(400).json({ error: 'Anonymous ID is required' });
    }

    const user = await User.findOne({ anonymousId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Merge settings - filter out undefined values
    const cleanSettings = Object.fromEntries(
      Object.entries(settings).filter(([_, value]) => value !== undefined)
    );
    
    user.settings = {
      ...user.settings,
      ...cleanSettings
    };

    await user.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const { anonymousId, currentPassword, newPassword } = req.body;

    if (!anonymousId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({ anonymousId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ error: 'No password set for this account' });
    }

    // Verify current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Update account information
router.patch('/account/:anonymousId', async (req, res) => {
  try {
    const { anonymousId } = req.params;
    const { name, age, sex, maritalStatus, country } = req.body;

    if (!anonymousId) {
      return res.status(400).json({ error: 'Anonymous ID is required' });
    }

    const user = await User.findOne({ anonymousId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user details
    if (name !== undefined) user.userDetails.name = name;
    if (age !== undefined) user.userDetails.age = age;
    if (sex !== undefined) user.userDetails.sex = sex;
    if (maritalStatus !== undefined) user.userDetails.maritalStatus = maritalStatus;
    if (country !== undefined) user.userDetails.country = country;

    await user.save();

    res.json({
      success: true,
      message: 'Account information updated successfully',
      userDetails: user.userDetails
    });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ error: 'Failed to update account information' });
  }
});

// Set/Update PIN
router.post('/pin', async (req, res) => {
  try {
    const { anonymousId, pin, currentPin } = req.body;

    if (!anonymousId || !pin || pin.length < 4) {
      return res.status(400).json({ error: 'Valid PIN required (min 4 digits)' });
    }

    const user = await User.findOne({ anonymousId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If PIN exists, verify current PIN
    if (user.pinHash && currentPin) {
      const isValid = await user.comparePin(currentPin);
      if (!isValid) {
        return res.status(401).json({ error: 'Current PIN is incorrect' });
      }
    }

    // Hash new PIN
    const pinHash = await bcrypt.hash(pin, 10);
    user.pinHash = pinHash;
    await user.save();

    res.json({
      success: true,
      message: user.pinHash ? 'PIN updated successfully' : 'PIN set successfully'
    });
  } catch (error) {
    console.error('Set PIN error:', error);
    res.status(500).json({ error: 'Failed to set PIN' });
  }
});

// Save SOS configuration
router.post('/sos-config', async (req, res) => {
  try {
    const { anonymousId, trustedContacts, alertOptions } = req.body;

    if (!anonymousId) {
      return res.status(400).json({ error: 'Anonymous ID is required' });
    }

    const user = await User.findOne({ anonymousId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Store SOS config in settings
    user.settings = {
      ...user.settings,
      sosConfig: {
        trustedContacts: trustedContacts || [],
        alertOptions: alertOptions || {
          sendLocation: true,
          sendToContacts: false,
          silentMode: false
        }
      }
    };

    await user.save();

    res.json({
      success: true,
      message: 'SOS configuration saved successfully'
    });
  } catch (error) {
    console.error('Save SOS config error:', error);
    res.status(500).json({ error: 'Failed to save SOS configuration' });
  }
});

module.exports = router;


