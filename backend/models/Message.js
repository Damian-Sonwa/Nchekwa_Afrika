const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: String,
    required: true
  },
  senderType: {
    type: String,
    enum: ['user', 'counselor'],
    required: true
  },
  content: {
    type: String,
    required: true
    // Encrypted on client side before sending
  },
  encrypted: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60 * 1000 // Auto-delete after 30 days
  }
}, {
  timestamps: true
});

// Index for auto-deletion
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days
messageSchema.index({ sessionId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);


