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

const sampleResources = [
  {
    title: 'National GBV Helpline',
    category: 'helpline',
    description: '24/7 confidential support and crisis intervention for survivors of gender-based violence. Trained counselors available around the clock.',
    contactInfo: {
      phone: '1-800-799-7233',
      email: 'support@gbvhelpline.org',
      website: 'https://www.gbvhelpline.org',
    },
    location: {
      country: 'USA',
      region: 'National',
    },
    available24h: true,
    languages: ['English', 'Spanish', 'French'],
    verified: true,
  },
  {
    title: 'Safe Haven Emergency Shelter',
    category: 'shelter',
    description: 'Emergency shelter and transitional housing for survivors and their children. Safe, confidential, and supportive environment.',
    contactInfo: {
      phone: '1-800-555-0100',
      email: 'info@safehaven.org',
      address: '123 Safety Street, City, State 12345',
      website: 'https://www.safehaven.org',
    },
    location: {
      country: 'USA',
      region: 'State',
      coordinates: {
        lat: 40.7128,
        lng: -74.0060,
      },
    },
    available24h: true,
    languages: ['English', 'Spanish'],
    verified: true,
  },
  {
    title: 'Legal Aid Services',
    category: 'legal',
    description: 'Free legal assistance for protection orders, custody matters, immigration issues, and other legal concerns. Confidential consultations available.',
    contactInfo: {
      phone: '1-800-555-0200',
      email: 'legal@legalaid.org',
      website: 'https://www.legalaid.org',
      address: '456 Justice Avenue, City, State 12345',
    },
    location: {
      country: 'USA',
      region: 'State',
    },
    available24h: false,
    languages: ['English', 'Spanish', 'Mandarin'],
    verified: true,
  },
  {
    title: 'Medical Support Center',
    category: 'medical',
    description: 'Medical care, forensic examinations, and documentation services for survivors. Trauma-informed care provided by trained professionals.',
    contactInfo: {
      phone: '1-800-555-0300',
      address: '789 Health Boulevard, City, State 12345',
      website: 'https://www.medicalsupport.org',
    },
    location: {
      country: 'USA',
      region: 'State',
      coordinates: {
        lat: 40.7589,
        lng: -73.9851,
      },
    },
    available24h: true,
    languages: ['English'],
    verified: true,
  },
  {
    title: 'Trauma Counseling Services',
    category: 'counseling',
    description: 'Trauma-informed counseling and therapy for survivors and their families. Individual and group sessions available.',
    contactInfo: {
      phone: '1-800-555-0400',
      email: 'counseling@support.org',
      website: 'https://www.counseling.org',
      address: '321 Wellness Way, City, State 12345',
    },
    location: {
      country: 'USA',
      region: 'State',
    },
    available24h: false,
    languages: ['English', 'Spanish', 'French', 'Arabic'],
    verified: true,
  },
  {
    title: 'Crisis Text Line',
    category: 'helpline',
    description: '24/7 crisis support via text message. Text HOME to 741741 for immediate help. Completely confidential and anonymous.',
    contactInfo: {
      phone: 'Text HOME to 741741',
      website: 'https://www.crisistextline.org',
    },
    location: {
      country: 'USA',
      region: 'National',
    },
    available24h: true,
    languages: ['English', 'Spanish'],
    verified: true,
  },
  {
    title: 'Domestic Violence Hotline',
    category: 'helpline',
    description: 'National domestic violence hotline providing support, resources, and safety planning. Available 24/7.',
    contactInfo: {
      phone: '1-800-799-SAFE (7233)',
      email: 'help@thehotline.org',
      website: 'https://www.thehotline.org',
    },
    location: {
      country: 'USA',
      region: 'National',
    },
    available24h: true,
    languages: ['English', 'Spanish', '200+ languages via interpreter'],
    verified: true,
  },
  {
    title: 'Emergency Housing Program',
    category: 'shelter',
    description: 'Short-term and long-term housing assistance for survivors. Financial support and case management included.',
    contactInfo: {
      phone: '1-800-555-0500',
      email: 'housing@support.org',
      address: '555 Shelter Lane, City, State 12345',
    },
    location: {
      country: 'USA',
      region: 'State',
    },
    available24h: false,
    languages: ['English', 'Spanish'],
    verified: true,
  },
];

async function seedAllData() {
  try {
    console.log('🌱 Seeding database collections...\n');
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    const dbName = mongoUri.split('/').pop().split('?')[0];
    console.log(`📊 Connecting to database: ${dbName}\n`);

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Resource.deleteMany({}),
      SafetyPlan.deleteMany({}),
      Evidence.deleteMany({}),
      ChatSession.deleteMany({}),
      Message.deleteMany({}),
      SOSAlert.deleteMany({}),
    ]);
    console.log('✅ Collections cleared\n');

    // Seed Resources
    console.log('📚 Seeding resources...');
    const resources = await Resource.insertMany(sampleResources);
    console.log(`   ✅ Inserted ${resources.length} resources\n`);

    // Seed Sample User
    console.log('👤 Seeding sample user...');
    const sampleUser = new User({
      anonymousId: 'sample_user_' + Date.now(),
      deviceId: 'sample_device',
    });
    await sampleUser.save();
    console.log(`   ✅ Created user: ${sampleUser.anonymousId}\n`);

    // Seed Sample Safety Plan
    console.log('🛡️  Seeding sample safety plan...');
    const samplePlan = new SafetyPlan({
      anonymousId: sampleUser.anonymousId,
      planName: 'My Safety Plan',
      content: 'This is a sample safety plan. Update it with your own information.',
      steps: [
        { title: 'Identify safe places', description: 'List places where you can go if you feel unsafe', completed: false },
        { title: 'Pack emergency bag', description: 'Keep important documents and essentials ready', completed: false },
        { title: 'Memorize emergency numbers', description: 'Know who to call in an emergency', completed: true },
      ],
      emergencyContacts: [
        { name: 'Trusted Friend', phone: '555-0100', relationship: 'Friend' },
        { name: 'Family Member', phone: '555-0200', relationship: 'Family' },
      ],
      safePlaces: [
        { name: 'Friend\'s House', address: '123 Safe Street', notes: 'Available 24/7' },
        { name: 'Shelter', address: '456 Shelter Ave', notes: 'Call ahead' },
      ],
    });
    await samplePlan.save();
    console.log(`   ✅ Created safety plan\n`);

    // Seed Sample Chat Session
    console.log('💬 Seeding sample chat session...');
    const sampleSession = new ChatSession({
      sessionId: 'sample_session_' + Date.now(),
      anonymousId: sampleUser.anonymousId,
      status: 'active',
    });
    await sampleSession.save();
    console.log(`   ✅ Created chat session: ${sampleSession.sessionId}\n`);

    // Seed Sample Messages
    console.log('📨 Seeding sample messages...');
    const sampleMessages = [
      {
        sessionId: sampleSession.sessionId,
        senderId: 'counselor_001',
        senderType: 'counselor',
        content: 'Hello, I\'m here to help. How are you feeling today?',
        encrypted: false,
      },
      {
        sessionId: sampleSession.sessionId,
        senderId: sampleUser.anonymousId,
        senderType: 'user',
        content: 'I\'m feeling scared and don\'t know what to do.',
        encrypted: false,
      },
      {
        sessionId: sampleSession.sessionId,
        senderId: 'counselor_001',
        senderType: 'counselor',
        content: 'I understand. You\'re not alone. Let\'s work through this together. What would help you feel safer right now?',
        encrypted: false,
      },
    ];
    await Message.insertMany(sampleMessages);
    console.log(`   ✅ Inserted ${sampleMessages.length} messages\n`);

    // Display summary
    console.log('📊 Seeding Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const appCollections = ['users', 'resources', 'safetyplans', 'evidences', 'chatsessions', 'messages', 'sosalerts'];
    
    for (const collectionName of appCollections) {
      const count = await mongoose.connection.db.collection(collectionName).countDocuments();
      console.log(`  ${collectionName.padEnd(20)} : ${count} documents`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Database seeding complete!');
    console.log('\n📝 Seeded data:');
    console.log('   • 8 Resources (helplines, shelters, legal, medical, counseling)');
    console.log('   • 1 Sample User');
    console.log('   • 1 Safety Plan (with steps, contacts, and safe places)');
    console.log('   • 1 Chat Session');
    console.log('   • 3 Sample Messages');

    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding error:', error);
    process.exit(1);
  }
}

seedAllData();


