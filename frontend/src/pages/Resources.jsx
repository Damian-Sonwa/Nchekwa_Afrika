import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Clock, 
  CheckCircle, 
  Shield, 
  Filter,
  SortAsc,
  Navigation,
  Users,
  Home,
  Building
} from 'lucide-react'
import { getResources, getShelters, getShelterCountries, getShelterCities } from '../services/api'

// Category definitions for general resources
const categories = [
  { id: 'all', label: 'All', icon: Search },
  { id: 'helpline', label: 'Helplines', icon: Phone },
  { id: 'legal', label: 'Legal', icon: Shield },
  { id: 'medical', label: 'Medical', icon: Building },
  { id: 'counseling', label: 'Counseling', icon: Users },
]

const categoryColors = {
  helpline: 'from-red-500 to-pink-500',
  shelter: 'from-blue-500 to-cyan-500',
  legal: 'from-purple-500 to-indigo-500',
  medical: 'from-green-500 to-emerald-500',
  counseling: 'from-orange-500 to-yellow-500',
}

// Sort options for shelters
const sortOptions = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'country', label: 'Country' },
  { value: 'city', label: 'City' },
  { value: 'distance', label: 'Nearest First' },
]

// Shelter type icons
const shelterTypeIcons = {
  shelter: Home,
  'safe-house': Shield,
  hotel: Building,
  refuge: Home,
  accommodation: Building,
}

export default function Resources() {
  // Tab state - 'resources' or 'shelters'
  const [activeTab, setActiveTab] = useState('resources')
  
  // Resources state
  const [resources, setResources] = useState([])
  const [filteredResources, setFilteredResources] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // Shelters state
  const [shelters, setShelters] = useState([])
  const [filteredShelters, setFilteredShelters] = useState([])
  const [shelterLoading, setShelterLoading] = useState(true)
  const [shelterSearch, setShelterSearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)

  // Load resources
  useEffect(() => {
    if (activeTab === 'resources') {
      loadResources()
    }
  }, [activeTab])

  // Load shelters
  useEffect(() => {
    if (activeTab === 'shelters') {
      loadShelters()
      loadCountries()
    }
  }, [activeTab])

  // Load cities when country changes
  useEffect(() => {
    if (selectedCountry && activeTab === 'shelters') {
      loadCities(selectedCountry)
    } else {
      setCities([])
      setSelectedCity('')
    }
  }, [selectedCountry, activeTab])

  // Filter resources
  useEffect(() => {
    filterResources()
  }, [selectedCategory, searchQuery, resources])

  // Filter and sort shelters
  useEffect(() => {
    filterAndSortShelters()
  }, [shelterSearch, selectedCountry, selectedCity, selectedType, showVerifiedOnly, sortBy, shelters, userLocation])

  const loadResources = async () => {
    try {
      setLoading(true)
      const response = await getResources()
      if (response.success) {
        setResources(response.resources)
        setFilteredResources(response.resources)
      }
    } catch (error) {
      console.error('Load resources error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadShelters = async () => {
    try {
      setShelterLoading(true)
      const filters = {}
      if (userLocation) {
        filters.lat = userLocation.lat
        filters.lng = userLocation.lng
      }
      if (sortBy) {
        filters.sort = sortBy
      }
      
      const response = await getShelters(filters)
      if (response.success) {
        setShelters(response.shelters)
        setFilteredShelters(response.shelters)
      }
    } catch (error) {
      console.error('Load shelters error:', error)
    } finally {
      setShelterLoading(false)
    }
  }

  const loadCountries = async () => {
    try {
      const response = await getShelterCountries()
      if (response.success) {
        setCountries(response.countries)
      }
    } catch (error) {
      console.error('Load countries error:', error)
    }
  }

  const loadCities = async (country) => {
    try {
      const response = await getShelterCities(country)
      if (response.success) {
        setCities(response.cities)
      }
    } catch (error) {
      console.error('Load cities error:', error)
    }
  }

  const filterResources = () => {
    let filtered = resources

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((r) => r.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query)
      )
    }

    setFilteredResources(filtered)
  }

  const filterAndSortShelters = () => {
    let filtered = [...shelters]

    // Apply filters
    if (shelterSearch.trim()) {
      const query = shelterSearch.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.city.toLowerCase().includes(query) ||
          s.country.toLowerCase().includes(query) ||
          (s.address && s.address.toLowerCase().includes(query)) ||
          (s.notes && s.notes.toLowerCase().includes(query))
      )
    }

    if (selectedCountry) {
      filtered = filtered.filter((s) => 
        s.country.toLowerCase().includes(selectedCountry.toLowerCase())
      )
    }

    if (selectedCity) {
      filtered = filtered.filter((s) => 
        s.city.toLowerCase().includes(selectedCity.toLowerCase())
      )
    }

    if (selectedType) {
      filtered = filtered.filter((s) => s.type === selectedType)
    }

    if (showVerifiedOnly) {
      filtered = filtered.filter((s) => s.verified === true)
    }

    // Apply sorting
    if (sortBy === 'distance' && userLocation) {
      filtered.sort((a, b) => {
        const distA = a.distance || Infinity
        const distB = b.distance || Infinity
        return distA - distB
      })
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'country') {
      filtered.sort((a, b) => {
        if (a.country !== b.country) {
          return a.country.localeCompare(b.country)
        }
        return a.city.localeCompare(b.city)
      })
    } else if (sortBy === 'city') {
      filtered.sort((a, b) => {
        if (a.city !== b.city) {
          return a.city.localeCompare(b.city)
        }
        return a.name.localeCompare(b.name)
      })
    }

    setFilteredShelters(filtered)
  }

  // Get user location for distance calculation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        // Reload shelters with location
        loadShelters()
      },
      (error) => {
        setLocationError('Unable to retrieve your location. Please enable location services.')
        console.error('Location error:', error)
      }
    )
  }

  // Clear location
  const clearLocation = () => {
    setUserLocation(null)
    setLocationError(null)
    loadShelters()
  }

  if (loading && activeTab === 'resources') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-poppins font-bold text-dark dark:text-white mb-2">
          Resource Directory
        </h1>
        <p className="text-light dark:text-light">
          Find support services and safe accommodations in your area
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-light dark:border-light/30">
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-6 py-3 font-poppins font-medium transition-all duration-200 border-b-2 ${
            activeTab === 'resources'
              ? 'border-primary text-primary'
              : 'border-transparent text-light dark:text-light hover:text-dark dark:hover:text-white'
          }`}
        >
          Support Services
        </button>
        <button
          onClick={() => setActiveTab('shelters')}
          className={`px-6 py-3 font-poppins font-medium transition-all duration-200 border-b-2 ${
            activeTab === 'shelters'
              ? 'border-primary text-primary'
              : 'border-transparent text-light dark:text-light hover:text-dark dark:hover:text-white'
          }`}
        >
          <span className="flex items-center space-x-2">
            <Home className="w-4 h-4" />
            <span>Safe Shelters</span>
          </span>
        </button>
      </div>

      {/* Resources Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'resources' && (
          <motion.div
            key="resources"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-light w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="w-full pl-12 pr-4 py-3 border border-light dark:border-light/30 rounded-xl bg-white dark:bg-dark text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-inter"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-inter font-medium whitespace-nowrap transition-all duration-200 flex items-center space-x-2 ${
                      selectedCategory === category.id
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-background dark:bg-dark/50 text-dark dark:text-light hover:bg-primaryLight/10 dark:hover:bg-dark'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Resources Grid */}
            {filteredResources.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-light dark:text-light">No resources found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource, index) => (
                  <motion.div
                    key={resource._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-dark rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 p-6 border border-light dark:border-light/30"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`px-3 py-1 rounded-lg bg-gradient-to-r ${
                          categoryColors[resource.category] || 'from-gray-500 to-gray-600'
                        } text-white text-xs font-semibold capitalize font-inter`}
                      >
                        {resource.category}
                      </div>
                      {resource.verified && (
                        <CheckCircle className="w-5 h-5 text-success" />
                      )}
                    </div>

                    <h3 className="text-xl font-poppins font-semibold text-dark dark:text-white mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-light dark:text-light text-sm mb-4 line-clamp-3 font-inter">
                      {resource.description}
                    </p>

                    <div className="space-y-2">
                      {resource.contactInfo?.phone && (
                        <div className="flex items-center text-sm text-dark dark:text-light font-inter">
                          <Phone className="w-4 h-4 mr-2 text-primary" />
                          <a
                            href={`tel:${resource.contactInfo.phone}`}
                            className="hover:text-primary hover:underline"
                          >
                            {resource.contactInfo.phone}
                          </a>
                        </div>
                      )}
                      {resource.contactInfo?.email && (
                        <div className="flex items-center text-sm text-dark dark:text-light font-inter">
                          <Mail className="w-4 h-4 mr-2 text-primary" />
                          <a
                            href={`mailto:${resource.contactInfo.email}`}
                            className="hover:text-primary hover:underline"
                          >
                            {resource.contactInfo.email}
                          </a>
                        </div>
                      )}
                      {resource.contactInfo?.website && (
                        <div className="flex items-center text-sm text-dark dark:text-light font-inter">
                          <Globe className="w-4 h-4 mr-2 text-primary" />
                          <a
                            href={resource.contactInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                      {resource.available24h && (
                        <div className="flex items-center text-sm text-success font-inter">
                          <Clock className="w-4 h-4 mr-2" />
                          Available 24/7
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Shelters Tab Content */}
        {activeTab === 'shelters' && (
          <motion.div
            key="shelters"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-light w-5 h-5" />
                <input
                  type="text"
                  value={shelterSearch}
                  onChange={(e) => setShelterSearch(e.target.value)}
                  placeholder="Search shelters by name, city, or address..."
                  className="w-full pl-12 pr-4 py-3 border border-light dark:border-light/30 rounded-xl bg-white dark:bg-dark text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-inter"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Country Filter */}
                <div>
                  <label className="block text-sm font-poppins font-medium text-dark dark:text-white mb-2">
                    Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-4 py-2 border border-light dark:border-light/30 rounded-lg bg-white dark:bg-dark text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                  >
                    <option value="">All Countries</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-sm font-poppins font-medium text-dark dark:text-white mb-2">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={!selectedCountry}
                    className="w-full px-4 py-2 border border-light dark:border-light/30 rounded-lg bg-white dark:bg-dark text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-inter disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All Cities</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-poppins font-medium text-dark dark:text-white mb-2">
                    Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-2 border border-light dark:border-light/30 rounded-lg bg-white dark:bg-dark text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                  >
                    <option value="">All Types</option>
                    <option value="shelter">Shelter</option>
                    <option value="safe-house">Safe House</option>
                    <option value="hotel">Hotel</option>
                    <option value="refuge">Refuge</option>
                    <option value="accommodation">Accommodation</option>
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-poppins font-medium text-dark dark:text-white mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-light dark:border-light/30 rounded-lg bg-white dark:bg-dark text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-inter"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showVerifiedOnly}
                    onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 text-primary border-light rounded focus:ring-primary"
                  />
                  <span className="text-sm font-inter text-dark dark:text-white">
                    Verified shelters only
                  </span>
                </label>

                {/* Location Button */}
                <div className="flex items-center space-x-2">
                  {userLocation ? (
                    <button
                      onClick={clearLocation}
                      className="px-4 py-2 bg-success text-white rounded-lg font-inter text-sm hover:bg-success/80 transition-colors flex items-center space-x-2"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Using Location</span>
                    </button>
                  ) : (
                    <button
                      onClick={getCurrentLocation}
                      className="px-4 py-2 bg-primary text-white rounded-lg font-inter text-sm hover:bg-primaryLight transition-colors flex items-center space-x-2"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Find Nearest</span>
                    </button>
                  )}
                </div>

                {locationError && (
                  <p className="text-sm text-error font-inter">{locationError}</p>
                )}
              </div>
            </div>

            {/* Loading State */}
            {shelterLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-4">
                  <p className="text-light dark:text-light font-inter">
                    Found {filteredShelters.length} shelter{filteredShelters.length !== 1 ? 's' : ''}
                    {userLocation && ' (sorted by distance)'}
                  </p>
                </div>

                {/* Shelters Grid */}
                {filteredShelters.length === 0 ? (
                  <div className="text-center py-12">
                    <Home className="w-16 h-16 text-light dark:text-light mx-auto mb-4" />
                    <p className="text-light dark:text-light font-inter">
                      No shelters found. Try adjusting your filters.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredShelters.map((shelter, index) => {
                      const TypeIcon = shelterTypeIcons[shelter.type] || Home
                      return (
                        <motion.div
                          key={shelter._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white dark:bg-dark rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 p-6 border border-light dark:border-light/30"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <TypeIcon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded font-inter capitalize">
                                    {shelter.type}
                                  </span>
                                  {shelter.verified && (
                                    <CheckCircle className="w-5 h-5 text-success" title="Verified" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Name */}
                          <h3 className="text-xl font-poppins font-semibold text-dark dark:text-white mb-2">
                            {shelter.name}
                          </h3>

                          {/* Location */}
                          <div className="flex items-start space-x-2 mb-3">
                            <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                            <div className="text-sm text-light dark:text-light font-inter">
                              <p className="font-medium text-dark dark:text-white">
                                {shelter.city}, {shelter.country}
                              </p>
                              {shelter.address && (
                                <p className="mt-1">{shelter.address}</p>
                              )}
                              {shelter.distance !== undefined && (
                                <p className="mt-1 text-primary font-semibold">
                                  {shelter.distance.toFixed(1)} km away
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="space-y-2 mb-3">
                            {shelter.contactInfo?.phone && (
                              <div className="flex items-center text-sm text-dark dark:text-light font-inter">
                                <Phone className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                                <a
                                  href={`tel:${shelter.contactInfo.phone}`}
                                  className="hover:text-primary hover:underline truncate"
                                >
                                  {shelter.contactInfo.phone}
                                </a>
                              </div>
                            )}
                            {shelter.contactInfo?.email && (
                              <div className="flex items-center text-sm text-dark dark:text-light font-inter">
                                <Mail className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                                <a
                                  href={`mailto:${shelter.contactInfo.email}`}
                                  className="hover:text-primary hover:underline truncate"
                                >
                                  {shelter.contactInfo.email}
                                </a>
                              </div>
                            )}
                            {shelter.contactInfo?.website && (
                              <div className="flex items-center text-sm text-dark dark:text-light font-inter">
                                <Globe className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                                <a
                                  href={shelter.contactInfo.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-primary hover:underline truncate"
                                >
                                  Visit Website
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Additional Info */}
                          <div className="space-y-2 pt-3 border-t border-light dark:border-light/30">
                            {shelter.capacity && (
                              <div className="flex items-center text-sm text-light dark:text-light font-inter">
                                <Users className="w-4 h-4 mr-2 text-primary" />
                                Capacity: {shelter.capacity} people
                              </div>
                            )}
                            {shelter.available24h && (
                              <div className="flex items-center text-sm text-success font-inter">
                                <Clock className="w-4 h-4 mr-2" />
                                Available 24/7
                              </div>
                            )}
                            {shelter.notes && (
                              <p className="text-sm text-light dark:text-light font-inter line-clamp-2">
                                {shelter.notes}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
