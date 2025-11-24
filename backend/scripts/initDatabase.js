const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/User');
const Resource = require('../models/Resource');
const SafetyPlan = require('../models/SafetyPlan');
const Evidence = require('../models/Evidence');
const ChatSession = require('../models/ChatSession');
const Message = require('../models/Message');
const SOSAlert = require('../models/SOSAlert');

// Force load .env with override
delete process.env.MONGODB_URI;
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });

const africanHelplines = require('../data/africanHelplines');

const sampleResources = africanHelplines;

async function initDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    // Verify it's the correct database
    const dbName = mongoUri.split('/').pop().split('?')[0];
    if (dbName !== 'gvp_app') {
      console.warn(`⚠️  WARNING: Connection string points to "${dbName}" instead of "gvp_app"`);
    }

    console.log(`📊 Connecting to database: ${dbName}`);
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);

    // Drop existing collections (optional - comment out if you want to keep existing data)
    console.log('\n🗑️  Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Resource.deleteMany({}),
      SafetyPlan.deleteMany({}),
      Evidence.deleteMany({}),
      ChatSession.deleteMany({}),
      Message.deleteMany({}),
      SOSAlert.deleteMany({}),
    ]);
    console.log('✅ Collections cleared');

    // Create indexes (drop existing first to avoid conflicts)
    console.log('\n📇 Creating indexes...');
    try {
      // Drop existing indexes
      await User.collection.dropIndexes().catch(() => {});
      await ChatSession.collection.dropIndexes().catch(() => {});
      await Message.collection.dropIndexes().catch(() => {});
      await Resource.collection.dropIndexes().catch(() => {});
      await SafetyPlan.collection.dropIndexes().catch(() => {});
      await Evidence.collection.dropIndexes().catch(() => {});
      await SOSAlert.collection.dropIndexes().catch(() => {});
    } catch (error) {
      // Ignore errors if no indexes exist
    }

    // Create indexes
    await User.collection.createIndex({ anonymousId: 1 }, { unique: true });
    await User.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days
    await ChatSession.collection.createIndex({ sessionId: 1 }, { unique: true });
    await ChatSession.collection.createIndex({ anonymousId: 1 });
    await ChatSession.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days
    await Message.collection.createIndex({ sessionId: 1, createdAt: -1 });
    await Message.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days
    await Resource.collection.createIndex({ category: 1, 'location.country': 1 });
    await Resource.collection.createIndex({ verified: 1 });
    await SafetyPlan.collection.createIndex({ anonymousId: 1 });
    await SafetyPlan.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days
    await Evidence.collection.createIndex({ anonymousId: 1 });
    await Evidence.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days
    await SOSAlert.collection.createIndex({ status: 1, timestamp: -1 });
    await SOSAlert.collection.createIndex({ anonymousId: 1 });
    await SOSAlert.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 604800 }); // 7 days
    console.log('✅ Indexes created');

    // Insert sample resources
    console.log('\n📚 Inserting sample resources...');
    const insertedResources = await Resource.insertMany(sampleResources);
    console.log(`✅ Inserted ${insertedResources.length} resources`);

    // Create a sample anonymous user (for testing)
    console.log('\n👤 Creating sample user...');
    const sampleUser = new User({
      anonymousId: 'sample_user_' + Date.now(),
      deviceId: 'sample_device',
    });
    await sampleUser.save();
    console.log(`✅ Created sample user: ${sampleUser.anonymousId}`);

    // Display collection stats
    console.log('\n📊 Database Statistics:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`  ${collection.name.padEnd(20)} : ${count} documents`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n✅ Database initialization complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the backend server: npm run dev');
    console.log('   2. Start the mobile app: cd ../mobile && npm start');
    console.log('   3. Test the API endpoints');

    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error initializing database:', error);
    if (error.message.includes('authentication')) {
      console.error('\n💡 Tip: Check your MongoDB credentials in .env file');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Tip: Check your MongoDB connection string and network access');
    }
    process.exit(1);
  }
}

// Run the initialization
initDatabase();

