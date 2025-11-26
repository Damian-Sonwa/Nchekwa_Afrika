import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, Mail, Lock, Eye, EyeOff, ArrowRight, 
  CheckCircle, AlertCircle, Loader2, ArrowLeft
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'

/**
 * Nchekwa_Afrika Authentication Page with Supabase Integration
 * 
 * Features:
 * - Supabase OAuth (Google)
 * - Supabase email/password signup with email confirmation
 * - Supabase email/password login with email verification check
 * - Supabase password reset
 * - Flip animation between login and signup forms
 * - Smooth animations and transitions
 */

export default function Auth() {
  const navigate = useNavigate()
  const { login: setAuth, setAnonymousId, isAuthenticated, logout } = useAuthStore()
  
  // Check for email confirmation callback
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()
      
      if (data?.session) {
        // User is authenticated via Supabase
        const user = data.session.user
        
        // Check if email is confirmed
        if (user.email_confirmed_at) {
          // Store auth data
          const userData = {
            email: user.email,
            id: user.id,
            emailConfirmed: true
          }
          
          // Use Supabase user ID as anonymousId for compatibility with existing app
          setAuth(userData, data.session.access_token, user.id)
          setAnonymousId(user.id)
          
          localStorage.setItem('supabase_session', JSON.stringify(data.session))
          localStorage.setItem('anonymousId', user.id)
          localStorage.setItem('isOnboarded', 'true')
          
          // Navigate based on user details completion
          const userDetailsCompleted = localStorage.getItem('userDetailsCompleted')
          if (userDetailsCompleted) {
            navigate('/app', { replace: true })
          } else {
            navigate('/user-details', { replace: true })
          }
        }
      }
    }
    
    handleAuthCallback()
  }, [navigate, setAuth, setAnonymousId])
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = localStorage.getItem('token')
        const isAuth = isAuthenticated || token || session
        
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
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    
    // Skip email validation if updating password after reset
    if (!isUpdatingPassword) {
      if (!formData.email) {
        newErrors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email'
      }
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
      if (isLogin) {
        // Check if user is updating password after reset
        if (isUpdatingPassword) {
          if (!formData.password || formData.password.length < 8) {
            setErrors({ password: 'Password must be at least 8 characters' })
            setLoading(false)
            return
          }

          const { error: updateError } = await supabase.auth.updateUser({
            password: formData.password
          })

          if (updateError) {
            setErrors({ submit: updateError.message || 'Failed to update password. Please try again.' })
            setLoading(false)
            return
          }

          setSuccess(true)
          setMessage('Your password has been updated successfully! You can now sign in with your new password.')
          
          // Clear the form and reset state
          setFormData({ email: '', password: '', confirmPassword: '' })
          setErrors({})
          setIsUpdatingPassword(false)
          
          setTimeout(() => {
            setSuccess(false)
            setMessage('')
            // User can now login with new password
          }, 3000)
          
          setLoading(false)
          return
        }

        // Regular login with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setErrors({ 
              submit: 'Please verify your email address before signing in. Check your inbox for the confirmation link.' 
            })
          } else if (error.message.includes('Invalid login credentials')) {
            setErrors({ submit: 'Invalid email or password' })
          } else {
            setErrors({ submit: error.message || 'Failed to sign in. Please try again.' })
          }
          setLoading(false)
          return
        }

        if (data.user && data.session) {
          // Check if email is confirmed
          if (!data.user.email_confirmed_at) {
            setErrors({ 
              submit: 'Please verify your email address before signing in. Check your inbox for the confirmation link.' 
            })
            setLoading(false)
            return
          }

          // Store auth data
          const userData = {
            email: data.user.email,
            id: data.user.id,
            emailConfirmed: true
          }
          
          setAuth(userData, data.session.access_token, data.user.id)
          setAnonymousId(data.user.id)
          
          localStorage.setItem('supabase_session', JSON.stringify(data.session))
          localStorage.setItem('anonymousId', data.user.id)
          localStorage.setItem('isOnboarded', 'true')
          
          setSuccess(true)
          setMessage('Welcome back!')
          
          setTimeout(() => {
            const userDetailsCompleted = localStorage.getItem('userDetailsCompleted')
            if (userDetailsCompleted) {
              navigate('/app')
            } else {
              navigate('/user-details')
            }
          }, 1500)
        }
      } else {
        // Signup with Supabase
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?verified=true`,
          }
        })

        if (error) {
          if (error.message.includes('already registered')) {
            setErrors({ submit: 'An account with this email already exists. Please sign in instead.' })
          } else {
            setErrors({ submit: error.message || 'Failed to create account. Please try again.' })
          }
          setLoading(false)
          return
        }

        if (data.user) {
          setSuccess(true)
          setMessage('Your email is verified! Welcome to Nchekwa Afrika!')
          
          // Check if email confirmation is required
          if (data.user.email_confirmed_at) {
            // Email already confirmed (shouldn't happen normally, but handle it)
            const userData = {
              email: data.user.email,
              id: data.user.id,
              emailConfirmed: true
            }
            
            setAuth(userData, data.session?.access_token, data.user.id)
            setAnonymousId(data.user.id)
            
            if (data.session) {
              localStorage.setItem('supabase_session', JSON.stringify(data.session))
            }
            localStorage.setItem('anonymousId', data.user.id)
            localStorage.setItem('isOnboarded', 'true')
            
            setTimeout(() => {
              navigate('/user-details')
            }, 2000)
          } else {
            // Email confirmation required
            setMessage('Account created! Please check your email to confirm your account. We sent a confirmation link to ' + formData.email)
            
            // Show success message for 5 seconds before allowing user to continue
            setTimeout(() => {
              setSuccess(false)
              setMessage('')
              setIsLogin(true) // Switch to login form
            }, 5000)
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      setErrors({ submit: error.message || 'Something went wrong. Please try again.' })
      setLoading(false)
    } finally {
      if (!success) {
        setLoading(false)
      }
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
    setMessage('')
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      })

      if (error) {
        setErrors({ 
          submit: error.message || 'Failed to send reset email. Please try again.' 
        })
        setLoading(false)
        return
      }

      setMessage('Password reset email sent! Please check your inbox and follow the instructions to reset your password.')
      setShowForgotPassword(false)
      setLoading(false)
    } catch (error) {
      console.error('Forgot password error:', error)
      setErrors({ 
        submit: error.message || 'Failed to send reset email. Please try again.' 
      })
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider) => {
    setLoading(true)
    setErrors({})
    setMessage('')
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider === 'apple' ? 'apple' : 'google',
        options: {
          redirectTo: `${window.location.origin}/auth?oauth=true`,
        }
      })

      if (error) {
        setErrors({ 
          submit: `Unable to sign in with ${provider}. Please try again.` 
        })
        setLoading(false)
        return
      }

      // OAuth redirect will happen automatically
      // The callback will be handled in the useEffect above
    } catch (error) {
      console.error('Social login error:', error)
      setErrors({ 
        submit: `Unable to sign in with ${provider}. Please try another method.` 
      })
      setLoading(false)
    }
  }

  // Handle password reset callback
  useEffect(() => {
    const handlePasswordReset = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const type = hashParams.get('type')

      if (type === 'recovery' && accessToken) {
        // User clicked password reset link - set session with the token
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || ''
        })

        if (sessionError) {
          setErrors({ submit: 'Invalid or expired reset token. Please request a new password reset link.' })
          return
        }

        // User is now authenticated with recovery token
        setShowForgotPassword(false)
        setIsLogin(true)
        setIsUpdatingPassword(true)
        setMessage('Please enter your new password below.')
        
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname)
      }
    }

    handlePasswordReset()
  }, [])

  // Handle email verification callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const verified = urlParams.get('verified')
    const reset = urlParams.get('reset')
    const oauth = urlParams.get('oauth')

    if (verified === 'true') {
      setMessage('Your email is verified! Welcome to Nchekwa Afrika!')
      setSuccess(true)
      
      // Clear the query parameter
      window.history.replaceState(null, '', window.location.pathname)
      
      // Check session after verification
      setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const userData = {
            email: session.user.email,
            id: session.user.id,
            emailConfirmed: true
          }
          
          setAuth(userData, session.access_token, session.user.id)
          setAnonymousId(session.user.id)
          
          localStorage.setItem('supabase_session', JSON.stringify(session))
          localStorage.setItem('anonymousId', session.user.id)
          localStorage.setItem('isOnboarded', 'true')
          
          setTimeout(() => {
            navigate('/user-details')
          }, 2000)
        }
      }, 1000)
    }

    if (reset === 'true') {
      setMessage('Your password has been updated successfully! You can now sign in with your new password.')
      setIsLogin(true)
      setShowForgotPassword(false)
      
      // Clear the query parameter
      window.history.replaceState(null, '', window.location.pathname)
    }

    if (oauth === 'true') {
      // OAuth callback - session should be set automatically
      // Check session and redirect
      setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const userData = {
            email: session.user.email,
            id: session.user.id,
            emailConfirmed: !!session.user.email_confirmed_at
          }
          
          setAuth(userData, session.access_token, session.user.id)
          setAnonymousId(session.user.id)
          
          localStorage.setItem('supabase_session', JSON.stringify(session))
          localStorage.setItem('anonymousId', session.user.id)
          localStorage.setItem('isOnboarded', 'true')
          
          const userDetailsCompleted = localStorage.getItem('userDetailsCompleted')
          if (userDetailsCompleted) {
            navigate('/app', { replace: true })
          } else {
            navigate('/user-details', { replace: true })
          }
        }
      }, 500)
      
      // Clear the query parameter
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [navigate, setAuth, setAnonymousId])

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden" style={{ background: '#0a0a0a' }}>
      {/* Back to Landing Button */}
      <motion.button
        onClick={() => navigate('/')}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-4 left-4 z-50 flex items-center space-x-2 px-4 py-2 rounded-xl shadow-lg transition-colors border"
        style={{
          background: 'rgba(10, 61, 47, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          color: '#f0f0f0',
          borderColor: 'rgba(163, 255, 127, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(10, 61, 47, 1)'
          e.currentTarget.style.borderColor = 'rgba(163, 255, 127, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(10, 61, 47, 0.95)'
          e.currentTarget.style.borderColor = 'rgba(163, 255, 127, 0.3)'
        }}
        title="Back to home"
      >
        <ArrowLeft className="w-5 h-5" style={{ color: '#f0f0f0' }} />
        <span className="font-medium" style={{ color: '#f0f0f0' }}>Back</span>
      </motion.button>

      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen w-full max-w-full">
        {/* Left Half: Auth Form */}
        <div className="w-full max-w-full flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto overflow-x-hidden box-border" style={{ background: '#0a0a0a' }}>
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
                      background: '#0a3d2f',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(163, 255, 127, 0.2)'
                    }}
                    className="rounded-2xl shadow-2xl p-6 md:p-10"
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
                      <h1 className="text-3xl font-heading font-bold mb-2 drop-shadow-sm" style={{ color: '#f0f0f0' }}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                      </h1>
                      <p className="text-lg font-body leading-relaxed drop-shadow-sm" style={{ color: '#f0f0f0' }}>
                        {isLogin 
                          ? 'Sign in to your Nchekwa_Afrika account'
                          : 'Start your journey to safety and support'
                        }
                      </p>
                      <p className="font-body text-sm italic mt-2 drop-shadow-sm" style={{ color: '#b0ff9e' }}>
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
                            className="inline-flex p-4 rounded-full"
                            style={{
                              background: 'rgba(163, 255, 127, 0.2)'
                            }}
                          >
                            <CheckCircle className="w-16 h-16" style={{ color: '#a3ff7f' }} />
                          </motion.div>
                          <h2 className="text-2xl font-heading font-bold" style={{ color: '#f0f0f0' }}>
                            {message || (isLogin ? 'Welcome back!' : 'Account created!')}
                          </h2>
                          <p className="text-lg font-body leading-relaxed" style={{ color: '#b0ff9e' }}>
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
                          {/* Email Input - Hide if updating password after reset */}
                          {!isUpdatingPassword && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <label htmlFor="email" className="block text-sm font-body font-medium mb-2" style={{ color: '#f0f0f0' }}>
                              Email Address
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="w-5 h-5" style={{ color: '#b0ff9e' }} />
                              </div>
                              <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => {
                                  setFormData({ ...formData, email: e.target.value })
                                  setErrors({ ...errors, email: '' })
                                }}
                                className="w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 font-body"
                                style={{
                                  background: 'rgba(0, 0, 0, 0.3)',
                                  backdropFilter: 'blur(10px)',
                                  color: '#f0f0f0',
                                  borderColor: errors.email ? '#ef4444' : 'rgba(163, 255, 127, 0.3)',
                                  ...(errors.email ? {} : { '--tw-ring-color': 'rgba(163, 255, 127, 0.3)' })
                                }}
                                placeholder="your.email@example.com"
                                autoComplete="email"
                                onFocus={(e) => {
                                  if (!errors.email) {
                                    e.target.style.borderColor = '#a3ff7f'
                                    e.target.style.boxShadow = '0 0 0 3px rgba(163, 255, 127, 0.2)'
                                  }
                                }}
                                onBlur={(e) => {
                                  if (!errors.email) {
                                    e.target.style.borderColor = 'rgba(163, 255, 127, 0.3)'
                                    e.target.style.boxShadow = 'none'
                                  }
                                }}
                              />
                              <style>{`
                                #email::placeholder {
                                  color: #888888;
                                }
                              `}</style>
                            </div>
                            {errors.email && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 text-sm font-body flex items-center space-x-1"
                                style={{ color: '#ef4444' }}
                              >
                                <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
                                <span>{errors.email}</span>
                              </motion.p>
                            )}
                          </motion.div>
                          )}

                          {/* Password Input */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <label htmlFor="password" className="block text-sm font-body font-medium mb-2" style={{ color: '#f0f0f0' }}>
                              {isUpdatingPassword ? 'New Password' : 'Password'}
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="w-5 h-5" style={{ color: '#b0ff9e' }} />
                              </div>
                              <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => {
                                  setFormData({ ...formData, password: e.target.value })
                                  setErrors({ ...errors, password: '' })
                                }}
                                className="w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 font-body"
                                style={{
                                  background: 'rgba(0, 0, 0, 0.3)',
                                  backdropFilter: 'blur(10px)',
                                  color: '#f0f0f0',
                                  borderColor: errors.password ? '#ef4444' : 'rgba(163, 255, 127, 0.3)'
                                }}
                                placeholder="Enter your password"
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                                onFocus={(e) => {
                                  if (!errors.password) {
                                    e.target.style.borderColor = '#a3ff7f'
                                    e.target.style.boxShadow = '0 0 0 3px rgba(163, 255, 127, 0.2)'
                                  }
                                }}
                                onBlur={(e) => {
                                  if (!errors.password) {
                                    e.target.style.borderColor = 'rgba(163, 255, 127, 0.3)'
                                    e.target.style.boxShadow = 'none'
                                  }
                                }}
                              />
                              <style>{`
                                #password::placeholder {
                                  color: #888888;
                                }
                              `}</style>
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
                                style={{ color: '#b0ff9e' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#a3ff7f'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#b0ff9e'}
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
                            <label htmlFor="confirmPassword" className="block text-sm font-body font-medium mb-2" style={{ color: '#f0f0f0' }}>
                                Confirm Password
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                  <Lock className="w-5 h-5" style={{ color: '#b0ff9e' }} />
                                </div>
                                <input
                                  id="confirmPassword"
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  value={formData.confirmPassword}
                                  onChange={(e) => {
                                    setFormData({ ...formData, confirmPassword: e.target.value })
                                    setErrors({ ...errors, confirmPassword: '' })
                                  }}
                                  className="w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 font-body"
                                  style={{
                                    background: 'rgba(0, 0, 0, 0.3)',
                                    backdropFilter: 'blur(10px)',
                                    color: '#f0f0f0',
                                    borderColor: errors.confirmPassword ? '#ef4444' : 'rgba(163, 255, 127, 0.3)'
                                  }}
                                  placeholder="Confirm your password"
                                  autoComplete="new-password"
                                  onFocus={(e) => {
                                    if (!errors.confirmPassword) {
                                      e.target.style.borderColor = '#a3ff7f'
                                      e.target.style.boxShadow = '0 0 0 3px rgba(163, 255, 127, 0.2)'
                                    }
                                  }}
                                  onBlur={(e) => {
                                    if (!errors.confirmPassword) {
                                      e.target.style.borderColor = 'rgba(163, 255, 127, 0.3)'
                                      e.target.style.boxShadow = 'none'
                                    }
                                  }}
                                />
                                <style>{`
                                  #confirmPassword::placeholder {
                                    color: #888888;
                                  }
                                `}</style>
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
                                  style={{ color: '#b0ff9e' }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = '#a3ff7f'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = '#b0ff9e'}
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

                          {/* Forgot Password (Login only, hide if updating password) */}
                          {isLogin && !isUpdatingPassword && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex justify-end"
                            >
                              <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="text-sm font-inter text-primary hover:text-primary-light dark:text-primary-light dark:hover:text-primary font-medium transition-colors"
                                style={{ color: '#b0ff9e' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#a3ff7f'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#b0ff9e'}
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
                              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                              <p className="text-sm font-inter" style={{ color: '#ef4444' }}>{errors.submit}</p>
                            </motion.div>
                          )}

                          {/* Success Message */}
                          {message && !errors.submit && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 rounded-xl flex items-start space-x-3"
                              style={{
                                background: 'rgba(163, 255, 127, 0.15)',
                                border: '1px solid rgba(163, 255, 127, 0.3)'
                              }}
                            >
                              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#a3ff7f' }} />
                              <p className="text-sm font-inter" style={{ color: '#a3ff7f' }}>{message}</p>
                            </motion.div>
                          )}

                          {/* Submit Button */}
                          <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.05 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            className="w-full py-4 px-6 rounded-xl font-heading font-semibold shadow-md hover:shadow-lg transition-all duration-300 focus:ring-2 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              background: loading ? '#888888' : '#a3ff7f',
                              color: '#0a3d2f',
                              boxShadow: loading ? 'none' : '0 4px 14px 0 rgba(163, 255, 127, 0.4)'
                            }}
                            onMouseEnter={(e) => {
                              if (!loading) {
                                e.currentTarget.style.background = '#ffd700'
                                e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(255, 215, 0, 0.5)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!loading) {
                                e.currentTarget.style.background = '#a3ff7f'
                                e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(163, 255, 127, 0.4)'
                              }
                            }}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Please wait...</span>
                              </>
                            ) : (
                              <>
                                <span>{isUpdatingPassword ? 'Update Password' : (isLogin ? 'Sign In' : 'Create Account')}</span>
                                <ArrowRight className="w-5 h-5" />
                              </>
                            )}
                          </motion.button>

                          {/* Divider */}
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t" style={{ borderColor: 'rgba(163, 255, 127, 0.2)' }}></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-4 backdrop-blur-sm font-body" style={{ 
                                background: '#0a3d2f',
                                color: '#b0ff9e'
                              }}>Or continue with</span>
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
                              className="py-3 px-4 border-2 rounded-xl font-body font-medium transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                              style={{
                                borderColor: 'rgba(163, 255, 127, 0.3)',
                                background: 'rgba(0, 0, 0, 0.2)',
                                color: '#f0f0f0'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#a3ff7f'
                                e.currentTarget.style.background = 'rgba(163, 255, 127, 0.1)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(163, 255, 127, 0.3)'
                                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)'
                              }}
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
                              className="py-3 px-4 border-2 rounded-xl font-body font-medium transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                              style={{
                                borderColor: 'rgba(163, 255, 127, 0.3)',
                                background: 'rgba(0, 0, 0, 0.2)',
                                color: '#f0f0f0'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#a3ff7f'
                                e.currentTarget.style.background = 'rgba(163, 255, 127, 0.1)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(163, 255, 127, 0.3)'
                                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)'
                              }}
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
                      <p className="text-sm font-body" style={{ color: '#f0f0f0' }}>
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button
                          type="button"
                          onClick={handleFlip}
                          className="font-semibold transition-colors"
                          style={{ color: '#b0ff9e' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#cce5ff'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#b0ff9e'}
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
                      background: '#0a3d2f',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(163, 255, 127, 0.2)'
                    }}
                    className="rounded-2xl shadow-2xl p-6 md:p-10"
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
                      <h1 className="text-3xl font-heading font-bold mt-4 mb-2" style={{ color: '#f0f0f0' }}>
                        Forgot Password?
                      </h1>
                      <p className="text-lg font-body leading-relaxed" style={{ color: '#f0f0f0' }}>
                        Enter your email and we'll send you a reset link
                      </p>
                      <p className="font-body text-sm italic mt-2" style={{ color: '#b0ff9e' }}>
                        Together, we stand strong. Your hands in ours, your safety our promise.
                      </p>
                    </div>

                    <form onSubmit={handleForgotPassword} className="space-y-6">
                      <div>
                        <label htmlFor="forgot-email" className="block text-sm font-body font-medium mb-2" style={{ color: '#f0f0f0' }}>
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="w-5 h-5" style={{ color: '#b0ff9e' }} />
                          </div>
                          <input
                            id="forgot-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => {
                              setFormData({ ...formData, email: e.target.value })
                              setErrors({ ...errors, email: '' })
                            }}
                            className="w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 font-body transition-all duration-300"
                            style={{
                              background: 'rgba(0, 0, 0, 0.3)',
                              backdropFilter: 'blur(10px)',
                              color: '#f0f0f0',
                              borderColor: 'rgba(163, 255, 127, 0.3)'
                            }}
                            placeholder="your.email@example.com"
                            required
                            onFocus={(e) => {
                              e.target.style.borderColor = '#a3ff7f'
                              e.target.style.boxShadow = '0 0 0 3px rgba(163, 255, 127, 0.2)'
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'rgba(163, 255, 127, 0.3)'
                              e.target.style.boxShadow = 'none'
                            }}
                          />
                          <style>{`
                            #forgot-email::placeholder {
                              color: #888888;
                            }
                          `}</style>
                        </div>
                        {errors.email && (
                          <p className="mt-2 text-sm font-body" style={{ color: '#ef4444' }}>{errors.email}</p>
                        )}
                      </div>

                      {errors.submit && (
                        <div className="p-4 rounded-xl" style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                          <p className="text-sm font-body" style={{ color: '#ef4444' }}>{errors.submit}</p>
                        </div>
                      )}

                      {message && (
                        <div className="p-4 rounded-xl" style={{
                          background: 'rgba(163, 255, 127, 0.15)',
                          border: '1px solid rgba(163, 255, 127, 0.3)'
                        }}>
                          <p className="text-sm font-body" style={{ color: '#a3ff7f' }}>{message}</p>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <motion.button
                          type="submit"
                          disabled={loading}
                          whileHover={{ scale: loading ? 1 : 1.05 }}
                          whileTap={{ scale: loading ? 1 : 0.98 }}
                          className="flex-1 py-3 px-6 rounded-xl font-heading font-semibold shadow-md hover:shadow-lg transition-all duration-300 focus:ring-2 disabled:opacity-50 flex items-center justify-center space-x-2"
                          style={{
                            background: loading ? '#888888' : '#a3ff7f',
                            color: '#0a3d2f',
                            boxShadow: loading ? 'none' : '0 4px 14px 0 rgba(163, 255, 127, 0.4)'
                          }}
                          onMouseEnter={(e) => {
                            if (!loading) {
                              e.currentTarget.style.background = '#ffd700'
                              e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(255, 215, 0, 0.5)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!loading) {
                              e.currentTarget.style.background = '#a3ff7f'
                              e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(163, 255, 127, 0.4)'
                            }
                          }}
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
                          className="px-6 py-3 border-2 rounded-xl font-body font-medium transition-all duration-300"
                          style={{
                            borderColor: 'rgba(163, 255, 127, 0.3)',
                            background: 'rgba(0, 0, 0, 0.2)',
                            color: '#f0f0f0'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#a3ff7f'
                            e.currentTarget.style.background = 'rgba(163, 255, 127, 0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(163, 255, 127, 0.3)'
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)'
                          }}
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
            <p className="text-xs font-body max-w-md mx-auto flex items-center justify-center space-x-2" style={{ color: '#b0ff9e' }}>
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
