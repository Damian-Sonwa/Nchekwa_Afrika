/**
 * Seed Script for Shelters/Accommodations
 * 
 * This script populates the database with safe shelters and accommodations
 * across African countries.
 * 
 * To run: node scripts/seedShelters.js
 * 
 * To add more shelters, update backend/data/africanShelters.js and run this script again.
 */

const mongoose = require('mongoose');
const Shelter = require('../models/Shelter');
const africanShelters = require('../data/africanShelters');
require('dotenv').config();

async function seedShelters() {
  try {
    // Use the correct connection string for gvp_app database
    // This matches the server's connection string
    const mongoUri = 'mongodb+srv://damian:sopuluchi@cluster0.cmiunlp.mongodb.net/gvp_app?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('🔌 Connecting to MongoDB...');
    console.log('URI:', mongoUri.replace(/:[^:@]+@/, ':****@'));
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);

    // Optional: Clear existing shelters (uncomment if you want to reset)
    // await Shelter.deleteMany({});
    // console.log('🗑️  Cleared existing shelters');

    // Check for duplicates before inserting
    const existingShelters = await Shelter.find({});
    const existingNames = new Set(existingShelters.map(s => `${s.name}-${s.city}-${s.country}`));
    
    const sheltersToInsert = africanShelters.filter(shelter => {
      const key = `${shelter.name}-${shelter.city}-${shelter.country}`;
      return !existingNames.has(key);
    });

    if (sheltersToInsert.length === 0) {
      console.log('ℹ️  All shelters already exist in database. No new shelters to insert.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Insert new shelters
    const inserted = await Shelter.insertMany(sheltersToInsert);
    console.log(`✅ Inserted ${inserted.length} new shelters`);
    console.log(`📊 Total shelters in database: ${existingShelters.length + inserted.length}`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedShelters();

