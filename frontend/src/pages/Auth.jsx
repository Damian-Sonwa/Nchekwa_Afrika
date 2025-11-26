import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, Mail, Lock, Eye, EyeOff, ArrowRight, 
  CheckCircle, AlertCircle, Loader2
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { register, login, socialLogin, forgotPassword } from '../services/api'

/**
 * Nchekwa_Afrika Authentication Page with Flip Animation
 * 
 * Features:
 * - Flip animation between login and signup forms
 * - Nchekwa_Afrika logo integration
 * - Email confirmation flow
 * - Forgot password flow
 * - Smooth animations and transitions
 */

// Flip Animation Variants
const flipVariants = {
  front: {
    rotateY: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeInOut' }
  },
  back: {
    rotateY: 180,
    opacity: 0,
    transition: { duration: 0.6, ease: 'easeInOut' }
  }
}

export default function Auth() {
  const navigate = useNavigate()
  const { login: setAuth, setAnonymousId, isAuthenticated, user } = useAuthStore()
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    // Only redirect if we're actually on the auth page and user is authenticated
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token')
        const isAuth = isAuthenticated || token
        
        if (isAuth && window.location.pathname === '/auth') {
          const userDetailsCompleted = localStorage.getItem('userDetailsCompleted')
          if (userDetailsCompleted) {
            navigate('/app', { replace: true })
          } else {
            navigate('/user-details', { replace: true })
          }
        }
      } catch (error) {
        console.error('Auth redirect error:', error)
      }
    }
    
    // Small delay to ensure store is initialized
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [isAuthenticated, navigate])
  
  const [isLogin, setIsLogin] = useState(true)
  const [isFlipping, setIsFlipping] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFlip = () => {
    setIsFlipping(true)
    setTimeout(() => {
      setIsLogin(!isLogin)
      setFormData({ email: '', password: '', confirmPassword: '' })
      setErrors({})
      setMessage('')
      setIsFlipping(false)
    }, 300)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})
    setMessage('')
    
    try {
      let response
      if (isLogin) {
        response = await login(formData.email, formData.password)
      } else {
        response = await register(formData.email, formData.password)
      }

      if (response.success) {
        // Store auth data
        const userData = {
          email: formData.email,
          anonymousId: response.anonymousId
        }
        
        setAuth(userData, response.token, response.anonymousId)
        setAnonymousId(response.anonymousId)
        
        localStorage.setItem('anonymousId', response.anonymousId)
        localStorage.setItem('isOnboarded', 'true')
        if (response.token) {
          localStorage.setItem('token', response.token)
        }
        
        setSuccess(true)
        setMessage(isLogin ? 'Welcome back!' : 'Account created! Please check your email to confirm your account.')
        
        // Navigate after brief success animation
        setTimeout(() => {
          if (!isLogin && response.requiresEmailConfirmation) {
            // Show email confirmation message
            // In development, include the confirmation link/token
            const confirmParams = new URLSearchParams({
              email: formData.email
            })
            if (response.confirmationLink) {
              confirmParams.set('link', response.confirmationLink)
            }
            if (response.confirmationToken) {
              confirmParams.set('token', response.confirmationToken)
            }
            navigate('/confirm-email?' + confirmParams.toString())
          } else {
            // For login: always go to app (profile form is only for first-time signups)
            // For signup: show profile form only if userDetailsCompleted is not set
            if (isLogin) {
              navigate('/app')
            } else {
              // Signup: check if user details are completed
              const userDetailsCompleted = localStorage.getItem('userDetailsCompleted')
              if (!userDetailsCompleted) {
                navigate('/user-details') // First-time signup: show profile form
              } else {
                navigate('/app') // Returning signup: go to app
              }
            }
          }
        }, 2000)
      }
    } catch (error) {
      console.error('Auth error:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        }
      })
      
      let errorMessage = 'Something went wrong. Please try again.'
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        const apiUrl = import.meta.env.VITE_API_URL || '/api'
        if (import.meta.env.DEV) {
          errorMessage = 'Cannot connect to server. Please make sure the backend server is running on http://localhost:3000'
        } else {
          errorMessage = 'Cannot connect to server. Please check your internet connection and try again.'
        }
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = 'Request timed out. Please check your connection and try again.'
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password'
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.error || 'Please check your information'
      } else if (error.response?.status === 409) {
        errorMessage = 'An account with this email already exists'
      } else if (!error.response) {
        errorMessage = `Connection error: ${error.message || 'Unable to reach server'}. Please check that the backend is running.`
      }
      
      setErrors({ submit: errorMessage })
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Please enter a valid email' })
      return
    }

    setLoading(true)
    setErrors({})
    
    try {
      const response = await forgotPassword(formData.email)
      if (response.success) {
        setMessage('Password reset email sent! Please check your inbox.')
        setShowForgotPassword(false)
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      setErrors({ 
        submit: error.response?.data?.error || 'Failed to send reset email. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider) => {
    setLoading(true)
    setErrors({})
    
    try {
      const providerId = `mock_${provider}_${Date.now()}`
      const response = await socialLogin(provider, providerId, formData.email || null)
      
      if (response.success) {
        const userData = {
          email: formData.email || null,
          anonymousId: response.anonymousId,
          provider
        }
        
        setAuth(userData, response.token, response.anonymousId)
        setAnonymousId(response.anonymousId)
        
        localStorage.setItem('anonymousId', response.anonymousId)
        localStorage.setItem('isOnboarded', 'true')
        
        setSuccess(true)
        setMessage('Signed in successfully!')
        
        setTimeout(() => {
          // For authenticated users, go to dashboard
          const userDetailsCompleted = localStorage.getItem('userDetailsCompleted')
          if (!userDetailsCompleted) {
            navigate('/user-details')
          } else {
            navigate('/app')
          }
        }, 1500)
      }
    } catch (error) {
      console.error('Social login error:', error)
      setErrors({ 
        submit: 'Unable to sign in with ' + provider + '. Please try another method.' 
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background-light dark:bg-background-dark">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen w-full max-w-full">
        {/* Left Half: Auth Form */}
        <div className="w-full max-w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background-light dark:bg-background-dark overflow-y-auto overflow-x-hidden box-border">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md mx-auto box-border"
            style={{ perspective: '1000px' }}
          >
            <div className="relative w-full" style={{ transformStyle: 'preserve-3d', height: 'auto' }}>
              <AnimatePresence mode="wait">
                {!showForgotPassword ? (
                  <motion.div
                    key={isLogin ? 'login' : 'signup'}
                    initial={{ rotateY: isFlipping ? 180 : 0, opacity: 0, scale: 0.95 }}
                    animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                    exit={{ rotateY: isFlipping ? -180 : 180, opacity: 0, scale: 0.95 }}
                    transition={{ 
                      duration: 0.6, 
                      ease: [0.4, 0, 0.2, 1],
                      type: 'spring',
                      stiffness: 300,
                      damping: 30
                    }}
                    style={{ 
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                    }}
                    className="dark:bg-background-dark/95 rounded-2xl shadow-2xl p-6 md:p-10 border border-white/20 dark:border-white/10"
                  >
                    {/* Logo/Header */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-8"
                    >
                      <div className="lg:hidden mb-4 flex justify-center">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                          className="relative w-40 h-40 rounded-xl overflow-hidden shadow-md border-2 border-primary/20"
                        >
                          <img
                            src="/helping-hands.jpg"
                            alt="Hands forming a circle - Unity and support"
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      </div>
                      <h1 className="text-3xl font-heading font-bold text-text-main dark:text-white mb-2 drop-shadow-sm">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                      </h1>
                      <p className="text-lg font-body text-text-secondary dark:text-white/90 leading-relaxed drop-shadow-sm">
                        {isLogin 
                          ? 'Sign in to your Nchekwa_Afrika account'
                          : 'Start your journey to safety and support'
                        }
                      </p>
                      <p className="font-body text-primary dark:text-primary-light text-sm italic mt-2 drop-shadow-sm">
                        Together, we stand strong. Your hands in ours, your safety our promise.
                      </p>
                    </motion.div>

                    <AnimatePresence mode="wait">
                      {success ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="text-center space-y-4 py-8"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="inline-flex p-4 bg-success/20 dark:bg-success/20 rounded-full"
                          >
                            <CheckCircle className="w-16 h-16 text-success dark:text-success" />
                          </motion.div>
                          <h2 className="text-2xl font-heading font-bold text-text-main dark:text-white">
                            {message || (isLogin ? 'Welcome back!' : 'Account created!')}
                          </h2>
                          <p className="text-lg font-body text-text-secondary leading-relaxed dark:text-white/80">
                            Redirecting you...
                          </p>
                        </motion.div>
                      ) : (
                        <motion.form
                          key="form"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onSubmit={handleSubmit}
                          className="space-y-6"
                        >
                          {/* Email Input */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <label htmlFor="email" className="block text-sm font-body font-medium text-text-main dark:text-white mb-2">
                              Email Address
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="w-5 h-5 text-text-secondary dark:text-white/60" />
                              </div>
                              <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => {
                                  setFormData({ ...formData, email: e.target.value })
                                  setErrors({ ...errors, email: '' })
                                }}
                                className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 bg-white/90 dark:bg-background-dark/90 backdrop-blur-sm text-text-main dark:text-white font-body ${
                                  errors.email
                                    ? 'border-error focus:border-error focus:ring-error/20'
                                    : 'border-primary-light dark:border-primary/30 focus:border-primary focus:ring-accent/20'
                                }`}
                                placeholder="your.email@example.com"
                                autoComplete="email"
                              />
                            </div>
                            {errors.email && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 text-sm font-body text-error dark:text-error flex items-center space-x-1"
                              >
                                <AlertCircle className="w-4 h-4" />
                                <span>{errors.email}</span>
                              </motion.p>
                            )}
                          </motion.div>

                          {/* Password Input */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <label htmlFor="password" className="block text-sm font-body font-medium text-text-main dark:text-white mb-2">
                              Password
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="w-5 h-5 text-text-secondary dark:text-white/60" />
                              </div>
                              <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => {
                                  setFormData({ ...formData, password: e.target.value })
                                  setErrors({ ...errors, password: '' })
                                }}
                                className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 bg-white/90 dark:bg-background-dark/90 backdrop-blur-sm text-text-main dark:text-white font-body ${
                                  errors.password
                                    ? 'border-error focus:border-error focus:ring-error/20'
                                    : 'border-primary-light dark:border-primary/30 focus:border-primary focus:ring-accent/20'
                                }`}
                                placeholder="Enter your password"
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary dark:text-white/60 hover:text-text-main dark:hover:text-white transition-colors"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                            {errors.password && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 text-sm font-body text-error dark:text-error flex items-center space-x-1"
                              >
                                <AlertCircle className="w-4 h-4" />
                                <span>{errors.password}</span>
                              </motion.p>
                            )}
                          </motion.div>

                          {/* Confirm Password (Signup only) */}
                          {!isLogin && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <label htmlFor="confirmPassword" className="block text-sm font-body font-medium text-text-main dark:text-white mb-2">
                                Confirm Password
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                  <Lock className="w-5 h-5 text-light" />
                                </div>
                                <input
                                  id="confirmPassword"
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  value={formData.confirmPassword}
                                  onChange={(e) => {
                                    setFormData({ ...formData, confirmPassword: e.target.value })
                                    setErrors({ ...errors, confirmPassword: '' })
                                  }}
                                  className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 bg-white/90 dark:bg-background-dark/90 backdrop-blur-sm text-text-main dark:text-white font-body ${
                                  errors.confirmPassword
                                    ? 'border-error focus:border-error focus:ring-error/20'
                                    : 'border-primary-light dark:border-primary/30 focus:border-primary focus:ring-accent/20'
                                }`}
                                  placeholder="Confirm your password"
                                  autoComplete="new-password"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary dark:text-white/60 hover:text-text-main dark:hover:text-white transition-colors"
                                >
                                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                              </div>
                              {errors.confirmPassword && (
                                <motion.p
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-2 text-sm font-body text-error dark:text-error flex items-center space-x-1"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                  <span>{errors.confirmPassword}</span>
                                </motion.p>
                              )}
                            </motion.div>
                          )}

                          {/* Forgot Password (Login only) */}
                          {isLogin && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex justify-end"
                            >
                              <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="text-sm font-inter text-primary hover:text-primary-light dark:text-primary-light dark:hover:text-primary font-medium transition-colors"
                              >
                                Forgot password?
                              </button>
                            </motion.div>
                          )}

                          {/* Error Message */}
                          {errors.submit && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 bg-error/10 dark:bg-error/20 border border-error/30 dark:border-error/50 rounded-xl flex items-start space-x-3"
                            >
                              <AlertCircle className="w-5 h-5 text-error dark:text-error flex-shrink-0 mt-0.5" />
                              <p className="text-sm font-inter text-error dark:text-error">{errors.submit}</p>
                            </motion.div>
                          )}

                          {/* Success Message */}
                          {message && !errors.submit && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 bg-success/10 dark:bg-success/20 border border-success/30 dark:border-success/50 rounded-xl flex items-start space-x-3"
                            >
                              <CheckCircle className="w-5 h-5 text-success dark:text-success flex-shrink-0 mt-0.5" />
                              <p className="text-sm font-inter text-success dark:text-success">{message}</p>
                            </motion.div>
                          )}

                          {/* Submit Button */}
                          <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.05 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            className="w-full py-4 px-6 rounded-xl bg-primary text-white font-heading font-semibold shadow-md hover:bg-primary-dark hover:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-accent flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Please wait...</span>
                              </>
                            ) : (
                              <>
                                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                                <ArrowRight className="w-5 h-5" />
                              </>
                            )}
                          </motion.button>

                          {/* Divider */}
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-light dark:border-light/30"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-4 bg-white/90 dark:bg-background-dark/90 backdrop-blur-sm text-text-secondary dark:text-white/90 font-body">Or continue with</span>
                            </div>
                          </div>

                          {/* Social Login */}
                          <div className="grid grid-cols-2 gap-4">
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSocialLogin('google')}
                              disabled={loading}
                              className="py-3 px-4 border-2 border-primary-light dark:border-primary/30 rounded-xl font-body font-medium text-text-main dark:text-white hover:border-primary dark:hover:border-primary hover:bg-background-light dark:hover:bg-primary transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                              <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                              </svg>
                              <span>Google</span>
                            </motion.button>

                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSocialLogin('apple')}
                              disabled={loading}
                              className="py-3 px-4 border-2 border-primary-light dark:border-primary/30 rounded-xl font-body font-medium text-text-main dark:text-white hover:border-primary dark:hover:border-primary hover:bg-background-light dark:hover:bg-primary transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                              </svg>
                              <span>Apple</span>
                            </motion.button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    {/* Toggle Login/Register */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mt-6 text-center"
                    >
                      <p className="text-sm font-body text-text-secondary dark:text-white/80">
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button
                          type="button"
                          onClick={handleFlip}
                          className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary font-semibold transition-colors"
                        >
                          {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                      </p>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="forgot-password"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    style={{
                      background: 'rgba(11, 47, 42, 0.95)',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                    }}
                    className="bg-white/95 dark:bg-background-dark/95 rounded-2xl shadow-2xl p-6 md:p-10 border border-white/20 dark:border-white/10"
                  >
                    <div className="text-center mb-8">
                      <div className="flex justify-center mb-4">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                          className="relative w-32 h-32 rounded-xl overflow-hidden shadow-md border-2 border-primary/20"
                        >
                          <img
                            src="/helping-hands.jpg"
                            alt="Hands forming a circle - Unity and support"
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      </div>
                      <h1 className="text-3xl font-heading font-bold text-text-main dark:text-white mt-4 mb-2">
                        Forgot Password?
                      </h1>
                      <p className="text-lg font-body text-text-secondary leading-relaxed dark:text-white/80">
                        Enter your email and we'll send you a reset link
                      </p>
                      <p className="font-body text-primary text-sm italic mt-2">
                        Together, we stand strong. Your hands in ours, your safety our promise.
                      </p>
                    </div>

                    <form onSubmit={handleForgotPassword} className="space-y-6">
                      <div>
                        <label htmlFor="forgot-email" className="block text-sm font-body font-medium text-text-main dark:text-white mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="w-5 h-5 text-text-secondary dark:text-white/60" />
                          </div>
                          <input
                            id="forgot-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => {
                              setFormData({ ...formData, email: e.target.value })
                              setErrors({ ...errors, email: '' })
                            }}
                            className="w-full pl-12 pr-4 py-3.5 border-2 border-primary-light dark:border-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:border-primary focus:ring-accent/20 bg-white/90 dark:bg-background-dark/90 backdrop-blur-sm text-text-main dark:text-white font-body transition-all duration-300"
                            placeholder="your.email@example.com"
                            required
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-2 text-sm font-body text-error dark:text-error">{errors.email}</p>
                        )}
                      </div>

                      {errors.submit && (
                        <div className="p-4 bg-error/10 dark:bg-error/20 border border-error/30 dark:border-error/50 rounded-xl">
                          <p className="text-sm font-body text-error dark:text-error">{errors.submit}</p>
                        </div>
                      )}

                      {message && (
                        <div className="p-4 bg-success/10 dark:bg-success/20 border border-success/30 dark:border-success/50 rounded-xl">
                          <p className="text-sm font-body text-success dark:text-success">{message}</p>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <motion.button
                          type="submit"
                          disabled={loading}
                          whileHover={{ scale: loading ? 1 : 1.05 }}
                          whileTap={{ scale: loading ? 1 : 0.98 }}
                          className="flex-1 py-3 px-6 rounded-xl bg-primary text-white font-heading font-semibold shadow-md hover:bg-primary-dark hover:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-accent disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Mail className="w-5 h-5" />
                              <span>Send Reset Link</span>
                            </>
                          )}
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(false)
                            setErrors({})
                            setMessage('')
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-6 py-3 border-2 border-primary-light dark:border-primary/30 text-text-main dark:text-white rounded-xl font-body font-medium hover:bg-background-light dark:hover:bg-primary transition-all duration-300"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          {/* Safety Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-xs font-body text-text-secondary dark:text-white/70 max-w-md mx-auto flex items-center justify-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Your information is encrypted and secure. You can delete your account at any time.</span>
            </p>
          </motion.div>
        </motion.div>
      </div>

        {/* Right Half: Full-Height Illustration */}
        <div className="hidden md:flex w-full h-full min-h-screen max-w-full overflow-hidden relative">
          <motion.img
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            src="/helping-hands.jpg"
            alt="Hands forming a circle - Unity and support"
            className="object-cover w-full h-full max-w-full"
            style={{ filter: 'blur(2px)' }}
          />
          {/* Subtle overlay for coverage */}
          <div className="absolute inset-0 bg-background-light/20 dark:bg-background-dark/25"></div>
        </div>
      </div>
    </div>
  )
}
