const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  anonymousId: {
    type: String,
    required: true,
    index: true
  },
  counselorId: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['active', 'ended', 'archived'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60 * 1000 // Auto-delete after 30 days
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for auto-deletion
chatSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

module.exports = mongoose.model('ChatSession', chatSessionSchema);


