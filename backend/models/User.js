const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  anonymousId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Optional email for account recovery (hashed for privacy)
  emailHash: {
    type: String,
    required: false,
    index: true
  },
  passwordHash: {
    type: String,
    required: false // Optional - can use email/password or stay anonymous
  },
  pinHash: {
    type: String,
    required: false // Optional for anonymous users
  },
  // Social login providers
  googleId: {
    type: String,
    required: false,
    index: true
  },
  appleId: {
    type: String,
    required: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 90 * 24 * 60 * 60 * 1000 // Auto-delete after 90 days
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  settings: {
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    // SOS Configuration
    sosConfig: {
      trustedContacts: [{
        name: String,
        phone: String,
        email: String,
        relationship: String
      }],
      alertOptions: {
        sendLocation: { type: Boolean, default: true },
        sendToContacts: { type: Boolean, default: false },
        silentMode: { type: Boolean, default: false }
      }
    },
    // Evidence Export Settings
    evidenceExport: {
      defaultFormat: { type: String, default: 'zip' },
      includeMetadata: { type: Boolean, default: true },
      encryptOnExport: { type: Boolean, default: true }
    },
    // Mood Tracker Settings
    moodTracker: {
      reminders: { type: Boolean, default: false },
      reminderTime: { type: String, default: '20:00' },
      shareWithCounselor: { type: Boolean, default: false }
    },
    // Legal Reminders Settings
    legalReminders: {
      enabled: { type: Boolean, default: true },
      advanceDays: { type: Number, default: 7 }
    },
    // Grounding Exercises Settings
    groundingExercises: {
      favorites: [String],
      defaultDuration: { type: Number, default: 5 }
    },
    // Offline Mode Settings
    offlineMode: {
      enabled: { type: Boolean, default: false },
      syncOnReconnect: { type: Boolean, default: true }
    },
    // Wearable/IoT Integration
    wearable: {
      enabled: { type: Boolean, default: false },
      deviceType: String,
      deviceId: String,
      sosTrigger: { type: Boolean, default: false }
    },
    // Two-Factor Authentication
    twoFactorAuth: {
      enabled: { type: Boolean, default: false },
      method: { type: String, enum: ['sms', 'email', 'app'], default: 'app' },
      backupCodes: [String]
    }
  },
  // Minimal data - no personal info stored
  deviceId: {
    type: String,
    required: false
  },
  // First-time user details (encrypted client-side before storage)
  userDetails: {
    name: {
      type: String,
      required: false
    },
    age: {
      type: Number,
      required: false
    },
    sex: {
      type: String,
      enum: ['female', 'male', 'other', 'prefer-not-to-say'],
      required: false
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed', 'separated', 'prefer-not-to-say'],
      required: false
    },
    country: {
      type: String,
      required: false
    },
    profilePicture: {
      type: String, // Path to uploaded profile picture
      required: false
    },
    completed: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for auto-deletion
userSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

userSchema.methods.comparePin = async function(pin) {
  if (!this.pinHash) return false;
  return await bcrypt.compare(pin, this.pinHash);
};

userSchema.methods.comparePassword = async function(password) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);

