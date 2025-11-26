const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Force load .env from backend directory (override system env vars)
// First, delete any existing MONGODB_URI from system env to ensure .env takes precedence
if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('cmiunlp')) {
  delete process.env.MONGODB_URI;
}

const envResult = require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

if (envResult.error) {
  console.warn('⚠️  Could not load .env file:', envResult.error.message);
} else {
  console.log('✅ Loaded .env file from:', path.join(__dirname, '.env'));
}

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gvp_app';

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env file!');
  process.exit(1);
}

console.log('🔌 Connecting to MongoDB...');
console.log('URI:', mongoUri.replace(/:[^:@]+@/, ':****@'));

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  const dbName = mongoose.connection.db.databaseName;
  console.log('✅ MongoDB connected');
  console.log(`📊 Database: ${dbName}`);
  
  if (dbName !== 'gvp_app') {
    console.warn(`⚠️  WARNING: Connected to "${dbName}" instead of "gvp_app"`);
    console.warn('   Check your MONGODB_URI in .env file');
  }
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('💡 Check your MONGODB_URI in .env file');
  console.error('   Current URI:', mongoUri.replace(/:[^:@]+@/, ':****@'));
  process.exit(1);
});

// Static file serving for uploads
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/sos', require('./routes/sos'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/shelters', require('./routes/shelters'));
app.use('/api/safety-plans', require('./routes/safetyPlans'));
app.use('/api/evidence', require('./routes/evidence'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/mood', require('./routes/mood'));
app.use('/api/legal', require('./routes/legal'));
app.use('/api/emotional-checkin', require('./routes/emotionalCheckin'));
app.use('/api/community', require('./routes/community'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket.IO for real-time chat
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST']
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-chat', (sessionId) => {
    socket.join(sessionId);
  });

  socket.on('chat-message', (data) => {
    io.to(data.sessionId).emit('chat-message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

module.exports = { app, io };

