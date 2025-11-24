#!/bin/bash

echo "🚀 Setting up GBV Survivor Support App..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found locally. Make sure you have MongoDB Atlas or local MongoDB running."
fi

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install mobile dependencies
echo ""
echo "📦 Installing mobile dependencies..."
cd mobile
npm install
cd ..

# Create .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please update backend/.env with your configuration"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your MongoDB URI and secrets"
echo "2. Start MongoDB (if local) or configure MongoDB Atlas"
echo "3. Start backend: cd backend && npm run dev"
echo "4. Start mobile app: cd mobile && npm start"
echo ""
echo "For more information, see README.md"


