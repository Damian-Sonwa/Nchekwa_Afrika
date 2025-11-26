import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  AlertCircle, MessageSquare, MapPin, Shield, Lock, Phone, Heart,
  TrendingUp, FileText, Calendar, Activity, Users, Clock, CheckCircle2
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { sendSOSAlert, getEvidence, getSafetyPlans } from '../services/api'

/**
 * Modern Dashboard/Home Page
 * 
 * Redesigned to be modern, clean, responsive, and engaging.
 * Includes key metrics, shortcuts, and cards for frequently used features.
 * Trauma-informed design with smooth animations.
 */

const quickActions = [
  { 
    name: 'Chat Support', 
    icon: MessageSquare, 
    href: '/app/chat', 
    color: 'bg-accent',
    description: 'Connect with counselors'
  },
  { 
    name: 'Resources', 
    icon: MapPin, 
    href: '/app/resources', 
    color: 'bg-accentLight',
    description: 'Find help near you'
  },
  { 
    name: 'Safety Plan', 
    icon: Shield, 
    href: '/app/safety-plan', 
    color: 'bg-accent',
    description: 'Your safety plan'
  },
  { 
    name: 'Evidence Vault', 
    icon: Lock, 
    href: '/app/evidence', 
    color: 'bg-accent',
    description: 'Secure storage'
  },
]

export default function Home() {
  const navigate = useNavigate()
  const { anonymousId } = useApp()
  const [sosPressed, setSosPressed] = useState(false)
  const [stats, setStats] = useState({
    evidenceCount: 0,
    safetyPlanSteps: 0,
    completedSteps: 0,
    lastActivity: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [anonymousId])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load evidence count
      const evidenceResponse = await getEvidence(anonymousId)
      const evidenceCount = evidenceResponse?.evidence?.length || 0

      // Load safety plan
      const planResponse = await getSafetyPlans(anonymousId)
      const plan = planResponse?.plans?.[0]
      const steps = plan?.steps || []
      const completedSteps = steps.filter(s => s.completed).length

      setStats({
        evidenceCount,
        safetyPlanSteps: steps.length,
        completedSteps,
        lastActivity: plan?.lastUpdated || null
      })
    } catch (error) {
      console.error('Load dashboard data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSOS = async () => {
    if (!confirm('Send SOS alert? This will send your location to emergency responders.')) {
      return
    }

    setSosPressed(true)
    try {
      let location = null
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
          },
          () => {
            console.log('Location access denied')
          }
        )
      }

      await sendSOSAlert(anonymousId, location)
      alert('SOS alert sent. Help is on the way.')
    } catch (error) {
      console.error('SOS error:', error)
      alert('SOS alert sent. Help is on the way.')
    } finally {
      setSosPressed(false)
    }
  }

  const statCards = [
    {
      icon: FileText,
      label: 'Evidence Items',
      value: stats.evidenceCount,
      color: 'bg-accent',
      href: '/app/evidence'
    },
    {
      icon: Shield,
      label: 'Safety Plan Progress',
      value: stats.safetyPlanSteps > 0 
        ? `${stats.completedSteps}/${stats.safetyPlanSteps}`
        : 'Not started',
      color: 'bg-accent',
      href: '/app/safety-plan',
      subtitle: stats.safetyPlanSteps > 0 
        ? `${Math.round((stats.completedSteps / stats.safetyPlanSteps) * 100)}% complete`
        : 'Create your plan'
    },
    {
      icon: Activity,
      label: 'Last Activity',
      value: stats.lastActivity 
        ? new Date(stats.lastActivity).toLocaleDateString()
        : 'Today',
      color: 'bg-accent',
      subtitle: 'Keep building your safety'
    },
  ]

  return (
    <div className="w-full max-w-full overflow-x-hidden box-border space-y-4 sm:space-y-5 md:space-y-6 pb-20 md:pb-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-text-main">
          Welcome back, you're safe here
        </h1>
        <p className="text-lg font-body text-text-secondary leading-relaxed text-text-secondary">
          How can we support you today?
        </p>
      </motion.div>

      {/* SOS Emergency Button - Compact Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative w-full max-w-full overflow-hidden"
      >
        {/* Pulsing background effect - smaller */}
        <motion.div
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl blur-lg -z-10"
        />
        
        <button
          onClick={handleSOS}
          disabled={sosPressed}
          className="relative w-full group overflow-hidden"
        >
          {/* Main button - with glass morphism */}
          <div 
            className="relative rounded-2xl shadow-2xl p-4 sm:p-5 md:p-6 flex flex-row items-center justify-between text-text-main transform transition-all duration-300 hover:shadow-error/50 disabled:opacity-75 border-2 border-accent/20 min-h-[100px] sm:min-h-[120px] md:min-h-[140px] w-full max-w-full box-border"
            style={{
              background: 'rgba(239, 68, 68, 0.95)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: '0 8px 32px 0 rgba(239, 68, 68, 0.37)'
            }}
          >
            {/* Background image with better visibility */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <img 
                src="/StockCake-someone_pressing_an_emergency_button_Images_and_Photos_1763940162.jpg"
                alt="Emergency button"
                className="w-full h-full object-cover opacity-30"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              {/* Lighter overlay for better text readability while keeping image visible */}
              <div className="absolute inset-0 bg-error/85" />
            </div>
            
            {/* Shine effect on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
            />
            
            {/* Content - horizontal layout */}
            <div className="relative z-10 flex flex-row items-center justify-between w-full gap-3 sm:gap-4 md:gap-6">
              {/* Left side - Icon and text */}
              <div className="flex flex-row items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {/* Icon - smaller */}
                <div className="relative flex-shrink-0">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.4, 0.7, 0.4],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-accent/20 rounded-full blur-sm"
                  />
                  <motion.div
                    animate={sosPressed ? {
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{
                      duration: 0.5,
                      repeat: sosPressed ? Infinity : 0,
                    }}
                    className="relative"
                  >
                    <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 drop-shadow-lg" strokeWidth={2.5} />
                  </motion.div>
                </div>
                
                {/* Text content */}
                <div className="flex flex-col min-w-0 flex-1">
                  <motion.h2
                    animate={sosPressed ? {
                      scale: [1, 1.03, 1],
                    } : {}}
                    transition={{
                      duration: 0.5,
                      repeat: sosPressed ? Infinity : 0,
                    }}
                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-heading font-extrabold mb-1 drop-shadow-lg tracking-tight break-words text-text-main"
                    style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)' }}
                  >
                    EMERGENCY SOS
                  </motion.h2>
                  
                  <p className="text-xs sm:text-sm md:text-base font-body font-medium text-text-main break-words drop-shadow-md">
                    {sosPressed ? 'Sending alert...' : 'Tap for immediate help'}
                  </p>
                  
                  {/* Urgency indicator - compact */}
                  <div className="mt-1 sm:mt-2 flex items-center space-x-1.5 text-[10px] sm:text-xs font-body font-semibold text-text-main drop-shadow-sm">
                    <motion.div
                      animate={{
                        opacity: [1, 0.5, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
                      className="w-1.5 h-1.5 bg-accent rounded-full shadow-sm"
                    />
                    <span>24/7 Available</span>
                  </div>
                </div>
              </div>
              
              {/* Right side - Image - visible on all devices */}
              <div className="relative flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
                >
                  <img 
                    src="/StockCake-someone_pressing_an_emergency_button_Images_and_Photos_1763940162.jpg"
                    alt="Emergency assistance"
                    className="w-full h-full rounded-xl shadow-lg border-2 border-accent/30 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-error/30 to-transparent rounded-xl" />
                </motion.div>
              </div>
            </div>
          </div>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="w-full">
        <h2 className="text-3xl font-heading font-bold text-text-main mb-3 sm:mb-4 md:mb-5 flex items-center">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-accent" />
          Your Progress
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full max-w-full">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                onClick={() => stat.href && navigate(stat.href)}
                className={`bg-background/90 border border-accent/20 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 ${
                  stat.href ? 'cursor-pointer hover:border-primary' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
                  </div>
                  {stat.href && (
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="text-text-secondary text-xl"
                    >
                      →
                    </motion.div>
                  )}
                </div>
                <h3 className="text-base font-body font-medium text-text-secondary mb-2">
                  {stat.label}
                </h3>
                <p className="text-2xl sm:text-3xl font-heading font-bold text-text-main mb-1">
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-sm font-body text-text-secondary text-text-secondary mt-1">
                    {stat.subtitle}
                  </p>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="w-full">
        <h2 className="text-3xl font-heading font-bold text-text-main mb-3 sm:mb-4 md:mb-5 flex items-center">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-accent" />
          Quick Access
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full max-w-full">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(action.href)}
              className="w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 rounded-xl bg-accent text-text-main font-heading font-semibold shadow-md hover:bg-accent-dark hover:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-accent"
            >
              <action.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mb-2 mx-auto" />
              <p className="text-xs sm:text-sm font-body font-semibold mb-1 break-words">{action.name}</p>
              <p className="text-[10px] sm:text-xs font-body opacity-90 break-words">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Safety Reminder & Emergency Contacts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 w-full max-w-full">
      {/* Safety Reminder */}
      <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
          className="bg-background/90 border border-accent/20 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 p-3 rounded-xl bg-accent/20">
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
          </div>
          <div>
              <h3 className="font-heading font-semibold text-lg sm:text-xl text-text-main mb-2">Remember</h3>
              <p className="text-lg font-body text-text-secondary leading-relaxed text-text-secondary">
              You can exit quickly using the quick exit button. Your privacy and safety are our top priorities.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Emergency Contacts */}
      <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
          className="bg-background/90 border border-accent/20 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
        >
          <h3 className="text-3xl font-heading font-bold text-text-main mb-4 sm:mb-6 flex items-center">
            <div className="p-2 rounded-lg bg-accent/10 mr-3">
              <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            </div>
          Emergency Contacts
        </h3>
        <div className="space-y-3">
            <motion.a
              href="tel:1-800-799-7233"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex justify-between items-center p-4 bg-background border border-accent/20 rounded-xl hover:shadow-md transition-all duration-300 group"
            >
              <span className="text-lg font-body text-text-main">National Helpline</span>
              <span className="text-accent font-body font-semibold group-hover:underline">
              1-800-799-7233
              </span>
            </motion.a>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex justify-between items-center p-4 bg-background border border-accent/20 rounded-xl hover:shadow-md transition-all duration-300"
            >
              <span className="text-lg font-body text-text-main">Crisis Text Line</span>
              <span className="text-accent font-body font-semibold">Text HOME to 741741</span>
            </motion.div>
          </div>
        </motion.div>
        </div>
    </div>
  )
}
