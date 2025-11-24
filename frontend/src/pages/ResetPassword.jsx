import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react'
import { resetPassword } from '../services/api'
import NchekwaLogo from '../components/NchekwaLogo'

/**
 * Reset Password Page
 * 
 * Allows users to reset their password using a token from email.
 */

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setErrors({ submit: 'Invalid or missing reset token. Please request a new password reset.' })
    }
  }, [token])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!token) {
      setErrors({ submit: 'Invalid reset token' })
      return
    }
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})
    
    try {
      const response = await resetPassword(token, formData.password)
      if (response.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/auth')
        }, 2000)
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setErrors({ 
        submit: error.response?.data?.error || 'Failed to reset password. The token may have expired. Please request a new reset link.' 
      })
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background dark:bg-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 md:p-10 border border-slate-200 dark:border-slate-700 max-w-md w-full text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex p-4 bg-success/20 dark:bg-success/20 rounded-full"
          >
            <CheckCircle className="w-16 h-16 text-success dark:text-success" />
          </motion.div>
          <h2 className="text-2xl font-poppins font-semibold text-text-dark dark:text-white">
            Password Updated!
          </h2>
          <p className="font-inter text-text-light dark:text-slate-300">
            Your password has been successfully reset. Redirecting to login...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background dark:bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 md:p-10 border border-slate-200 dark:border-slate-700 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <NchekwaLogo size="w-20 h-20" />
          <h1 className="text-3xl font-poppins font-semibold text-text-dark dark:text-white mt-4 mb-2">
            Reset Password
          </h1>
          <p className="font-inter text-text-light dark:text-slate-300">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-inter font-medium text-text-dark dark:text-slate-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-text-light" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  setErrors({ ...errors, password: '' })
                }}
                className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-white dark:bg-slate-700 text-text-dark dark:text-white font-inter ${
                  errors.password
                    ? 'border-error focus:border-error focus:ring-error/20'
                    : 'border-slate-300 dark:border-slate-600 focus:border-primary-light focus:ring-primary-light/20'
                }`}
                placeholder="Enter new password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-light hover:text-text-dark dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm font-inter text-error dark:text-error flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-inter font-medium text-text-dark dark:text-slate-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-text-light" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value })
                  setErrors({ ...errors, confirmPassword: '' })
                }}
                className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-white dark:bg-slate-700 text-text-dark dark:text-white font-inter ${
                  errors.confirmPassword
                    ? 'border-error focus:border-error focus:ring-error/20'
                    : 'border-slate-300 dark:border-slate-600 focus:border-primary-light focus:ring-primary-light/20'
                }`}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-light hover:text-text-dark dark:hover:text-slate-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm font-inter text-error dark:text-error flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.confirmPassword}</span>
              </p>
            )}
          </div>

          {errors.submit && (
            <div className="p-4 bg-error/10 dark:bg-error/20 border border-error/30 dark:border-error/50 rounded-xl">
              <p className="text-sm font-inter text-error dark:text-error">{errors.submit}</p>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading || !token}
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full py-4 bg-primary hover:bg-primary-light text-white rounded-xl font-inter font-semibold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <span>Reset Password</span>
                <Lock className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/auth')}
            className="text-sm font-inter text-primary hover:text-primary-light dark:text-primary-light dark:hover:text-primary font-medium transition-colors"
          >
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  )
}

