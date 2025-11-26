import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react'
import { confirmEmail, resendConfirmation } from '../services/api'
import NchekwaLogo from '../components/NchekwaLogo'

/**
 * Email Confirmation Page
 * 
 * Confirms user email using token from confirmation email.
 */

export default function ConfirmEmail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const confirmationLink = searchParams.get('link') // Development: direct link from backend
  const devToken = searchParams.get('token') // Development: token from backend
  
  const [loading, setLoading] = useState(!!token)
  const [resending, setResending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [emailAddress, setEmailAddress] = useState(email || '')
  const [showDevLink, setShowDevLink] = useState(!!confirmationLink)
  const [devConfirmationLink, setDevConfirmationLink] = useState(confirmationLink || '')
  
  // Update dev link when URL params change
  useEffect(() => {
    if (confirmationLink) {
      setDevConfirmationLink(confirmationLink)
      setShowDevLink(true)
    }
  }, [confirmationLink])

  useEffect(() => {
    if (token) {
      handleConfirm()
    }
  }, [token])

  const handleConfirm = async () => {
    if (!token) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await confirmEmail(token)
      if (response.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/auth')
        }, 3000)
      }
    } catch (error) {
      console.error('Confirm email error:', error)
      setError(error.response?.data?.error || 'Failed to confirm email. The link may have expired.')
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!emailAddress || !/\S+@\S+\.\S+/.test(emailAddress)) {
      setError('Please enter a valid email address')
      return
    }

    setResending(true)
    setError('')
    
    try {
      const response = await resendConfirmation(emailAddress)
      if (response.success) {
        setError('')
        setSuccess(true)
        // In development, show the confirmation link if provided
        if (response.confirmationLink) {
          setDevConfirmationLink(response.confirmationLink)
          setShowDevLink(true)
          // Update URL to include the link
          const newParams = new URLSearchParams(window.location.search)
          newParams.set('link', response.confirmationLink)
          if (response.confirmationToken) {
            newParams.set('token', response.confirmationToken)
          }
          window.history.replaceState({}, '', `/confirm-email?${newParams.toString()}`)
        }
        setTimeout(() => {
          setSuccess(false)
        }, 5000)
      }
    } catch (error) {
      console.error('Resend confirmation error:', error)
      setError(error.response?.data?.error || 'Failed to resend confirmation email. Please try again.')
    } finally {
      setResending(false)
    }
  }

  if (success && token) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 dark:bg-background-dark border border-primary-light rounded-2xl shadow-lg p-4 sm:p-6 md:p-10 w-full max-w-md mx-4 box-border text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex p-4 bg-success/20 rounded-full"
          >
            <CheckCircle className="w-16 h-16 text-success" />
          </motion.div>
          <h2 className="text-2xl font-heading font-bold text-text-main dark:text-white">
            Email Confirmed!
          </h2>
          <p className="text-lg font-body text-text-secondary leading-relaxed dark:text-white/80">
            Your email has been successfully confirmed. You can now sign in to your Nchekwa_Afrika account.
          </p>
          <p className="text-sm font-body text-text-secondary dark:text-white/70">
            Redirecting to login...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 dark:bg-background-dark border border-primary-light rounded-2xl shadow-lg p-4 sm:p-6 md:p-10 w-full max-w-md mx-4 box-border"
      >
        <div className="text-center mb-8">
          <NchekwaLogo size="w-20 h-20" />
          <h1 className="text-3xl font-heading font-bold text-text-main dark:text-white mt-4 mb-2">
            Confirm Your Email
          </h1>
          <p className="text-lg font-body text-text-secondary leading-relaxed dark:text-white/80">
            {token ? 'Verifying your email...' : confirmationLink ? 'Email service not configured. Use the link below to confirm your email:' : 'Please check your email for a confirmation link'}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-body text-text-secondary dark:text-white/80">Verifying your email address...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="p-4 bg-error/10 dark:bg-error/20 border border-error/30 dark:border-error/50 rounded-xl">
                <p className="text-sm font-body text-error dark:text-error flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </p>
              </div>
            )}

            {success && !token && (
              <div className="p-4 bg-success/10 dark:bg-success/20 border border-success/30 dark:border-success/50 rounded-xl">
                <p className="text-sm font-body text-success dark:text-success flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirmation email sent! Please check your inbox.</span>
                </p>
              </div>
            )}

            {/* Show confirmation link (when email service not configured) */}
            {devConfirmationLink && (
              <div className="p-4 bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/50 rounded-xl">
                <p className="text-sm font-inter font-semibold text-primary dark:text-primary-light mb-2">
                  📧 Confirmation Link
                </p>
                <p className="text-xs font-inter text-text-secondary dark:text-white/70 mb-3">
                  Email service is not configured yet. Use this link to confirm your email:
                </p>
                <div className="space-y-2">
                  <a
                    href={devConfirmationLink}
                    className="block p-3 bg-white dark:bg-slate-800 rounded-lg border border-primary/30 dark:border-primary/50 text-xs text-primary dark:text-primary-light break-all hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                  >
                    {devConfirmationLink}
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(devConfirmationLink)
                      setSuccess(true)
                      setTimeout(() => setSuccess(false), 2000)
                    }}
                    className="w-full px-3 py-2 bg-primary hover:bg-primary-light text-white text-sm font-inter rounded-lg transition-colors"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            )}

            {devToken && !confirmationLink && (
              <div className="p-4 bg-accent/10 dark:bg-accent/20 border border-accent/30 dark:border-accent/50 rounded-xl">
                <p className="text-sm font-inter font-semibold text-accent dark:text-accent mb-2">
                  🔧 Development Mode: Confirmation Token
                </p>
                <p className="text-xs font-inter text-text-light dark:text-slate-400 mb-2">
                  Token: <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{devToken}</code>
                </p>
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/confirm-email?token=${devToken}`
                    navigator.clipboard.writeText(link)
                    setSuccess(true)
                    setTimeout(() => setSuccess(false), 2000)
                  }}
                  className="w-full px-3 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-inter rounded-lg transition-colors"
                >
                  Copy Confirmation Link
                </button>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-inter font-medium text-text-dark dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-text-secondary dark:text-white/60" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:border-primary-light focus:ring-primary-light/20 bg-white dark:bg-slate-700 text-text-dark dark:text-white font-inter"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <motion.button
              onClick={handleResend}
              disabled={resending}
              whileHover={{ scale: resending ? 1 : 1.05 }}
              whileTap={{ scale: resending ? 1 : 0.98 }}
              className="w-full py-4 rounded-xl bg-primary text-white font-heading font-semibold shadow-md hover:bg-primary-dark hover:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {resending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  <span>Resend Confirmation Email</span>
                </>
              )}
            </motion.button>
          </div>
        )}

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

