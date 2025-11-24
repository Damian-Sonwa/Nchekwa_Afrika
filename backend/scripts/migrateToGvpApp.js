const { MongoClient } = require('mongodb');
require('dotenv').config();

// Get base URI
const baseUri = process.env.MONGODB_URI.split('?')[0];
const queryParams = process.env.MONGODB_URI.split('?')[1] || 'retryWrites=true&w=majority&appName=Cluster0';

// Remove database name if present and add gvp_app
const uriWithoutDb = baseUri.split('/').slice(0, -1).join('/');
const OLD_DB_URI = `${uriWithoutDb}/test?${queryParams}`;
const NEW_DB_URI = `${uriWithoutDb}/gvp_app?${queryParams}`;

const collectionsToMigrate = [
  'users',
  'resources',
  'safetyplans',
  'evidences',
  'chatsessions',
  'messages',
  'sosalerts'
];

async function migrateToGvpApp() {
  let oldClient, newClient;

  try {
    console.log('🔌 Connecting to databases...');
    console.log('Old DB:', OLD_DB_URI.replace(/:[^:@]+@/, ':****@'));
    console.log('New DB:', NEW_DB_URI.replace(/:[^:@]+@/, ':****@'));
    console.log('');
    
    // Connect to old database (test)
    oldClient = new MongoClient(OLD_DB_URI);
    await oldClient.connect();
    const oldDb = oldClient.db('test');
    console.log('✅ Connected to test database');

    // Connect to new database (gvp_app)
    newClient = new MongoClient(NEW_DB_URI);
    await newClient.connect();
    const newDb = newClient.db('gvp_app');
    console.log('✅ Connected to gvp_app database\n');

    // Check what exists in test
    console.log('📊 Checking test database...');
    for (const collectionName of collectionsToMigrate) {
      const count = await oldDb.collection(collectionName).countDocuments();
      if (count > 0) {
        console.log(`   ${collectionName}: ${count} documents`);
      }
    }
    console.log('');

    // Migrate each collection
    let totalMigrated = 0;
    for (const collectionName of collectionsToMigrate) {
      try {
        const oldCollection = oldDb.collection(collectionName);
        const newCollection = newDb.collection(collectionName);

        const count = await oldCollection.countDocuments();
        
        if (count > 0) {
          console.log(`📦 Migrating ${collectionName}...`);
          const documents = await oldCollection.find({}).toArray();
          
          // Clear existing data in new collection
          await newCollection.deleteMany({});
          
          // Insert documents
          if (documents.length > 0) {
            await newCollection.insertMany(documents);
            console.log(`   ✅ Migrated ${documents.length} documents`);
            totalMigrated += documents.length;
          }
        } else {
          console.log(`   ⏭️  ${collectionName} is empty, skipping`);
        }
      } catch (error) {
        console.log(`   ⚠️  Error migrating ${collectionName}:`, error.message);
      }
    }

    // Create indexes on new database
    console.log('\n📇 Creating indexes on gvp_app database...');
    await createIndexes(newDb);
    console.log('✅ Indexes created');

    // Verify migration
    console.log('\n📊 Migration Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (const collectionName of collectionsToMigrate) {
      const oldCount = await oldDb.collection(collectionName).countDocuments();
      const newCount = await newDb.collection(collectionName).countDocuments();
      const status = oldCount === newCount ? '✅' : '⚠️';
      console.log(`   ${status} ${collectionName}: ${oldCount} → ${newCount} documents`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n✅ Migration complete! Total documents migrated: ${totalMigrated}`);

  } catch (error) {
    console.error('\n❌ Migration error:', error.message);
    if (error.message.includes('authentication')) {
      console.error('\n💡 Authentication failed. Check your credentials in .env');
    }
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
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }
}

migrateToGvpApp()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


