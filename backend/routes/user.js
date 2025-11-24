const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const User = require('../models/User');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only images are allowed.'));
  }
});

/**
 * User Routes
 * 
 * Handles user profile updates and data management.
 */

// Upload profile picture
router.post('/profile-picture', upload.single('profilePicture'), async (req, res) => {
  try {
    const { anonymousId } = req.body;

    if (!anonymousId) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'Anonymous ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await User.findOne({ anonymousId });
    if (!user) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete old profile picture if exists
    if (user.userDetails?.profilePicture) {
      const oldPicturePath = user.userDetails.profilePicture;
      // Extract filename from URL or path
      const oldFileName = oldPicturePath.includes('/') 
        ? path.basename(oldPicturePath) 
        : oldPicturePath;
      const oldFilePath = path.join('uploads/profiles', oldFileName);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update user profile picture
    if (!user.userDetails) {
      user.userDetails = {};
    }
    user.userDetails.profilePicture = `/api/uploads/profiles/${path.basename(req.file.path)}`;

    await user.save();

    res.json({
      success: true,
      profilePicture: user.userDetails.profilePicture,
      message: 'Profile picture uploaded successfully'
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

// Save user details (first-time setup)
router.post('/details', async (req, res) => {
  try {
    const { anonymousId, name, age, sex, maritalStatus, country } = req.body;

    if (!anonymousId) {
      return res.status(400).json({ error: 'Anonymous ID is required' });
    }

    const user = await User.findOne({ anonymousId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user details (preserve profile picture if exists)
    const existingProfilePicture = user.userDetails?.profilePicture;

    user.userDetails = {
      name: name || undefined,
      age: age || undefined,
      sex: sex || undefined,
      maritalStatus: maritalStatus || undefined,
      country: country || undefined,
      profilePicture: existingProfilePicture,
      completed: true
    };

    await user.save();

    res.json({
      success: true,
      message: 'User details saved successfully'
    });
  } catch (error) {
    console.error('Save user details error:', error);
    res.status(500).json({ error: 'Failed to save user details' });
  }
});

// Get user details
router.get('/details/:anonymousId', async (req, res) => {
  try {
    const { anonymousId } = req.params;

    const user = await User.findOne({ anonymousId }).select('userDetails');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user details with profile picture URL if exists
    const userDetails = user.userDetails || {};
    if (userDetails.profilePicture && !userDetails.profilePicture.startsWith('http')) {
      // Ensure the profile picture URL is absolute
      userDetails.profilePicture = userDetails.profilePicture.startsWith('/') 
        ? userDetails.profilePicture 
        : `/api/uploads/profiles/${path.basename(userDetails.profilePicture)}`;
    }

    res.json({
      success: true,
      userDetails: userDetails
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to retrieve user details' });
  }
});

// Wipe all user data
router.post('/wipe', async (req, res) => {
  try {
    const { anonymousId } = req.body;

    if (!anonymousId) {
      return res.status(400).json({ error: 'Anonymous ID is required' });
    }

    const user = await User.findOne({ anonymousId });
    if (user) {
      // Clear sensitive data but keep anonymous ID for session continuity
      user.userDetails = {};
      user.emailHash = undefined;
      user.passwordHash = undefined;
      user.pinHash = undefined;
      await user.save();
    }

    res.json({
      success: true,
      message: 'User data wiped successfully'
    });
  } catch (error) {
    console.error('Wipe user data error:', error);
    res.status(500).json({ error: 'Failed to wipe user data' });
  }
});

module.exports = router;
