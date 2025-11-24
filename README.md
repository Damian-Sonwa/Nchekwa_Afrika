# GBV Survivor Support Web Application

A comprehensive, privacy-first web application designed to support survivors of Gender-Based Violence (GBV) with safety, resources, and anonymous support.

## Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Socket.IO Client** for real-time chat
- **Crypto-JS** for encryption

### Backend
- **Node.js** + **Express**
- **MongoDB** (Mongoose)
- **Socket.IO** for real-time communication
- **Helmet** for security
- **Express Rate Limit** for API protection

## Features

- ✅ **SOS Button**: Emergency alert with location sharing
- ✅ **Anonymous Chat**: Encrypted chat with trained counselors
- ✅ **Resource Directory**: Searchable database of support services
- ✅ **Safety Plan Builder**: Create personalized safety plans
- ✅ **Evidence Vault**: Encrypted storage for photos and documents
- ✅ **Education Hub**: Information about GBV, rights, and recovery
- ✅ **Quick Exit**: Instant app closure for safety
- ✅ **Decoy Mode**: Disguise the app's true purpose
- ✅ **Auto-Delete**: Automatic data expiration for privacy
- ✅ **Mobile Responsive**: Beautiful UI that works on all devices

## Project Structure

```
GBV_APP/
├── backend/          # Node.js API server
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API endpoints
│   ├── scripts/      # Database scripts
│   └── server.js     # Express server
├── frontend/         # React web application
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── components/ # Reusable components
│   │   ├── services/ # API & Socket services
│   │   └── context/  # React Context
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=3000
MONGODB_URI=mongodb+srv://damian:sopuluchi@cluster0.cmiunlp.mongodb.net/gvp_app?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-character-encryption-key
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:5173
```

4. Initialize database:
```bash
npm run init-db
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser:
```
http://localhost:5173
```

## Database

The application uses MongoDB Atlas with the database name `gvp_app`.

### Collections:
- `users` - Anonymous user accounts (auto-delete after 90 days)
- `resources` - Support resources directory
- `safetyplans` - User safety plans (auto-delete after 90 days)
- `evidences` - Encrypted evidence files (auto-delete after 90 days)
- `chatsessions` - Chat sessions (auto-delete after 30 days)
- `messages` - Chat messages (auto-delete after 30 days)
- `sosalerts` - SOS emergency alerts (auto-delete after 7 days)

## API Endpoints

### Authentication
- `POST /api/auth/anonymous` - Create anonymous session

### SOS
- `POST /api/sos` - Send SOS alert

### Chat
- `POST /api/chat/start` - Start chat session
- `POST /api/chat/send` - Send message
- `GET /api/chat/:sessionId/messages` - Get messages

### Resources
- `GET /api/resources` - Get resources (with filters)

### Safety Plans
- `GET /api/safety-plans/:anonymousId` - Get user's plans
- `POST /api/safety-plans` - Create/update plan

### Evidence
- `GET /api/evidence/:anonymousId` - Get user's evidence
- `POST /api/evidence/upload` - Upload evidence
- `DELETE /api/evidence/:evidenceId` - Delete evidence

### User
- `POST /api/user/wipe` - Delete all user data

## Security Features

- **Client-Side Encryption**: All sensitive data encrypted before storage
- **Secure Storage**: Data stored in browser localStorage (encrypted)
- **HTTPS/TLS**: All API communication encrypted
- **Auto-Expiration**: Data automatically deleted after retention period
- **No Personal Info**: No personal information collected
- **Quick Wipe**: Delete all data instantly

## Development

### Run both servers:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Build for production:
```bash
cd frontend
npm run build
```

## Important Notes

⚠️ **CRITICAL**: This app handles sensitive information. Always prioritize:
1. User safety and privacy
2. Data security
3. Trauma-informed design
4. Accessibility

## License

MIT License

---

**Status**: ✅ Ready for development and testing
