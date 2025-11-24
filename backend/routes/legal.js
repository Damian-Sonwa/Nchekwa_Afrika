const express = require('express');
const router = express.Router();
const LegalReminder = require('../models/LegalReminder');

/**
 * Legal Reminders Routes
 * 
 * Handles legal reminder creation, updates, and retrieval.
 * All data is encrypted client-side before storage.
 */

// Create legal reminder
router.post('/', async (req, res) => {
  try {
    const { anonymousId, title, description, reminderDate, reminderType, location, contactInfo } = req.body;

    if (!anonymousId || !title || !reminderDate) {
      return res.status(400).json({ error: 'Anonymous ID, title, and reminder date are required' });
    }

    const reminder = new LegalReminder({
      anonymousId,
      title,
      description: description || '',
      reminderDate: new Date(reminderDate),
      reminderType: reminderType || 'other',
      location: location || '',
      contactInfo: contactInfo || '',
    });

    await reminder.save();

    res.status(201).json({
      success: true,
      reminder: {
        id: reminder._id,
        title: reminder.title,
        reminderDate: reminder.reminderDate,
        reminderType: reminder.reminderType,
      },
      message: 'Legal reminder created successfully'
    });
  } catch (error) {
    console.error('Create legal reminder error:', error);
    res.status(500).json({ error: 'Failed to create legal reminder' });
  }
});

// Get all reminders for user
router.get('/:anonymousId', async (req, res) => {
  try {
    const { anonymousId } = req.params;
    const { includeCompleted = false } = req.query;

    const query = { anonymousId };
    if (!includeCompleted) {
      query.isCompleted = false;
    }

    const reminders = await LegalReminder.find(query)
      .sort({ reminderDate: 1 })
      .select('title description reminderDate reminderType location contactInfo isCompleted createdAt')
      .lean();

    res.json({
      success: true,
      reminders,
      count: reminders.length
    });
  } catch (error) {
    console.error('Get legal reminders error:', error);
    res.status(500).json({ error: 'Failed to retrieve legal reminders' });
  }
});

// Update reminder (mark as completed, edit, etc.)
router.patch('/:reminderId', async (req, res) => {
  try {
    const { reminderId } = req.params;
    const updates = req.body;

    // If marking as completed, set completedAt
    if (updates.isCompleted && !updates.completedAt) {
      updates.completedAt = new Date();
    }

    const reminder = await LegalReminder.findByIdAndUpdate(
      reminderId,
      { $set: updates },
      { new: true }
    ).select('title reminderDate isCompleted').lean();

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({
      success: true,
      reminder,
      message: 'Reminder updated successfully'
    });
  } catch (error) {
    console.error('Update legal reminder error:', error);
    res.status(500).json({ error: 'Failed to update legal reminder' });
  }
});

// Delete reminder
router.delete('/:reminderId', async (req, res) => {
  try {
    const { reminderId } = req.params;

    const reminder = await LegalReminder.findByIdAndDelete(reminderId);

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    console.error('Delete legal reminder error:', error);
    res.status(500).json({ error: 'Failed to delete legal reminder' });
  }
});

// Get upcoming reminders (next 7 days)
router.get('/:anonymousId/upcoming', async (req, res) => {
  try {
    const { anonymousId } = req.params;
    const { days = 7 } = req.query;

    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const reminders = await LegalReminder.find({
      anonymousId,
      isCompleted: false,
      reminderDate: {
        $gte: now,
        $lte: futureDate
      }
    })
      .sort({ reminderDate: 1 })
      .select('title reminderDate reminderType location')
      .lean();

    res.json({
      success: true,
      reminders,
      count: reminders.length,
      period: `next ${days} days`
    });
  } catch (error) {
    console.error('Get upcoming reminders error:', error);
    res.status(500).json({ error: 'Failed to retrieve upcoming reminders' });
  }
});

module.exports = router;


