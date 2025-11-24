const mongoose = require('mongoose');

/**
 * Shelter/Accommodation Model
 * 
 * Stores information about safe shelters, hotels, and accommodations
 * across African countries for GBV survivors.
 * 
 * To add more shelters, update the data file and run the seed script.
 */

const shelterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  country: {
    type: String,
    required: true,
    index: true
  },
  city: {
    type: String,
    required: true,
    index: true
  },
  address: {
    type: String,
    required: false
  },
  contactInfo: {
    phone: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: false
    },
    website: {
      type: String,
      required: false
    }
  },
  // Optional fields
  capacity: {
    type: Number,
    required: false,
    default: null
  },
  notes: {
    type: String,
    required: false
  },
  // Verification status - indicates if this is a verified safe shelter
  verified: {
    type: Boolean,
    default: false,
    index: true
  },
  // Type of accommodation
  type: {
    type: String,
    enum: ['shelter', 'hotel', 'safe-house', 'refuge', 'accommodation'],
    default: 'shelter',
    index: true
  },
  // Location coordinates for distance calculation (optional)
  coordinates: {
    lat: {
      type: Number,
      required: false
    },
    lng: {
      type: Number,
      required: false
    }
  },
  // Additional metadata
  available24h: {
    type: Boolean,
    default: false
  },
  languages: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
shelterSchema.index({ country: 1, city: 1 });
shelterSchema.index({ verified: 1, country: 1 });
shelterSchema.index({ type: 1, country: 1 });
shelterSchema.index({ coordinates: '2dsphere' }); // For geospatial queries

module.exports = mongoose.model('Shelter', shelterSchema);

