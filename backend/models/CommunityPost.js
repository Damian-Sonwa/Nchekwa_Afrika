const mongoose = require('mongoose');

// Comment schema embedded in posts
const commentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false // Optional for anonymity
  },
  name: {
    type: String,
    required: false // Optional display name
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  _id: true // Each comment gets its own ID
});

// Main post schema
const communityPostSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false, // Optional for anonymity
    index: true
  },
  name: {
    type: String,
    required: false, // Optional display name
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  category: {
    type: String,
    required: false,
    enum: ['support', 'advice', 'resources', 'general', 'healing', 'legal'],
    default: 'general'
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  likedBy: [{
    type: String, // Array of userIds who liked this post
    required: false
  }],
  comments: {
    type: [commentSchema],
    default: []
  },
  reported: {
    type: Boolean,
    default: false
  },
  reportedBy: [{
    type: String, // Array of userIds who reported this post
    required: false
  }],
  moderated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
communityPostSchema.index({ createdAt: -1 }); // Sort by newest first
communityPostSchema.index({ category: 1, createdAt: -1 }); // Filter by category
communityPostSchema.index({ likes: -1 }); // Sort by popularity

module.exports = mongoose.model('CommunityPost', communityPostSchema);



