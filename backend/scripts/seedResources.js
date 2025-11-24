const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const africanHelplines = require('../data/africanHelplines');
require('dotenv').config();

const sampleResources = africanHelplines;

async function seedResources() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gbv_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing resources (optional)
    // await Resource.deleteMany({});

    // Insert sample resources
    const inserted = await Resource.insertMany(sampleResources);
    console.log(`Inserted ${inserted.length} resources`);

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedResources();
