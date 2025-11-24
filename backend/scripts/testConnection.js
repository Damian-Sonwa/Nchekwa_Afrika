const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB Connection...\n');
    console.log('Environment Variables:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('MONGODB_URI:', process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@') || 'NOT SET');
    console.log('PORT:', process.env.PORT || 'NOT SET');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set in .env file!');
      process.exit(1);
    }

    // Extract database name from URI
    const dbName = process.env.MONGODB_URI.split('/').pop().split('?')[0];
    console.log(`📊 Attempting to connect to database: "${dbName}"\n`);

    console.log('🔌 Connecting...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected successfully!');
    console.log(`📊 Connected to database: ${mongoose.connection.db.databaseName}`);
    console.log(`🌐 Host: ${mongoose.connection.host}\n`);

    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📦 Collections found (${collections.length}):`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const appCollections = ['users', 'resources', 'safetyplans', 'evidences', 'chatsessions', 'messages', 'sosalerts'];
    let foundAppCollections = 0;
    
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      const isAppCollection = appCollections.includes(collection.name);
      if (isAppCollection) foundAppCollections++;
      
      console.log(`  ${collection.name.padEnd(20)} : ${count} docs ${isAppCollection ? '✅' : ''}`);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n✅ Found ${foundAppCollections} app collections`);
    
    // Check if we have data
    const resourcesCount = await mongoose.connection.db.collection('resources').countDocuments();
    const usersCount = await mongoose.connection.db.collection('users').countDocuments();
    
    console.log(`\n📊 Data Status:`);
    console.log(`   Resources: ${resourcesCount} documents`);
    console.log(`   Users: ${usersCount} documents`);
    
    if (resourcesCount === 0 && usersCount === 0) {
      console.log('\n⚠️  WARNING: No data found in app collections!');
      console.log('   The app might be connected to an empty database.');
    } else {
      console.log('\n✅ Data found! Connection is working correctly.');
    }

    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection Error:', error.message);
    
    if (error.message.includes('authentication')) {
      console.error('\n💡 Authentication failed. Check your username and password in .env');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 Cannot resolve hostname. Check your connection string.');
    } else if (error.message.includes('bad auth')) {
      console.error('\n💡 Invalid credentials. Check your username and password.');
    } else {
      console.error('\n💡 Full error:', error);
    }
    
    process.exit(1);
  }
}

testConnection();


