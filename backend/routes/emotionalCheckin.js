const express = require('express');
const router = express.Router();
const EmotionalCheckin = require('../models/EmotionalCheckin');

/**
 * Emotional Check-in Routes
 * 
 * Handles emotional check-in creation and retrieval.
 * All data is encrypted client-side before storage.
 */

// Create emotional check-in
router.post('/', async (req, res) => {
  try {
    const { anonymousId, feeling, needs, notes } = req.body;

    if (!anonymousId) {
      return res.status(400).json({ error: 'Anonymous ID is required' });
    }

    const checkin = new EmotionalCheckin({
      anonymousId,
      feeling: feeling || '',
      needs: needs || '',
      notes: notes || '',
    });

    await checkin.save();

    res.status(201).json({
      success: true,
      checkin: {
        id: checkin._id,
        createdAt: checkin.createdAt,
      },
      message: 'Emotional check-in saved successfully'
    });
  } catch (error) {
    console.error('Create emotional check-in error:', error);
    res.status(500).json({ error: 'Failed to save emotional check-in' });
  }
});

// Get emotional check-ins
router.get('/:anonymousId', async (req, res) => {
  try {
    const { anonymousId } = req.params;
    const { days = 30, limit = 50 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const checkins = await EmotionalCheckin.find({
      anonymousId,
      createdAt: { $gte: cutoffDate }
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('feeling needs notes createdAt')
      .lean();

    res.json({
      success: true,
      checkins,
      count: checkins.length
    });
  } catch (error) {
    console.error('Get emotional check-ins error:', error);
    res.status(500).json({ error: 'Failed to retrieve emotional check-ins' });
  }
});

module.exports = router;


