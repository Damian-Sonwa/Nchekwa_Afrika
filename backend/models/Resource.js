const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['helpline', 'shelter', 'legal', 'medical', 'counseling', 'education', 'emergency'],
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String,
    address: String
  },
  location: {
    country: String,
    region: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  available24h: {
    type: Boolean,
    default: false
  },
  languages: [String],
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

resourceSchema.index({ category: 1, location: 1 });
resourceSchema.index({ verified: 1 });

module.exports = mongoose.model('Resource', resourceSchema);


