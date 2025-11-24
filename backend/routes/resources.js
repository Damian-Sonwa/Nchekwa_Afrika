const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');

// Get all resources with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, country, search, verified } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (country) {
      query['location.country'] = country;
    }

    if (verified === 'true') {
      query.verified = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(query).sort({ verified: -1, createdAt: -1 });

    res.json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Get resource by ID
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json({ success: true, resource });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// Create resource (admin only - should be protected)
router.post('/', async (req, res) => {
  try {
    const resourceData = req.body;
    const resource = new Resource(resourceData);
    await resource.save();

    res.status(201).json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

module.exports = router;


