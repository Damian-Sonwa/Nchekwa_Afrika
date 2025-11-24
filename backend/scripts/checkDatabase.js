const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkDatabase() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('Connection string:', process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@'));
    
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // List all databases
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    
    console.log('📊 Available Databases:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    databases.databases.forEach(db => {
      console.log(`  - ${db.name}: ${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check gvp_app database
    const dbName = process.env.MONGODB_URI.split('/').pop().split('?')[0];
    console.log(`📁 Checking database: ${dbName}`);
    
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('⚠️  No collections found in this database!\n');
      console.log('💡 The database might be empty or the connection string is pointing to a different database.');
    } else {
      console.log(`\n📦 Collections found (${collections.length}):`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`  ${collection.name.padEnd(20)} : ${count} documents`);
        
        // Show sample documents for resources
        if (collection.name === 'resources' && count > 0) {
          const sample = await db.collection(collection.name).findOne();
          console.log(`    Sample: ${sample?.title || 'N/A'}`);
        }
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // Check test database
    console.log('📁 Checking test database:');
    const testDb = client.db('test');
    const testCollections = await testDb.listCollections().toArray();
    
    if (testCollections.length > 0) {
      console.log(`\n📦 Collections in test database (${testCollections.length}):`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      for (const collection of testCollections) {
        const count = await testDb.collection(collection.name).countDocuments();
        console.log(`  ${collection.name.padEnd(20)} : ${count} documents`);
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('💡 Data exists in test database. You may need to migrate it to gvp_app.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('authentication')) {
      console.error('\n💡 Authentication failed. Check your username and password.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 Cannot connect to MongoDB. Check your connection string and network.');
    }
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Connection closed');
    }
  }
}

checkDatabase();


