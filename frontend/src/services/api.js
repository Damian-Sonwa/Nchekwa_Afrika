import axios from 'axios'

// Use proxy in development (Vite proxies /api to http://localhost:3000)
// In production, use VITE_API_URL or default to /api
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Log API URL in both dev and production for debugging
console.log('🔗 API Base URL:', API_BASE_URL)
if (import.meta.env.DEV) {
  console.log('📡 Backend should be running on: http://localhost:3000')
} else if (!import.meta.env.VITE_API_URL) {
  console.warn('⚠️ VITE_API_URL is not set! Using default /api. This may not work in production.')
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth and redirect
      localStorage.removeItem('token')
      localStorage.removeItem('anonymousId')
      localStorage.removeItem('isOnboarded')
      // Only redirect if not already on auth page
      if (!window.location.pathname.includes('/auth') && !window.location.pathname.includes('/landing')) {
        window.location.href = '/auth'
      }
    }
    return Promise.reject(error)
  }
)

// Auth
export const createAnonymousSession = async (deviceId = null) => {
  try {
    const response = await api.post('/auth/anonymous', { deviceId })
    return response.data
  } catch (error) {
    console.error('Create session error:', error)
    throw error
  }
}

export const register = async (email, password) => {
  try {
    console.log('📤 Registering user:', email)
    console.log('📡 API URL:', api.defaults.baseURL)
    const response = await api.post('/auth/register', { email, password })
    console.log('✅ Register response:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Register error:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    })
    throw error
  }
}

export const login = async (email, password) => {
  try {
    console.log('📤 Logging in user:', email)
    console.log('📡 API URL:', api.defaults.baseURL)
    const response = await api.post('/auth/login', { email, password })
    console.log('✅ Login response:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Login error:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    })
    throw error
  }
}

export const socialLogin = async (provider, providerId, email = null) => {
  try {
    const response = await api.post('/auth/social', { 
      provider, 
      providerId, 
      email 
    })
    return response.data
  } catch (error) {
    console.error('Social login error:', error)
    throw error
  }
}

// Forgot Password
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  } catch (error) {
    console.error('Forgot password error:', error)
    throw error
  }
}

// Reset Password
export const resetPassword = async (token, newPassword) => {
  try {
    console.log('📤 Sending reset password request');
    console.log('🔑 Token (first 16 chars):', token ? token.substring(0, 16) + '...' : 'MISSING');
    console.log('🔑 Token length:', token ? token.length : 0);
    console.log('🔑 Full token (for debugging):', token);
    console.log('🔒 Password length:', newPassword ? newPassword.length : 0);
    
    // Send token as-is (should already be decoded from URL)
    // Don't encode it again - backend will handle both encoded and decoded
    const response = await api.post('/auth/reset-password', { token, newPassword })
    console.log('✅ Reset password response:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Reset password error:', error)
    console.error('❌ Error response data:', error.response?.data)
    console.error('❌ Error status:', error.response?.status)
    throw error
  }
}

// Confirm Email
export const confirmEmail = async (token) => {
  try {
    const response = await api.post('/auth/confirm-email', { token })
    return response.data
  } catch (error) {
    console.error('Confirm email error:', error)
    throw error
  }
}

// Resend Confirmation Email
export const resendConfirmation = async (email) => {
  try {
    const response = await api.post('/auth/resend-confirmation', { email })
    return response.data
  } catch (error) {
    console.error('Resend confirmation error:', error)
    throw error
  }
}

// SOS
export const sendSOSAlert = async (anonymousId, location) => {
  try {
    const response = await api.post('/sos', { anonymousId, location })
    return response.data
  } catch (error) {
    console.error('SOS error:', error)
    throw error
  }
}

// Chat
export const startChatSession = async (anonymousId) => {
  try {
    const response = await api.post('/chat/start', { anonymousId })
    return response.data
  } catch (error) {
    console.error('Start chat error:', error)
    throw error
  }
}

export const sendMessage = async (sessionId, senderId, senderType, content) => {
  try {
    const response = await api.post('/chat/send', {
      sessionId,
      senderId,
      senderType,
      content,
    })
    return response.data
  } catch (error) {
    console.error('Send message error:', error)
    throw error
  }
}

export const getMessages = async (sessionId, limit = 50, offset = 0) => {
  try {
    const response = await api.get(`/chat/${sessionId}/messages`, {
      params: { limit, offset },
    })
    return response.data
  } catch (error) {
    console.error('Get messages error:', error)
    throw error
  }
}

// Resources
export const getResources = async (filters = {}) => {
  try {
    const response = await api.get('/resources', { params: filters })
    return response.data
  } catch (error) {
    console.error('Get resources error:', error)
    throw error
  }
}

// Shelters
export const getShelters = async (filters = {}) => {
  try {
    const response = await api.get('/shelters', { params: filters })
    return response.data
  } catch (error) {
    console.error('Get shelters error:', error)
    throw error
  }
}

export const getShelterCountries = async () => {
  try {
    const response = await api.get('/shelters/meta/countries')
    return response.data
  } catch (error) {
    console.error('Get shelter countries error:', error)
    throw error
  }
}

export const getShelterCities = async (country) => {
  try {
    const response = await api.get(`/shelters/meta/cities/${country}`)
    return response.data
  } catch (error) {
    console.error('Get shelter cities error:', error)
    throw error
  }
}

// Safety Plans
export const getSafetyPlans = async (anonymousId) => {
  try {
    const response = await api.get(`/safety-plans/${anonymousId}`)
    return response.data
  } catch (error) {
    console.error('Get safety plans error:', error)
    throw error
  }
}

export const saveSafetyPlan = async (planData) => {
  try {
    const response = await api.post('/safety-plans', planData)
    return response.data
  } catch (error) {
    console.error('Save safety plan error:', error)
    throw error
  }
}

// Evidence
export const getEvidence = async (anonymousId) => {
  try {
    if (!anonymousId) {
      console.warn('getEvidence called without anonymousId')
      return { success: false, evidence: [] }
    }
    const response = await api.get(`/evidence/${anonymousId}`)
    return response.data
  } catch (error) {
    console.error('Get evidence error:', error)
    // Return empty array instead of throwing to prevent blank page
    return { success: false, evidence: [], error: error.message }
  }
}

export const uploadEvidence = async (formData) => {
  try {
    const response = await api.post('/evidence/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Upload evidence error:', error)
    throw error
  }
}

export const deleteEvidence = async (evidenceId) => {
  try {
    const response = await api.delete(`/evidence/${evidenceId}`)
    return response.data
  } catch (error) {
    console.error('Delete evidence error:', error)
    throw error
  }
}

// User
export const saveUserDetails = async (anonymousId, details) => {
  try {
    const response = await api.post('/user/details', { anonymousId, ...details })
    return response.data
  } catch (error) {
    console.error('Save user details error:', error)
    throw error
  }
}

export const getUserDetails = async (anonymousId) => {
  try {
    const response = await api.get(`/user/details/${anonymousId}`)
    return response.data
  } catch (error) {
    console.error('Get user details error:', error)
    throw error
  }
}

export const uploadProfilePicture = async (anonymousId, file) => {
  try {
    const formData = new FormData()
    formData.append('profilePicture', file)
    formData.append('anonymousId', anonymousId)
    
    const response = await api.post('/user/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  } catch (error) {
    console.error('Upload profile picture error:', error)
    throw error
  }
}

export const wipeAllData = async (anonymousId) => {
  try {
    const response = await api.post('/user/wipe', { anonymousId })
    return response.data
  } catch (error) {
    console.error('Wipe data error:', error)
    throw error
  }
}

// Mood Tracker
export const saveMoodEntry = async (anonymousId, moodData) => {
  try {
    const response = await api.post('/mood', { anonymousId, ...moodData })
    return response.data
  } catch (error) {
    console.error('Save mood entry error:', error)
    throw error
  }
}

export const getMoodHistory = async (anonymousId, days = 30, limit = 100) => {
  try {
    const response = await api.get(`/mood/${anonymousId}`, {
      params: { days, limit }
    })
    return response.data
  } catch (error) {
    console.error('Get mood history error:', error)
    throw error
  }
}

export const getMoodStats = async (anonymousId, days = 7) => {
  try {
    const response = await api.get(`/mood/${anonymousId}/stats`, {
      params: { days }
    })
    return response.data
  } catch (error) {
    console.error('Get mood stats error:', error)
    throw error
  }
}

// Legal Reminders
export const saveLegalReminder = async (anonymousId, reminderData) => {
  try {
    const response = await api.post('/legal', { anonymousId, ...reminderData })
    return response.data
  } catch (error) {
    console.error('Save legal reminder error:', error)
    throw error
  }
}

export const getLegalReminders = async (anonymousId, includeCompleted = false) => {
  try {
    const response = await api.get(`/legal/${anonymousId}`, {
      params: { includeCompleted }
    })
    return response.data
  } catch (error) {
    console.error('Get legal reminders error:', error)
    throw error
  }
}

export const updateLegalReminder = async (reminderId, updates) => {
  try {
    const response = await api.patch(`/legal/${reminderId}`, updates)
    return response.data
  } catch (error) {
    console.error('Update legal reminder error:', error)
    throw error
  }
}

export const deleteLegalReminder = async (reminderId) => {
  try {
    const response = await api.delete(`/legal/${reminderId}`)
    return response.data
  } catch (error) {
    console.error('Delete legal reminder error:', error)
    throw error
  }
}

export const getUpcomingReminders = async (anonymousId, days = 7) => {
  try {
    const response = await api.get(`/legal/${anonymousId}/upcoming`, {
      params: { days }
    })
    return response.data
  } catch (error) {
    console.error('Get upcoming reminders error:', error)
    throw error
  }
}

// Emotional Check-ins
export const saveEmotionalCheckin = async (anonymousId, checkinData) => {
  try {
    const response = await api.post('/emotional-checkin', { anonymousId, ...checkinData })
    return response.data
  } catch (error) {
    console.error('Save emotional check-in error:', error)
    throw error
  }
}

export const getEmotionalCheckins = async (anonymousId, days = 30) => {
  try {
    const response = await api.get(`/emotional-checkin/${anonymousId}`, {
      params: { days }
    })
    return response.data
  } catch (error) {
    console.error('Get emotional check-ins error:', error)
    throw error
  }
}

// Community Posts
export const getCommunityPosts = async (filters = {}) => {
  try {
    const response = await api.get('/community', { params: filters })
    return response.data
  } catch (error) {
    console.error('Get community posts error:', error)
    throw error
  }
}

export const createCommunityPost = async (postData) => {
  try {
    const response = await api.post('/community', postData)
    return response.data
  } catch (error) {
    console.error('Create community post error:', error)
    throw error
  }
}

export const likeCommunityPost = async (postId, userId) => {
  try {
    const response = await api.post(`/community/${postId}/like`, { userId })
    return response.data
  } catch (error) {
    console.error('Like community post error:', error)
    throw error
  }
}

export const commentOnPost = async (postId, commentData) => {
  try {
    const response = await api.post(`/community/${postId}/comment`, commentData)
    return response.data
  } catch (error) {
    console.error('Comment on post error:', error)
    throw error
  }
}

export const reportPost = async (postId, userId, reason) => {
  try {
    const response = await api.post(`/community/${postId}/report`, { userId, reason })
    return response.data
  } catch (error) {
    console.error('Report post error:', error)
    throw error
  }
}

// Settings
export const getSettings = async (anonymousId) => {
  try {
    const response = await api.get(`/settings/${anonymousId}`)
    return response.data
  } catch (error) {
    console.error('Get settings error:', error)
    throw error
  }
}

export const updateSettings = async (anonymousId, settings) => {
  try {
    const response = await api.patch(`/settings/${anonymousId}`, { settings })
    return response.data
  } catch (error) {
    console.error('Update settings error:', error)
    throw error
  }
}

export const changePassword = async (anonymousId, currentPassword, newPassword) => {
  try {
    const response = await api.post('/settings/change-password', {
      anonymousId,
      currentPassword,
      newPassword
    })
    return response.data
  } catch (error) {
    console.error('Change password error:', error)
    throw error
  }
}

export const updateAccountInfo = async (anonymousId, accountInfo) => {
  try {
    const response = await api.patch(`/settings/account/${anonymousId}`, accountInfo)
    return response.data
  } catch (error) {
    console.error('Update account info error:', error)
    throw error
  }
}

export const setPin = async (anonymousId, pin, currentPin = null) => {
  try {
    const response = await api.post('/settings/pin', {
      anonymousId,
      pin,
      currentPin
    })
    return response.data
  } catch (error) {
    console.error('Set PIN error:', error)
    throw error
  }
}

export const saveSOSConfig = async (anonymousId, sosConfig) => {
  try {
    const response = await api.post('/settings/sos-config', {
      anonymousId,
      ...sosConfig
    })
    return response.data
  } catch (error) {
    console.error('Save SOS config error:', error)
    throw error
  }
}

export default api

