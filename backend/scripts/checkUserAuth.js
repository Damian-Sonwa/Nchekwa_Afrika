/**
 * Diagnostic script to check user authentication status
 * 
 * Checks all users and their authentication methods
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const crypto = require('crypto');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const hashEmail = (email) => {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
};

async function checkUserAuth() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI is not set in .env file!');
      process.exit(1);
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB\n');

    // Get email from command line argument
    const email = process.argv[2];
    
    if (email) {
      // Check specific email
      const emailHash = hashEmail(email);
      console.log(`🔍 Checking user with email: ${email}`);
      console.log(`   Email Hash: ${emailHash}\n`);
      
      const user = await User.findOne({ emailHash });
      
      if (!user) {
        console.log('❌ No user found with this email');
      } else {
        console.log('✅ User found:');
        console.log(`   ID: ${user._id}`);
        console.log(`   Anonymous ID: ${user.anonymousId}`);
        console.log(`   Has Email Hash: ${user.emailHash ? 'Yes' : 'No'}`);
        console.log(`   Has Password Hash: ${user.passwordHash ? 'Yes (' + user.passwordHash.length + ' chars)' : 'No'}`);
        console.log(`   Has Google ID: ${user.googleId ? 'Yes' : 'No'}`);
        console.log(`   Has Fingerprint ID: ${user.fingerprintId ? 'Yes' : 'No'}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Last Active: ${user.lastActive}`);
      }
    } else {
      // List all users with email
      const usersWithEmail = await User.find({
        emailHash: { $exists: true, $ne: null }
      });

      console.log(`📊 Found ${usersWithEmail.length} user(s) with email:\n`);

      usersWithEmail.forEach((user, index) => {
        console.log(`${index + 1}. User ID: ${user._id}`);
        console.log(`   Anonymous ID: ${user.anonymousId}`);
        console.log(`   Email Hash: ${user.emailHash?.substring(0, 16)}...`);
        console.log(`   Has Password: ${user.passwordHash ? 'Yes' : 'No'}`);
        console.log(`   Has Google ID: ${user.googleId ? 'Yes' : 'No'}`);
        console.log(`   Has Fingerprint ID: ${user.fingerprintId ? 'Yes' : 'No'}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('');
      });
    }

    await mongoose.disconnect();
    console.log('✅ Done');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUserAuth();


