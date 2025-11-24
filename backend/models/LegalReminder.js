const mongoose = require('mongoose');

/**
 * Legal Reminder Model
 * 
 * Stores reminders for court dates, appointments, deadlines.
 * Encrypted and auto-deletes after completion or 1 year.
 */

const legalReminderSchema = new mongoose.Schema({
  anonymousId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  reminderDate: {
    type: Date,
    required: true,
    index: true
  },
  reminderType: {
    type: String,
    enum: ['court_date', 'appointment', 'deadline', 'follow_up', 'other'],
    default: 'other'
  },
  location: {
    type: String,
    default: ''
  },
  contactInfo: {
    type: String,
    default: ''
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  encrypted: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
legalReminderSchema.index({ anonymousId: 1, reminderDate: 1 });
legalReminderSchema.index({ reminderDate: 1, isCompleted: 1 });

// Auto-delete completed reminders after 30 days, or incomplete after 1 year
legalReminderSchema.index({ 
  createdAt: 1 
}, { 
  expireAfterSeconds: function() {
    return this.isCompleted ? 2592000 : 31536000; // 30 days or 1 year
  }
});

module.exports = mongoose.model('LegalReminder', legalReminderSchema);


