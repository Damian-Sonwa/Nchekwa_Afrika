const mongoose = require('mongoose');

/**
 * Emotional Check-in Model
 * 
 * Stores anonymous emotional check-ins for wellness tracking.
 * Encrypted and auto-deletes after 90 days.
 */

const emotionalCheckinSchema = new mongoose.Schema({
  anonymousId: {
    type: String,
    required: true,
    index: true
  },
  feeling: {
    type: String,
    default: ''
  },
  needs: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
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
emotionalCheckinSchema.index({ anonymousId: 1, createdAt: -1 });
emotionalCheckinSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

module.exports = mongoose.model('EmotionalCheckin', emotionalCheckinSchema);


