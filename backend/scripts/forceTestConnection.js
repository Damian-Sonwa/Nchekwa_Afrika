// Force load .env from current directory with override
const path = require('path');

// Unset system MONGODB_URI first, then load .env
delete process.env.MONGODB_URI;

// Now load .env with override
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });

const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB Connection (Forced .env load)...\n');
    console.log('Current working directory:', process.cwd());
    console.log('.env file path:', path.join(__dirname, '../.env'));
    console.log('');
    
    console.log('Environment Variables:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const mongoUri = process.env.MONGODB_URI;
    console.log('MONGODB_URI:', mongoUri ? mongoUri.replace(/:[^:@]+@/, ':****@') : 'NOT SET');
    console.log('PORT:', process.env.PORT || 'NOT SET');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (!mongoUri) {
      console.error('❌ MONGODB_URI is not set!');
      console.error('💡 Make sure .env file exists in backend/ directory');
      process.exit(1);
    }

    // Extract database name
    const dbName = mongoUri.split('/').pop().split('?')[0];
    console.log(`📊 Attempting to connect to database: "${dbName}"\n`);

    // Check if URI contains the correct cluster
    if (mongoUri.includes('cmiunlp.mongodb.net')) {
      console.log('✅ Connection string points to correct cluster (cmiunlp)\n');
    } else if (mongoUri.includes('c2havli.mongodb.net')) {
      console.log('⚠️  WARNING: Connection string points to different cluster (c2havli)\n');
    }

    console.log('🔌 Connecting...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected successfully!');
    console.log(`📊 Connected to database: ${mongoose.connection.db.databaseName}`);
    console.log(`🌐 Host: ${mongoose.connection.host}\n`);

    // Check if it's the right database
    if (mongoose.connection.db.databaseName === 'gvp_app') {
      console.log('✅ Connected to correct database: gvp_app\n');
    } else {
      console.log(`⚠️  WARNING: Connected to "${mongoose.connection.db.databaseName}" instead of "gvp_app"\n`);
    }

    // Check collections
    const resourcesCount = await mongoose.connection.db.collection('resources').countDocuments();
    const usersCount = await mongoose.connection.db.collection('users').countDocuments();
    
    console.log(`📊 Data Status:`);
    console.log(`   Resources: ${resourcesCount} documents`);
    console.log(`   Users: ${usersCount} documents`);
    
    if (resourcesCount > 0 && usersCount > 0) {
      console.log('\n✅ Data found! Connection is working correctly.');
    } else {
      console.log('\n⚠️  WARNING: No data found in gvp_app database!');
    }

    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection Error:', error.message);
    
    if (error.message.includes('authentication')) {
      console.error('\n💡 Authentication failed. Check username and password in .env');
      console.error('   Current URI:', process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@'));
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 Cannot resolve hostname. Check your connection string.');
    }
    
    process.exit(1);
  }
}

testConnection();

