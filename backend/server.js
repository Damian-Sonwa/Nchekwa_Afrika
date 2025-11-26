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

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()).filter(Boolean) || ['*'];
console.log('🌐 Allowed CORS origins:', allowedOrigins);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // If ALLOWED_ORIGINS is set to '*', allow all origins
    if (allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('⚠️  Blocked CORS request from origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
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

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'GBV App API',
    version: '1.0.0',
    status: 'running',
    baseUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
    endpoints: {
      health: {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint'
      },
      apiInfo: {
        method: 'GET',
        path: '/api',
        description: 'API information and available endpoints'
      },
      auth: {
        base: '/api/auth',
        endpoints: {
          anonymous: {
            method: 'POST',
            path: '/api/auth/anonymous',
            description: 'Create anonymous session',
            body: { deviceId: 'string (optional)' }
          },
          login: {
            method: 'POST',
            path: '/api/auth/login',
            description: 'Login with email and password',
            body: { email: 'string', password: 'string' }
          },
          register: {
            method: 'POST',
            path: '/api/auth/register',
            description: 'Register new user with email and password',
            body: { email: 'string', password: 'string' }
          },
          social: {
            method: 'POST',
            path: '/api/auth/social',
            description: 'Social login (Google/Apple)',
            body: { provider: 'google|apple', providerId: 'string', email: 'string (optional)' }
          },
          forgotPassword: {
            method: 'POST',
            path: '/api/auth/forgot-password',
            description: 'Request password reset email',
            body: { email: 'string' }
          },
          resetPasswordGet: {
            method: 'GET',
            path: '/api/auth/reset-password?token=TOKEN',
            description: 'Validate reset password token'
          },
          resetPasswordPost: {
            method: 'POST',
            path: '/api/auth/reset-password',
            description: 'Reset password with token',
            body: { token: 'string', newPassword: 'string' }
          },
          confirmEmailGet: {
            method: 'GET',
            path: '/api/auth/confirm-email?token=TOKEN',
            description: 'Confirm email with token from URL'
          },
          confirmEmailPost: {
            method: 'POST',
            path: '/api/auth/confirm-email',
            description: 'Confirm email with token in body',
            body: { token: 'string' }
          },
          resendConfirmation: {
            method: 'POST',
            path: '/api/auth/resend-confirmation',
            description: 'Resend email confirmation link',
            body: { email: 'string' }
          },
          testEmail: {
            method: 'GET',
            path: '/api/auth/test-email?testEmail=EMAIL',
            description: 'Test email configuration'
          }
        }
      },
      sos: '/api/sos',
      chat: '/api/chat',
      resources: '/api/resources',
      shelters: '/api/shelters',
      safetyPlans: '/api/safety-plans',
      evidence: '/api/evidence',
      user: '/api/user',
      settings: '/api/settings',
      mood: '/api/mood',
      legal: '/api/legal',
      emotionalCheckin: '/api/emotional-checkin',
      community: '/api/community'
    },
    note: 'Most endpoints require POST method. Use GET only for /api, /health, /api/auth/reset-password?token=..., /api/auth/confirm-email?token=..., and /api/auth/test-email'
  });
});

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

// Catch-all for undefined API routes - provide helpful error message
// This must be AFTER all route definitions
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.path}`,
    suggestion: 'Check the API documentation at GET /api for available endpoints',
    availableEndpoints: {
      info: 'GET /api - View all available endpoints',
      health: 'GET /health - Health check',
      auth: {
        base: 'GET /api/auth - View auth endpoints',
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password',
        confirmEmail: 'POST /api/auth/confirm-email',
        resendConfirmation: 'POST /api/auth/resend-confirmation',
        testEmail: 'GET /api/auth/test-email'
      }
    },
    tip: 'Most endpoints require POST method. Only /api, /health, /api/auth, /api/auth/test-email, /api/auth/reset-password?token=..., and /api/auth/confirm-email?token=... support GET.'
  });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket.IO for real-time chat
// Socket.IO CORS configuration - use array format for better compatibility
const socketIOOrigins = allowedOrigins.includes('*') 
  ? '*' 
  : allowedOrigins.length > 0 
    ? allowedOrigins 
    : '*';

console.log('🔌 Socket.IO allowed origins:', socketIOOrigins);

const io = require('socket.io')(server, {
  cors: {
    origin: socketIOOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  allowEIO3: true, // Allow Engine.IO v3 clients for better compatibility
  pingTimeout: 60000, // 60 seconds - time to wait for pong before considering connection dead
  pingInterval: 25000, // 25 seconds - interval between pings
  transports: ['websocket', 'polling'], // Allow both transports
  upgrade: true, // Allow transport upgrades
  rememberUpgrade: false // Don't remember upgrade preference
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);
  console.log('🔌 Transport:', socket.conn.transport.name);

  socket.on('join-chat', (sessionId) => {
    console.log('📝 User joining chat session:', sessionId);
    socket.join(sessionId);
    // Send confirmation that user joined
    socket.emit('joined-chat', { sessionId, success: true });
  });

  socket.on('chat-message', (data) => {
    console.log('💬 Chat message received for session:', data.sessionId);
    io.to(data.sessionId).emit('chat-message', data);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ User disconnected:', socket.id, 'Reason:', reason);
  });

  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });

  // Handle ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

module.exports = { app, io };

