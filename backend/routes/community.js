const express = require('express');
const router = express.Router();
const CommunityPost = require('../models/CommunityPost');

/**
 * GET /api/community
 * Fetch all posts with optional filtering and sorting
 * Query params: category, sort (newest|popular), limit, offset
 */
router.get('/', async (req, res) => {
  try {
    const { category, sort = 'newest', limit = 50, offset = 0 } = req.query;

    // Build query - only filter out moderated posts (use $ne to handle undefined/null)
    const query = { moderated: { $ne: true } }; // Don't show moderated posts
    if (category && category !== 'all' && category !== 'null' && category !== 'undefined') {
      query.category = category;
    }

    // Build sort object
    let sortObj = {};
    if (sort === 'popular') {
      sortObj = { likes: -1, createdAt: -1 }; // Popular first, then by date
    } else {
      sortObj = { createdAt: -1 }; // Newest first
    }

    // Debug logging
    console.log('Community GET query:', JSON.stringify(query));
    console.log('Category filter:', category);

    // Fetch posts
    const posts = await CommunityPost.find(query)
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean(); // Use lean() for better performance

    console.log('Found posts:', posts.length);

    // Get total count for pagination
    const total = await CommunityPost.countDocuments(query);

    res.json({
      success: true,
      posts,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get community posts error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch community posts' 
    });
  }
});

/**
 * POST /api/community
 * Create a new post
 * Body: { userId?, name?, title, content, category? }
 */
router.post('/', async (req, res) => {
  try {
    const { userId, name, title, content, category = 'general' } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title and content are required'
      });
    }

    if (title.length > 200) {
      return res.status(400).json({
        success: false,
        error: 'Title must be 200 characters or less'
      });
    }

    if (content.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Content must be 5000 characters or less'
      });
    }

    // Create post
    const post = new CommunityPost({
      userId: userId || null, // Optional
      name: name || 'Anonymous', // Default to Anonymous if not provided
      title: title.trim(),
      content: content.trim(),
      category: category || 'general',
      likes: 0,
      likedBy: [],
      comments: [],
      reported: false,
      reportedBy: [],
      moderated: false // Explicitly set to false
    });

    await post.save();
    console.log('Post created successfully:', post._id);

    res.status(201).json({
      success: true,
      post,
      message: 'Post created successfully'
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create post'
    });
  }
});

/**
 * POST /api/community/:id/comment
 * Add a comment to a post
 * Body: { userId?, name?, content }
 */
router.post('/:id/comment', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, name, content } = req.body;

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required'
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Comment must be 1000 characters or less'
      });
    }

    // Find post
    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Add comment
    post.comments.push({
      userId: userId || null,
      name: name || 'Anonymous',
      content: content.trim(),
      createdAt: new Date()
    });

    await post.save();

    // Return the new comment (last one in array)
    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      comment: newComment,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add comment'
    });
  }
});

/**
 * POST /api/community/:id/like
 * Like or unlike a post
 * Body: { userId }
 */
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Find post
    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check if user already liked (if userId provided)
    if (userId) {
      const alreadyLiked = post.likedBy.includes(userId);
      
      if (alreadyLiked) {
        // Unlike: remove from likedBy and decrement likes
        post.likedBy = post.likedBy.filter(id => id !== userId);
        post.likes = Math.max(0, post.likes - 1);
      } else {
        // Like: add to likedBy and increment likes
        post.likedBy.push(userId);
        post.likes += 1;
      }
    } else {
      // Anonymous like (just increment)
      post.likes += 1;
    }

    await post.save();

    res.json({
      success: true,
      likes: post.likes,
      liked: userId ? post.likedBy.includes(userId) : false,
      message: 'Like updated successfully'
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update like'
    });
  }
});

/**
 * POST /api/community/:id/report
 * Report a post for moderation
 * Body: { userId, reason? }
 */
router.post('/:id/report', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, reason } = req.body;

    // Find post
    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Add to reportedBy if userId provided and not already reported
    if (userId && !post.reportedBy.includes(userId)) {
      post.reportedBy.push(userId);
    }

    // Mark as reported
    post.reported = true;

    await post.save();

    // TODO: In production, trigger AI moderation or notify admins
    console.log(`Post ${id} reported by ${userId || 'anonymous'}. Reason: ${reason || 'Not provided'}`);

    res.json({
      success: true,
      message: 'Post reported. Our team will review it shortly.'
    });
  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to report post'
    });
  }
});

/**
 * DELETE /api/community/:id
 * Delete a post (admin/moderation only)
 * In production, add authentication middleware to verify admin role
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Add admin authentication check here

    const post = await CommunityPost.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete post'
    });
  }
});

module.exports = router;

