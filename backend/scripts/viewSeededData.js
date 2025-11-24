const mongoose = require('mongoose');
const path = require('path');

// Force load .env with override
delete process.env.MONGODB_URI;
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });

async function viewSeededData() {
  try {
    console.log('📊 Viewing seeded data...\n');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection.db;

    // Resources
    console.log('📚 Resources:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const resources = await db.collection('resources').find({}).toArray();
    resources.forEach((r, i) => {
      console.log(`${i + 1}. ${r.title}`);
      console.log(`   Category: ${r.category} | Phone: ${r.contactInfo?.phone || 'N/A'}`);
    });
    console.log(`\nTotal: ${resources.length} resources\n`);

    // Users
    console.log('👤 Users:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const users = await db.collection('users').find({}).toArray();
    users.forEach((u, i) => {
      console.log(`${i + 1}. Anonymous ID: ${u.anonymousId}`);
      console.log(`   Created: ${new Date(u.createdAt).toLocaleString()}`);
    });
    console.log(`\nTotal: ${users.length} users\n`);

    // Safety Plans
    console.log('🛡️  Safety Plans:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const plans = await db.collection('safetyplans').find({}).toArray();
    plans.forEach((p, i) => {
      console.log(`${i + 1}. ${p.planName}`);
      console.log(`   Steps: ${p.steps?.length || 0} | Contacts: ${p.emergencyContacts?.length || 0} | Safe Places: ${p.safePlaces?.length || 0}`);
    });
    console.log(`\nTotal: ${plans.length} safety plans\n`);

    // Chat Sessions
    console.log('💬 Chat Sessions:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const sessions = await db.collection('chatsessions').find({}).toArray();
    sessions.forEach((s, i) => {
      console.log(`${i + 1}. Session ID: ${s.sessionId}`);
      console.log(`   Status: ${s.status} | User: ${s.anonymousId}`);
    });
    console.log(`\nTotal: ${sessions.length} chat sessions\n`);

    // Messages
    console.log('📨 Messages:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const messages = await db.collection('messages').find({}).toArray();
    messages.forEach((m, i) => {
      console.log(`${i + 1}. [${m.senderType}] ${m.content.substring(0, 50)}...`);
    });
    console.log(`\nTotal: ${messages.length} messages\n`);

    await mongoose.connection.close();
    console.log('✅ Data verification complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

viewSeededData();


