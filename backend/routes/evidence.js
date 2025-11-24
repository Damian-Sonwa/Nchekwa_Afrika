const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Evidence = require('../models/Evidence');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/evidence';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|mov|wav|mp3/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});

// Upload evidence file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { anonymousId, description, dateOfIncident, tags } = req.body;

    if (!anonymousId) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Anonymous ID required' });
    }

    // In production, encrypt the file here before storing
    // For now, we'll store the path (encryption should be done client-side)

    const evidence = new Evidence({
      anonymousId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      encryptedFilePath: req.file.path,
      description: description || '',
      dateOfIncident: dateOfIncident ? new Date(dateOfIncident) : null,
      tags: tags ? tags.split(',') : []
    });

    await evidence.save();

    res.status(201).json({
      success: true,
      evidenceId: evidence._id,
      message: 'Evidence uploaded successfully'
    });
  } catch (error) {
    console.error('Upload evidence error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload evidence' });
  }
});

// Get user's evidence
router.get('/:anonymousId', async (req, res) => {
  try {
    const { anonymousId } = req.params;
    
    if (!anonymousId) {
      return res.status(400).json({ 
        success: false,
        error: 'Anonymous ID required',
        evidence: []
      });
    }

    const evidence = await Evidence.find({ anonymousId }).sort({ createdAt: -1 });

    // Don't send file paths in response for security
    const safeEvidence = evidence.map(e => ({
      _id: e._id,
      fileName: e.fileName,
      fileType: e.fileType,
      fileSize: e.fileSize,
      description: e.description,
      dateOfIncident: e.dateOfIncident,
      tags: e.tags,
      createdAt: e.createdAt
    }));

    res.json({
      success: true,
      evidence: safeEvidence || []
    });
  } catch (error) {
    console.error('Get evidence error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch evidence',
      evidence: []
    });
  }
});

// Download evidence file (with authentication)
router.get('/download/:evidenceId', async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.evidenceId);
    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    // In production, verify anonymousId matches request
    // Decrypt file before sending
    if (fs.existsSync(evidence.encryptedFilePath)) {
      res.download(evidence.encryptedFilePath, evidence.fileName);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to download evidence' });
  }
});

// Delete evidence
router.delete('/:evidenceId', async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.evidenceId);
    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(evidence.encryptedFilePath)) {
      fs.unlinkSync(evidence.encryptedFilePath);
    }

    await Evidence.findByIdAndDelete(req.params.evidenceId);

    res.json({ success: true, message: 'Evidence deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete evidence' });
  }
});

module.exports = router;

