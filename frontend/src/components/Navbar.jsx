import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, Menu, X, Home, MessageSquare, BookOpen, 
  ShieldCheck, Lock, GraduationCap, Settings, 
  User, LogOut, AlertCircle, ChevronDown, Heart
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuthStore } from '../store/authStore'
import { cn } from '../lib/utils'

/**
 * Modern Responsive Navigation Bar
 * 
 * DESIGN NOTES:
 * - Glassmorphism effect with backdrop blur
 * - Smooth hover/active animations
 * - Mobile hamburger menu with slide-in animation
 * - User menu dropdown when logged in
 * - Quick exit button always accessible
 * - All animations use Framer Motion
 */

const navigation = [
  { name: 'Home', href: '/app', icon: Home },
  { name: 'Resources', href: '/app/resources', icon: BookOpen },
  { name: 'Chat', href: '/app/chat', icon: MessageSquare },
  { name: 'Safety Plan', href: '/app/safety-plan', icon: ShieldCheck },
  { name: 'Evidence', href: '/app/evidence', icon: Lock },
  { name: 'Education', href: '/app/education', icon: GraduationCap },
  { name: 'Advanced Safety', href: '/app/advanced-safety', icon: Shield },
  { name: 'Wellness', href: '/app/wellness', icon: Heart },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { anonymousId, wipeAllData } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const isAuthenticated = !!anonymousId

  const handleQuickExit = () => {
    if (confirm('Quick exit? This will close the app immediately.')) {
      window.location.href = 'about:blank'
    }
  }

  const handleLogout = async () => {
    if (confirm('Sign out? You will need to log in again to access your account.')) {
      const { logout } = useAuthStore.getState()
      logout() // Clear auth state
      await wipeAllData() // Clear all app data
      navigate('/auth', { replace: true }) // Redirect to login page
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-accent/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <Link to="/app" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow"
              >
                <Shield className="w-6 h-6 text-primary" />
              </motion.div>
              <div>
                <h1 className="text-xl font-poppins font-semibold text-text-main">
                  Nchekwa_Afrika
                </h1>
                <p className="text-xs font-inter text-text-secondary">You are safe here</p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <motion.button
                  key={item.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ y: 0 }}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2",
                    isActive
                      ? "text-primary bg-accent/20"
                      : "text-text-main hover:text-text-main hover:bg-accent/10"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-accent/20 rounded-lg -z-10"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Quick Exit Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleQuickExit}
              className="p-2 text-text-secondary hover:text-error transition-colors rounded-lg hover:bg-error/20"
              title="Quick Exit"
            >
              <AlertCircle className="w-5 h-5" />
            </motion.button>

            {/* User Menu (if authenticated) */}
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent/10 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-gold rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-text-secondary transition-transform",
                    userMenuOpen && "rotate-180"
                  )} />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-background rounded-xl shadow-2xl border border-accent/20 py-2 overflow-hidden"
                    >
                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-text-main hover:bg-accent/10 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-error hover:bg-error/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={() => navigate('/auth')}
                  className="px-4 py-2 text-text-main hover:text-text-main font-medium transition-colors"
                >
                  Sign In
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/auth?mode=register')}
                  className="px-6 py-2 bg-accent text-primary rounded-lg font-semibold shadow-lg hover:bg-accent-gold hover:shadow-xl transition-all duration-200"
                >
                  Get Help
                </motion.button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-text-secondary hover:text-text-main rounded-lg hover:bg-accent/10 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-16 right-0 bottom-0 w-64 bg-background shadow-2xl z-50 md:hidden overflow-y-auto border-l border-accent/20"
            >
              <div className="p-4 space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <motion.button
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navigation.indexOf(item) * 0.05 }}
                      onClick={() => {
                        navigate(item.href)
                        setMobileMenuOpen(false)
                      }}
                      className={cn(
                        "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-accent text-primary shadow-lg"
                          : "text-text-main hover:bg-accent/10"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </motion.button>
                  )
                })}

                {!isAuthenticated && (
                  <div className="pt-4 border-t border-accent/20 space-y-2">
                    <button
                      onClick={() => {
                        navigate('/auth')
                        setMobileMenuOpen(false)
                      }}
                      className="w-full px-4 py-3 text-text-main hover:bg-accent/10 rounded-lg transition-colors text-left font-medium"
                    >
                      Sign In
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        navigate('/auth?mode=register')
                        setMobileMenuOpen(false)
                      }}
                      className="w-full px-4 py-3 bg-accent text-primary rounded-lg font-semibold shadow-lg"
                    >
                      Get Help
                    </motion.button>
                  </div>
                )}

                {isAuthenticated && (
                  <div className="pt-4 border-t border-accent/20 space-y-2">
                    <button
                      onClick={() => {
                        navigate('/settings')
                        setMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-text-main hover:bg-accent/10 rounded-lg transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-error hover:bg-error/20 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}
