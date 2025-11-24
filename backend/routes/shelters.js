const express = require('express');
const router = express.Router();
const Shelter = require('../models/Shelter');

/**
 * Shelter Routes
 * 
 * Provides API endpoints for querying safe shelters and accommodations
 * across African countries.
 * 
 * Query parameters:
 * - country: Filter by country
 * - city: Filter by city
 * - type: Filter by type (shelter, hotel, safe-house, etc.)
 * - verified: Filter by verification status (true/false)
 * - search: Search by name, address, or notes
 * - sort: Sort by (name, country, city, distance)
 * - lat, lng: User coordinates for distance calculation
 */

// Get all shelters with optional filters
router.get('/', async (req, res) => {
  try {
    const { 
      country, 
      city, 
      type, 
      verified, 
      search, 
      sort = 'name',
      lat,
      lng
    } = req.query;

    const query = {};

    // Build query filters
    if (country) {
      query.country = { $regex: country, $options: 'i' };
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (type) {
      query.type = type;
    }

    if (verified === 'true') {
      query.verified = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    let shelters = await Shelter.find(query);

    // Calculate distances if coordinates provided
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      shelters = shelters.map(shelter => {
        const shelterObj = shelter.toObject ? shelter.toObject() : shelter;
        if (shelterObj.coordinates && shelterObj.coordinates.lat && shelterObj.coordinates.lng) {
          const distance = calculateDistance(
            userLat,
            userLng,
            shelterObj.coordinates.lat,
            shelterObj.coordinates.lng
          );
          return { ...shelterObj, distance };
        }
        return shelterObj;
      });
    } else {
      // Convert Mongoose documents to plain objects
      shelters = shelters.map(shelter => shelter.toObject ? shelter.toObject() : shelter);
    }

    // Sort results
    if (sort === 'distance' && lat && lng) {
      shelters.sort((a, b) => {
        const distA = a.distance || Infinity;
        const distB = b.distance || Infinity;
        return distA - distB;
      });
    } else if (sort === 'name') {
      shelters.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'country') {
      shelters.sort((a, b) => {
        if (a.country !== b.country) {
          return a.country.localeCompare(b.country);
        }
        return a.city.localeCompare(b.city);
      });
    } else if (sort === 'city') {
      shelters.sort((a, b) => {
        if (a.city !== b.city) {
          return a.city.localeCompare(b.city);
        }
        return a.name.localeCompare(b.name);
      });
    }

    res.json({
      success: true,
      count: shelters.length,
      shelters
    });
  } catch (error) {
    console.error('Get shelters error:', error);
    res.status(500).json({ error: 'Failed to fetch shelters' });
  }
});

// Get shelter by ID
router.get('/:id', async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return res.status(404).json({ error: 'Shelter not found' });
    }
    res.json({ success: true, shelter });
  } catch (error) {
    console.error('Get shelter error:', error);
    res.status(500).json({ error: 'Failed to fetch shelter' });
  }
});

// Get unique countries (for filter dropdown)
// Returns comprehensive list of all African countries from data file
router.get('/meta/countries', async (req, res) => {
  try {
    const countriesData = require('../data/africanCountriesCities');
    // Get countries from data file and merge with any countries that have shelters in DB
    const dbCountries = await Shelter.distinct('country');
    const allCountries = Object.keys(countriesData).sort();
    
    // Ensure all countries are included (data file is comprehensive)
    res.json({
      success: true,
      countries: allCountries
    });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

// Get unique cities for a country (for filter dropdown)
// Returns comprehensive list of major cities from data file, plus any cities with shelters
router.get('/meta/cities/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const countriesData = require('../data/africanCountriesCities');
    
    // Get cities from data file
    const dataCities = countriesData[country] || [];
    
    // Also get cities from database for this country
    const dbCities = await Shelter.distinct('city', { country });
    
    // Merge and deduplicate
    const allCities = [...new Set([...dataCities, ...dbCities])].sort();
    
    res.json({
      success: true,
      cities: allCities
    });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

module.exports = router;

