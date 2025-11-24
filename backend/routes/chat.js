const express = require('express');
const router = express.Router();
const ChatSession = require('../models/ChatSession');
const Message = require('../models/Message');
const crypto = require('crypto');

// Start new chat session
router.post('/start', async (req, res) => {
  try {
    const { anonymousId } = req.body;

    if (!anonymousId) {
      return res.status(400).json({ error: 'Anonymous ID required' });
    }

    const sessionId = crypto.randomBytes(16).toString('hex');

    const session = new ChatSession({
      sessionId,
      anonymousId,
      status: 'active'
    });

    await session.save();

    res.status(201).json({
      success: true,
      sessionId,
      message: 'Chat session started'
    });
  } catch (error) {
    console.error('Chat start error:', error);
    res.status(500).json({ error: 'Failed to start chat session' });
  }
});

// Send message
router.post('/send', async (req, res) => {
  try {
    const { sessionId, senderId, senderType, content } = req.body;

    if (!sessionId || !senderId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify session exists
    const session = await ChatSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const message = new Message({
      sessionId,
      senderId,
      senderType: senderType || 'user',
      content, // Should be encrypted on client side
      encrypted: true
    });

    await message.save();

    // Update session last message time
    await ChatSession.updateOne(
      { sessionId },
      { lastMessageAt: new Date() }
    );

    res.status(201).json({
      success: true,
      messageId: message._id,
      timestamp: message.createdAt
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get messages for session
router.get('/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await Message.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    res.json({
      success: true,
      messages: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// End chat session
router.post('/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;

    await ChatSession.updateOne(
      { sessionId },
      { status: 'ended', updatedAt: new Date() }
    );

    res.json({ success: true, message: 'Session ended' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to end session' });
  }
});

module.exports = router;


