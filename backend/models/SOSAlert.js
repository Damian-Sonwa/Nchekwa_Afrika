const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  anonymousId: {
    type: String,
    required: true,
    index: true
  },
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'resolved', 'false_alarm'],
    default: 'pending'
  },
  respondedBy: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  // Auto-delete after 7 days for privacy
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7 * 24 * 60 * 60 * 1000
  }
}, {
  timestamps: true
});

sosAlertSchema.index({ status: 1, timestamp: -1 });
sosAlertSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 }); // 7 days

module.exports = mongoose.model('SOSAlert', sosAlertSchema);


