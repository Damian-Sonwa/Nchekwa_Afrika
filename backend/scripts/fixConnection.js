// This script will help identify and fix the connection issue
const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosing MongoDB Connection Issue...\n');

// Check .env file
const envPath = path.join(__dirname, '../.env');
console.log('1. Checking .env file:', envPath);

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const mongoMatch = envContent.match(/MONGODB_URI=(.+)/);
  
  if (mongoMatch) {
    const uri = mongoMatch[1].trim();
    console.log('   ✅ Found MONGODB_URI in .env');
    console.log('   URI:', uri.replace(/:[^:@]+@/, ':****@'));
    
    // Check if it has the correct database
    if (uri.includes('/gvp_app')) {
      console.log('   ✅ Contains /gvp_app database');
    } else {
      console.log('   ⚠️  Does NOT contain /gvp_app database');
    }
    
    // Check cluster
    if (uri.includes('cmiunlp.mongodb.net')) {
      console.log('   ✅ Points to correct cluster (cmiunlp)');
    } else {
      console.log('   ⚠️  Points to different cluster');
    }
  } else {
    console.log('   ❌ MONGODB_URI not found in .env');
  }
} else {
  console.log('   ❌ .env file does not exist!');
}

// Check system environment
console.log('\n2. Checking system environment variables:');
const systemMongoUri = process.env.MONGODB_URI;
if (systemMongoUri) {
  console.log('   ⚠️  System MONGODB_URI is set (this will override .env):');
  console.log('   URI:', systemMongoUri.replace(/:[^:@]+@/, ':****@'));
  console.log('\n   💡 SOLUTION: Unset the system variable or use override: true in dotenv.config()');
} else {
  console.log('   ✅ No system MONGODB_URI found');
}

// Test loading with override
console.log('\n3. Testing dotenv with override:');
require('dotenv').config({ path: envPath, override: true });
const loadedUri = process.env.MONGODB_URI;
console.log('   Loaded URI:', loadedUri ? loadedUri.replace(/:[^:@]+@/, ':****@') : 'NOT SET');

if (loadedUri && loadedUri.includes('/gvp_app') && loadedUri.includes('cmiunlp')) {
  console.log('   ✅ Correct connection string loaded!');
} else {
  console.log('   ❌ Still using wrong connection string');
  console.log('\n   💡 Try manually editing .env file or unsetting system variable');
}


