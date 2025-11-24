const express = require('express');
const router = express.Router();
const SOSAlert = require('../models/SOSAlert');
const crypto = require('crypto');

// Create SOS alert
router.post('/', async (req, res) => {
  try {
    const { anonymousId, location } = req.body;

    if (!anonymousId) {
      return res.status(400).json({ error: 'Anonymous ID required' });
    }

    const alert = new SOSAlert({
      anonymousId,
      location: location || {},
      timestamp: new Date()
    });

    await alert.save();

    // In production, this would trigger:
    // 1. Notification to emergency responders
    // 2. SMS/Email to trusted contacts (if configured)
    // 3. Silent alert to support network

    res.status(201).json({
      success: true,
      alertId: alert._id,
      message: 'SOS alert created. Help is on the way.'
    });
  } catch (error) {
    console.error('SOS error:', error);
    res.status(500).json({ error: 'Failed to create SOS alert' });
  }
});

// Get SOS status
router.get('/:alertId', async (req, res) => {
  try {
    const alert = await SOSAlert.findById(req.params.alertId);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
});

// Update SOS status
router.patch('/:alertId', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const alert = await SOSAlert.findByIdAndUpdate(
      req.params.alertId,
      { status, notes, updatedAt: new Date() },
      { new: true }
    );
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

module.exports = router;


