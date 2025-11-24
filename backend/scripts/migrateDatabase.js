const { MongoClient } = require('mongodb');
require('dotenv').config();

// Get base URI without database name
const baseUri = process.env.MONGODB_URI.split('?')[0].split('/').slice(0, -1).join('/');
const queryParams = process.env.MONGODB_URI.split('?')[1] || '';
const OLD_DB_URI = `${baseUri}/test?${queryParams}`;
const NEW_DB_URI = `${baseUri}/gvp_app?${queryParams}`;

const collectionsToMigrate = [
  'users',
  'resources',
  'safetyplans',
  'evidences',
  'chatsessions',
  'messages',
  'sosalerts'
];

async function migrateDatabase() {
  let oldClient, newClient;

  try {
    console.log('🔌 Connecting to databases...');
    
    // Connect to old database (test)
    oldClient = new MongoClient(OLD_DB_URI);
    await oldClient.connect();
    const oldDb = oldClient.db('test');
    console.log('✅ Connected to old database (test)');

    // Connect to new database (gvp_app)
    newClient = new MongoClient(NEW_DB_URI);
    await newClient.connect();
    const newDb = newClient.db('gvp_app');
    console.log('✅ Connected to new database (gvp_app)');

    // Migrate each collection
    for (const collectionName of collectionsToMigrate) {
      try {
        const oldCollection = oldDb.collection(collectionName);
        const newCollection = newDb.collection(collectionName);

        const count = await oldCollection.countDocuments();
        
        if (count > 0) {
          console.log(`\n📦 Migrating ${collectionName}...`);
          const documents = await oldCollection.find({}).toArray();
          
          if (documents.length > 0) {
            // Clear existing data in new collection
            await newCollection.deleteMany({});
            // Insert documents
            await newCollection.insertMany(documents);
            console.log(`   ✅ Migrated ${documents.length} documents`);
          }
        } else {
          console.log(`   ⏭️  ${collectionName} is empty, skipping`);
        }
      } catch (error) {
        console.log(`   ⚠️  Error migrating ${collectionName}:`, error.message);
      }
    }

    // Create indexes on new database
    console.log('\n📇 Creating indexes on new database...');
    await createIndexes(newDb);
    console.log('✅ Indexes created');

    // Verify migration
    console.log('\n📊 Migration Summary:');
    for (const collectionName of collectionsToMigrate) {
      const oldCount = await oldDb.collection(collectionName).countDocuments();
      const newCount = await newDb.collection(collectionName).countDocuments();
      console.log(`   ${collectionName}: ${oldCount} → ${newCount} documents`);
    }

    console.log('\n✅ Migration complete!');
    console.log('\n⚠️  Next step: Delete the test database manually from MongoDB Atlas if desired.');

  } catch (error) {
    console.error('\n❌ Migration error:', error);
    throw error;
  } finally {
    if (oldClient) await oldClient.close();
    if (newClient) await newClient.close();
    console.log('\n🔌 Connections closed');
  }
}

async function createIndexes(db) {
  try {
    // Users indexes
    await db.collection('users').createIndex({ anonymousId: 1 }, { unique: true });
    await db.collection('users').createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

    // ChatSession indexes
    await db.collection('chatsessions').createIndex({ sessionId: 1 }, { unique: true });
    await db.collection('chatsessions').createIndex({ anonymousId: 1 });
    await db.collection('chatsessions').createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

    // Message indexes
    await db.collection('messages').createIndex({ sessionId: 1, createdAt: -1 });
    await db.collection('messages').createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

    // Resource indexes
    await db.collection('resources').createIndex({ category: 1, 'location.country': 1 });
    await db.collection('resources').createIndex({ verified: 1 });

    // SafetyPlan indexes
    await db.collection('safetyplans').createIndex({ anonymousId: 1 });
    await db.collection('safetyplans').createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

    // Evidence indexes
    await db.collection('evidences').createIndex({ anonymousId: 1 });
    await db.collection('evidences').createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

    // SOSAlert indexes
    await db.collection('sosalerts').createIndex({ status: 1, timestamp: -1 });
    await db.collection('sosalerts').createIndex({ anonymousId: 1 });
    await db.collection('sosalerts').createIndex({ createdAt: 1 }, { expireAfterSeconds: 604800 });
  } catch (error) {
    // Some indexes might already exist, that's okay
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }
}

migrateDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
