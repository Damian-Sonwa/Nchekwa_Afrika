import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Calendar, Heart, Globe, ArrowRight, Loader2, Shield, MessageSquare, Lock, BookOpen, CheckCircle, Camera, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuthStore } from '../store/authStore'
import { saveUserDetails, uploadProfilePicture, getUserDetails } from '../services/api'

/**
 * First-Time User Details Form
 * 
 * Appears after signup to collect basic demographic information.
 * Trauma-informed, responsive, and easy to complete.
 * 
 * Fields:
 * - Name (optional, can use alias)
 * - Age
 * - Sex
 * - Marital Status
 * - Country
 */

const sexOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
]

const maritalStatusOptions = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
]

// Common countries list (you can expand this)
const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'India',
  'Nigeria', 'South Africa', 'Kenya', 'Ghana', 'Uganda', 'Tanzania',
  'Zimbabwe', 'Botswana', 'Namibia', 'Malawi', 'Zambia', 'Other'
]

export default function UserDetails() {
  const navigate = useNavigate()
  const { anonymousId } = useApp()
  const { isAuthenticated } = useAuthStore()
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: '',
    maritalStatus: '',
    country: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [profilePicture, setProfilePicture] = useState(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState(null)
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const fileInputRef = useRef(null)

  // Redirect if user details are already completed (not a first-time user)
  useEffect(() => {
    const userDetailsCompleted = localStorage.getItem('userDetailsCompleted')
    // If user details are already completed, redirect to app
    // This ensures the profile form only shows for first-time signups
    if (userDetailsCompleted === 'true' || userDetailsCompleted === 'skipped') {
      navigate('/app', { replace: true })
    }
    // If user is not authenticated and no anonymousId, redirect to auth
    if (!isAuthenticated && !anonymousId) {
      navigate('/auth', { replace: true })
    }
  }, [navigate, isAuthenticated, anonymousId])

  // Load existing profile picture if available
  useEffect(() => {
    const loadProfilePicture = async () => {
      if (anonymousId) {
        try {
          const response = await getUserDetails(anonymousId)
          if (response.success && response.userDetails?.profilePicture) {
            const pictureUrl = response.userDetails.profilePicture
            // If it's a relative URL starting with /api, use it directly (Vite proxy handles it)
            // Otherwise, make it absolute
            const fullUrl = pictureUrl.startsWith('http') 
              ? pictureUrl 
              : pictureUrl.startsWith('/api')
              ? pictureUrl
              : `${window.location.origin}${pictureUrl}`
            setProfilePicturePreview(fullUrl)
            setProfilePicture(pictureUrl)
          }
        } catch (error) {
          console.error('Load profile picture error:', error)
        }
      }
    }
    loadProfilePicture()
  }, [anonymousId])

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, profilePicture: 'Please select an image file' })
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, profilePicture: 'Image size must be less than 5MB' })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload to server
    try {
      setUploadingPicture(true)
      setErrors({ ...errors, profilePicture: '' })
      const response = await uploadProfilePicture(anonymousId, file)
      if (response.success) {
        const pictureUrl = response.profilePicture
        // If it's a relative URL starting with /api, use it directly (Vite proxy handles it)
        // Otherwise, make it absolute
        const fullUrl = pictureUrl.startsWith('http') 
          ? pictureUrl 
          : pictureUrl.startsWith('/api')
          ? pictureUrl
          : `${window.location.origin}${pictureUrl}`
        setProfilePicture(pictureUrl)
        setProfilePicturePreview(fullUrl)
      }
    } catch (error) {
      console.error('Upload profile picture error:', error)
      setErrors({ ...errors, profilePicture: 'Failed to upload profile picture. Please try again.' })
      // Reset preview on error
      setProfilePicturePreview(null)
    } finally {
      setUploadingPicture(false)
    }
  }

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null)
    setProfilePicturePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Age is required
    if (!formData.age) {
      newErrors.age = 'Age is required'
    } else if (parseInt(formData.age) < 13 || parseInt(formData.age) > 120) {
      newErrors.age = 'Please enter a valid age'
    }
    
    // Sex is required
    if (!formData.sex) {
      newErrors.sex = 'Please select an option'
    }
    
    // Marital status is required
    if (!formData.maritalStatus) {
      newErrors.maritalStatus = 'Please select an option'
    }
    
    // Country is required
    if (!formData.country) {
      newErrors.country = 'Please select your country'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      await saveUserDetails(anonymousId, {
        name: formData.name || undefined, // Optional
        age: parseInt(formData.age),
        sex: formData.sex,
        maritalStatus: formData.maritalStatus,
        country: formData.country,
      })
      
      // Mark user details as completed
      localStorage.setItem('userDetailsCompleted', 'true')
      
      // Navigate to app
      navigate('/app')
    } catch (error) {
      console.error('Save user details error:', error)
      setErrors({ 
        submit: 'Failed to save your information. Please try again when you\'re ready.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    // Allow skipping, but mark as attempted
    localStorage.setItem('userDetailsCompleted', 'skipped')
    navigate('/app')
  }

  // Icons for background pattern
  const backgroundIcons = [Shield, Heart, MessageSquare, Lock, BookOpen, CheckCircle, User, Globe]
  
  // Generate static icon positions (deterministic, won't change on re-render)
  const generateIconPositions = () => {
    const positions = []
    for (let i = 0; i < 50; i++) {
      const Icon = backgroundIcons[i % backgroundIcons.length]
      const size = 20 + (i % 3) * 8 // Varying sizes: 20px, 28px, 36px
      const left = ((i * 7.3) % 100) + (i % 3) * 15
      const top = ((i * 11.7) % 100) + (i % 2) * 20
      const rotation = (i * 23) % 45
      positions.push({ Icon, size, left, top, rotation, key: i })
    }
    return positions
  }
  
  const iconPositions = generateIconPositions()

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background flex items-center justify-center p-4 relative">
      {/* WhatsApp-style background pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 60px, currentColor 60px, currentColor 61px),
              repeating-linear-gradient(90deg, transparent, transparent 60px, currentColor 60px, currentColor 61px)
            `,
            color: 'currentColor'
          }}
        />
        {/* Scattered icons pattern - static like WhatsApp */}
        {iconPositions.map(({ Icon, size, left, top, rotation, key }) => (
          <Icon
            key={key}
            className="absolute text-accent/20 dark:text-accent/25"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${size}px`,
              height: `${size}px`,
              transform: `rotate(${rotation}deg)`,
            }}
          />
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl mx-4 relative z-10 box-border"
      >
        <div className="bg-card rounded-2xl shadow-2xl p-8 md:p-10 border" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            {/* Profile Picture Upload */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative inline-block mb-4"
            >
              <div className="relative">
                {profilePicturePreview ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border shadow-lg" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <img
                      src={profilePicturePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveProfilePicture}
                      className="absolute top-1 right-1 p-1 bg-error rounded-full text-text-main hover:bg-error/80 transition-colors"
                      title="Remove picture"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-accent flex items-center justify-center border shadow-lg" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <User className="w-16 h-16 text-primary" />
                  </div>
                )}
                <label
                  htmlFor="profile-picture"
                  className="absolute bottom-0 right-0 p-2 bg-accent rounded-full text-primary cursor-pointer hover:bg-accent-gold transition-colors shadow-lg"
                  title="Upload profile picture"
                >
                  {uploadingPicture ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </label>
                <input
                  id="profile-picture"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                  disabled={uploadingPicture}
                />
              </div>
              {errors.profilePicture && (
                <p className="mt-2 text-sm font-inter text-error dark:text-error text-center">
                  {errors.profilePicture}
                </p>
              )}
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-poppins font-bold text-dark dark:text-text-main mb-2">
              Tell Us About Yourself
            </h1>
            <p className="font-inter text-light dark:text-text-main">
              This information helps us provide better support. All details are kept private and secure.
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name (Optional) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label htmlFor="name" className="block text-sm font-body font-medium text-text-main mb-2">
                Name <span className="text-text-secondary dark:text-text-main/70 text-xs">(Optional - you can use an alias)</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-text-main/60" />
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name or alias"
                  className="w-full pl-12 pr-4 py-3 border-2 border-accent/20 rounded-xl bg-background text-text-main font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-primary transition-all duration-300"
                />
              </div>
            </motion.div>

            {/* Age */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="age" className="block text-sm font-inter font-medium text-dark dark:text-text-main mb-2">
                Age <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light dark:text-text-main/60" />
                <input
                  id="age"
                  type="number"
                  min="13"
                  max="120"
                  value={formData.age}
                  onChange={(e) => {
                    setFormData({ ...formData, age: e.target.value })
                    setErrors({ ...errors, age: '' })
                  }}
                  placeholder="Your age"
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-white dark:bg-dark text-dark dark:text-text-main font-inter focus:outline-none focus:ring-2 transition-all ${
                    errors.age
                      ? 'border-error focus:ring-error focus:border-error'
                      : 'border-light dark:border-light/30 focus:ring-primaryLight focus:border-primaryLight'
                  }`}
                  required
                />
              </div>
              {errors.age && (
                <p className="mt-2 text-sm font-inter text-error dark:text-error">{errors.age}</p>
              )}
            </motion.div>

            {/* Sex */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-inter font-medium text-dark dark:text-text-main mb-2">
                Sex <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full">
                {sexOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, sex: option.value })
                      setErrors({ ...errors, sex: '' })
                    }}
                    className={`p-3 rounded-xl border-2 transition-all font-inter ${
                      formData.sex === option.value
                        ? 'border-primary bg-accentLight/20 text-accent dark:text-accentLight'
                        : 'border-light dark:border-light/30 hover:border-primaryLight dark:hover:border-primaryLight text-dark dark:text-text-main'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.sex && (
                <p className="mt-2 text-sm font-inter text-error dark:text-error">{errors.sex}</p>
              )}
            </motion.div>

            {/* Marital Status */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-inter font-medium text-dark dark:text-text-main mb-2">
                Marital Status <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
                {maritalStatusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, maritalStatus: option.value })
                      setErrors({ ...errors, maritalStatus: '' })
                    }}
                    className={`p-3 rounded-xl border-2 transition-all font-inter ${
                      formData.maritalStatus === option.value
                        ? 'border-primary bg-accentLight/20 text-accent dark:text-accentLight'
                        : 'border-light dark:border-light/30 hover:border-primaryLight dark:hover:border-primaryLight text-dark dark:text-text-main'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.maritalStatus && (
                <p className="mt-2 text-sm font-inter text-error dark:text-error">{errors.maritalStatus}</p>
              )}
            </motion.div>

            {/* Country */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label htmlFor="country" className="block text-sm font-inter font-medium text-dark dark:text-text-main mb-2">
                Country <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light dark:text-text-main/60" />
                <select
                  id="country"
                  value={formData.country}
                  onChange={(e) => {
                    setFormData({ ...formData, country: e.target.value })
                    setErrors({ ...errors, country: '' })
                  }}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-white dark:bg-dark text-dark dark:text-text-main font-inter focus:outline-none focus:ring-2 transition-all ${
                    errors.country
                      ? 'border-error focus:ring-error focus:border-error'
                      : 'border-light dark:border-light/30 focus:ring-primaryLight focus:border-primaryLight'
                  }`}
                  required
                >
                  <option value="" className="bg-white dark:bg-dark text-dark dark:text-text-main">Select your country</option>
                  {countries.map((country) => (
                    <option key={country} value={country} className="bg-white dark:bg-dark text-dark dark:text-text-main">
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              {errors.country && (
                <p className="mt-2 text-sm font-inter text-error dark:text-error">{errors.country}</p>
              )}
            </motion.div>

            {/* Submit Error */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-error/10 dark:bg-error/20 border border-error/30 dark:border-error/50 rounded-xl"
              >
                <p className="text-sm font-inter text-error dark:text-error">{errors.submit}</p>
              </motion.div>
            )}

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex-1 px-6 py-4 bg-accent hover:bg-accent-gold text-primary rounded-xl font-inter font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
              
              <button
                type="button"
                onClick={handleSkip}
                disabled={loading}
                className="px-6 py-4 border-2 border-light dark:border-light/30 text-dark dark:text-text-main rounded-xl font-inter font-medium hover:bg-background dark:hover:bg-dark/50 transition-colors disabled:opacity-50"
              >
                Skip for now
              </button>
            </motion.div>

            {/* Privacy Notice */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs font-inter text-center text-light dark:text-text-main mt-4"
            >
              🔒 Your information is encrypted and stored securely. You can update or delete it anytime in Settings.
            </motion.p>
          </form>
        </div>
      </motion.div>
    </div>
  )
}


