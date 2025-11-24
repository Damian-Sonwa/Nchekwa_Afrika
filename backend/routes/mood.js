const express = require('express');
const router = express.Router();
const MoodEntry = require('../models/MoodEntry');

/**
 * Mood Tracker Routes
 * 
 * Handles mood entry creation, retrieval, and statistics.
 * All data is encrypted client-side before storage.
 */

// Create mood entry
router.post('/', async (req, res) => {
  try {
    const { anonymousId, moodId, moodLabel, emoji, notes, geotag } = req.body;

    if (!anonymousId || !moodId) {
      return res.status(400).json({ error: 'Anonymous ID and mood ID are required' });
    }

    const entry = new MoodEntry({
      anonymousId,
      moodId,
      moodLabel,
      emoji,
      notes: notes || '',
      geotag: geotag || null,
    });

    await entry.save();

    res.status(201).json({
      success: true,
      entry: {
        id: entry._id,
        moodId: entry.moodId,
        moodLabel: entry.moodLabel,
        createdAt: entry.createdAt,
      },
      message: 'Mood entry saved successfully'
    });
  } catch (error) {
    console.error('Create mood entry error:', error);
    res.status(500).json({ error: 'Failed to save mood entry' });
  }
});

// Get mood history
router.get('/:anonymousId', async (req, res) => {
  try {
    const { anonymousId } = req.params;
    const { days = 30, limit = 100 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const entries = await MoodEntry.find({
      anonymousId,
      createdAt: { $gte: cutoffDate }
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('moodId moodLabel emoji notes createdAt')
      .lean();

    res.json({
      success: true,
      entries,
      count: entries.length
    });
  } catch (error) {
    console.error('Get mood history error:', error);
    res.status(500).json({ error: 'Failed to retrieve mood history' });
  }
});

// Get mood statistics
router.get('/:anonymousId/stats', async (req, res) => {
  try {
    const { anonymousId } = req.params;
    const { days = 7 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const stats = await MoodEntry.aggregate([
      {
        $match: {
          anonymousId,
          createdAt: { $gte: cutoffDate }
        }
      },
      {
        $group: {
          _id: '$moodId',
          count: { $sum: 1 },
          moodLabel: { $first: '$moodLabel' },
          emoji: { $first: '$emoji' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      stats,
      period: `${days} days`
    });
  } catch (error) {
    console.error('Get mood stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve mood statistics' });
  }
});

module.exports = router;


