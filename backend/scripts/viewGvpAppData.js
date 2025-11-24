const { MongoClient } = require('mongodb');
require('dotenv').config();

async function viewGvpAppData() {
  let client;
  
  try {
    console.log('🔌 Connecting to gvp_app database...\n');
    
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db('gvp_app');
    
    console.log('📊 Collections in gvp_app database:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const collections = ['users', 'resources', 'safetyplans', 'evidences', 'chatsessions', 'messages', 'sosalerts'];
    
    for (const collectionName of collections) {
      const count = await db.collection(collectionName).countDocuments();
      console.log(`  ${collectionName.padEnd(20)} : ${count} documents`);
      
      if (count > 0) {
        const sample = await db.collection(collectionName).findOne();
        if (collectionName === 'resources') {
          console.log(`    → Sample: "${sample.title}" (${sample.category})`);
        } else if (collectionName === 'users') {
          console.log(`    → Sample: anonymousId = ${sample.anonymousId}`);
        }
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Show all resources
    const resources = await db.collection('resources').find({}).toArray();
    if (resources.length > 0) {
      console.log('📚 Resources in database:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      resources.forEach((resource, index) => {
        console.log(`${index + 1}. ${resource.title}`);
        console.log(`   Category: ${resource.category}`);
        console.log(`   Phone: ${resource.contactInfo?.phone || 'N/A'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Connection closed');
    }
  }
}

viewGvpAppData();


