/**
 * Script to fix users who have emailHash but no passwordHash
 * 
 * This can happen if:
 * - User was created via social login first
 * - User registration failed partway through
 * - Database inconsistency
 * 
 * Run this script to identify and optionally fix these users.
 */

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function fixUsersWithoutPasswords() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI is not set in .env file!');
      process.exit(1);
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Find users with emailHash but no passwordHash
    const usersWithoutPasswords = await User.find({
      emailHash: { $exists: true, $ne: null },
      passwordHash: { $exists: false }
    });

    console.log(`\n📊 Found ${usersWithoutPasswords.length} user(s) with email but no password:`);

    if (usersWithoutPasswords.length > 0) {
      usersWithoutPasswords.forEach((user, index) => {
        console.log(`\n${index + 1}. User ID: ${user._id}`);
        console.log(`   Anonymous ID: ${user.anonymousId}`);
        console.log(`   Email Hash: ${user.emailHash?.substring(0, 16)}...`);
        console.log(`   Has Google ID: ${user.googleId ? 'Yes' : 'No'}`);
        console.log(`   Has Fingerprint ID: ${user.fingerprintId ? 'Yes' : 'No'}`);
        console.log(`   Created: ${user.createdAt}`);
      });

      console.log('\n💡 These users can:');
      console.log('   - Register again with the same email to set a password');
      console.log('   - Use social login if they have googleId or fingerprintId');
      console.log('   - Or you can delete these users if they are test accounts');
    } else {
      console.log('\n✅ All users with email have passwords set!');
    }

    // Optionally delete users without passwords (uncomment if needed)
    // if (usersWithoutPasswords.length > 0) {
    //   const result = await User.deleteMany({
    //     emailHash: { $exists: true, $ne: null },
    //     passwordHash: { $exists: false }
    //   });
    //   console.log(`\n🗑️  Deleted ${result.deletedCount} user(s) without passwords`);
    // }

    await mongoose.disconnect();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixUsersWithoutPasswords();


