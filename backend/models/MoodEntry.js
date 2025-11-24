const mongoose = require('mongoose');

/**
 * Mood Entry Model
 * 
 * Stores encrypted mood tracking data with optional geotagging.
 * Auto-deletes after 90 days for privacy.
 */

const moodEntrySchema = new mongoose.Schema({
  anonymousId: {
    type: String,
    required: true,
    index: true
  },
  moodId: {
    type: String,
    required: true,
    enum: ['calm', 'anxious', 'sad', 'angry', 'hopeful', 'grateful']
  },
  moodLabel: {
    type: String,
    required: true
  },
  emoji: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  geotag: {
    lat: { type: Number },
    lng: { type: Number },
    accuracy: { type: Number }
  },
  encrypted: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 90 * 24 * 60 * 60 * 1000 // Auto-delete after 90 days
  }
}, {
  timestamps: true
});

// Index for efficient queries
moodEntrySchema.index({ anonymousId: 1, createdAt: -1 });
moodEntrySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

module.exports = mongoose.model('MoodEntry', moodEntrySchema);


