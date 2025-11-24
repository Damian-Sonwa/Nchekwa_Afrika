const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  anonymousId: {
    type: String,
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  // File stored encrypted, only metadata here
  encryptedFilePath: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  dateOfIncident: {
    type: Date,
    required: false
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 90 * 24 * 60 * 60 * 1000 // Auto-delete after 90 days
  }
}, {
  timestamps: true
});

evidenceSchema.index({ anonymousId: 1 });
evidenceSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

module.exports = mongoose.model('Evidence', evidenceSchema);


