const mongoose = require('mongoose');

const safetyPlanSchema = new mongoose.Schema({
  anonymousId: {
    type: String,
    required: true,
    index: true
  },
  planName: {
    type: String,
    default: 'My Safety Plan'
  },
  // Encrypted on client side
  content: {
    type: String,
    required: true
  },
  steps: [{
    title: String,
    description: String,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  emergencyContacts: [{
    name: String,
    phone: String,
    relationship: String
  }],
  safePlaces: [{
    name: String,
    address: String,
    notes: String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 90 * 24 * 60 * 60 * 1000 // Auto-delete after 90 days
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

safetyPlanSchema.index({ anonymousId: 1 });
safetyPlanSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

module.exports = mongoose.model('SafetyPlan', safetyPlanSchema);


