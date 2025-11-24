@echo off
echo 🚀 Setting up GBV Survivor Support App...
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    exit /b 1
)

echo ✅ Node.js found
node --version

REM Install backend dependencies
echo.
echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..

REM Install mobile dependencies
echo.
echo 📦 Installing mobile dependencies...
cd mobile
call npm install
cd ..

REM Create .env file if it doesn't exist
if not exist backend\.env (
    echo.
    echo 📝 Creating .env file...
    copy backend\.env.example backend\.env
    echo ⚠️  Please update backend\.env with your configuration
)

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Update backend\.env with your MongoDB URI and secrets
echo 2. Start MongoDB (if local) or configure MongoDB Atlas
echo 3. Start backend: cd backend ^&^& npm run dev
echo 4. Start mobile app: cd mobile ^&^& npm start
echo.
echo For more information, see README.md

pause


