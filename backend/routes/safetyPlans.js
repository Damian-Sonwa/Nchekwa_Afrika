const express = require('express');
const router = express.Router();
const SafetyPlan = require('../models/SafetyPlan');

// Get user's safety plans
router.get('/:anonymousId', async (req, res) => {
  try {
    const { anonymousId } = req.params;
    const plans = await SafetyPlan.find({ anonymousId }).sort({ lastUpdated: -1 });

    res.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Get safety plans error:', error);
    res.status(500).json({ error: 'Failed to fetch safety plans' });
  }
});

// Create or update safety plan
router.post('/', async (req, res) => {
  try {
    const { anonymousId, planName, content, steps, emergencyContacts, safePlaces } = req.body;

    if (!anonymousId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if plan exists
    let plan = await SafetyPlan.findOne({ anonymousId, planName });

    if (plan) {
      // Update existing
      plan.content = content;
      plan.steps = steps || plan.steps;
      plan.emergencyContacts = emergencyContacts || plan.emergencyContacts;
      plan.safePlaces = safePlaces || plan.safePlaces;
      plan.lastUpdated = new Date();
      await plan.save();
    } else {
      // Create new
      plan = new SafetyPlan({
        anonymousId,
        planName: planName || 'My Safety Plan',
        content, // Should be encrypted on client side
        steps: steps || [],
        emergencyContacts: emergencyContacts || [],
        safePlaces: safePlaces || []
      });
      await plan.save();
    }

    res.status(201).json({
      success: true,
      plan
    });
  } catch (error) {
    console.error('Save safety plan error:', error);
    res.status(500).json({ error: 'Failed to save safety plan' });
  }
});

// Delete safety plan
router.delete('/:planId', async (req, res) => {
  try {
    await SafetyPlan.findByIdAndDelete(req.params.planId);
    res.json({ success: true, message: 'Safety plan deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete safety plan' });
  }
});

module.exports = router;


