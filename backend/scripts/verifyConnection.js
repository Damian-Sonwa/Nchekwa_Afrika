const mongoose = require('mongoose');
require('dotenv').config();

async function verifyConnection() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('Connection string:', process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@'));
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected successfully!');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📁 Collections (${collections.length}):`);
    for (const coll of collections) {
      const count = await mongoose.connection.db.collection(coll.name).countDocuments();
      console.log(`   - ${coll.name}: ${count} documents`);
    }

    // Check for our app collections
    const appCollections = ['users', 'resources', 'safetyplans', 'evidences', 'chatsessions', 'messages', 'sosalerts'];
    console.log(`\n✅ App Collections Status:`);
    for (const collName of appCollections) {
      const exists = collections.some(c => c.name === collName);
      console.log(`   ${exists ? '✅' : '❌'} ${collName}`);
    }

    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }
}

verifyConnection();


