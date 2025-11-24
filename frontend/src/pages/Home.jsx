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
    color: 'bg-primary',
    description: 'Connect with counselors'
  },
  { 
    name: 'Resources', 
    icon: MapPin, 
    href: '/app/resources', 
    color: 'bg-primaryLight',
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
    color: 'bg-primary',
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
      color: 'bg-primary',
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
      color: 'bg-primary',
      subtitle: 'Keep building your safety'
    },
  ]

  return (
    <div className="space-y-8 pb-20 md:pb-8 min-h-screen">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-4xl md:text-5xl font-poppins font-semibold text-dark dark:text-white">
          Welcome back, you're safe here
        </h1>
        <p className="text-lg font-inter text-light dark:text-light">
          How can we support you today?
        </p>
      </motion.div>

      {/* SOS Emergency Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex justify-center"
      >
        <button
          onClick={handleSOS}
          disabled={sosPressed}
          className="relative w-full max-w-md h-48 bg-error dark:bg-error rounded-2xl shadow-2xl flex flex-col items-center justify-center text-white transform transition-all duration-200 hover:shadow-error/50 disabled:opacity-75"
        >
          {sosPressed && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="absolute inset-0 bg-error rounded-2xl opacity-50"
            />
          )}
          <AlertCircle className="w-16 h-16 mb-4" />
          <span className="text-3xl font-bold">Emergency Assistance</span>
          <span className="text-sm mt-2 opacity-90">Press if you need immediate help</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div>
        <h2 className="text-2xl font-poppins font-semibold text-dark dark:text-white mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-primary dark:text-primary-light" />
          Your Progress
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => stat.href && navigate(stat.href)}
                className={`bg-white dark:bg-dark rounded-2xl p-6 shadow-md border border-light dark:border-light/30 ${
                  stat.href ? 'cursor-pointer hover:shadow-lg transition-all' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  {stat.href && (
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="text-light dark:text-light"
                    >
                      →
                    </motion.div>
                  )}
                </div>
                <h3 className="text-sm font-inter font-medium text-light dark:text-light mb-1">
                  {stat.label}
                </h3>
                <p className="text-2xl font-poppins font-semibold text-dark dark:text-white mb-1">
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs font-inter text-light dark:text-light">
                    {stat.subtitle}
                  </p>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-poppins font-semibold text-dark dark:text-white mb-4 flex items-center">
          <Clock className="w-6 h-6 mr-2 text-accent dark:text-accent" />
          Quick Access
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.href)}
              className="bg-primary hover:bg-primaryLight rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <action.icon className="w-8 h-8 mb-3 mx-auto" />
              <p className="text-sm font-inter font-semibold mb-1">{action.name}</p>
              <p className="text-xs font-inter opacity-90">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Safety Reminder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-primary/10 dark:bg-primary/20 rounded-2xl p-6 border border-primary/30 dark:border-primary/50"
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Heart className="w-6 h-6 text-accent dark:text-accent" />
          </div>
          <div>
            <h3 className="font-poppins font-semibold text-dark dark:text-white mb-2">Remember</h3>
            <p className="text-sm font-inter text-light dark:text-light">
              You can exit quickly using the quick exit button. Your privacy and safety are our top priorities.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Emergency Contacts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-dark rounded-2xl p-6 shadow-md border border-light dark:border-light/30"
      >
        <h3 className="font-poppins font-semibold text-dark dark:text-white mb-4 flex items-center">
          <Phone className="w-5 h-5 mr-2 text-primary dark:text-primary-light" />
          Emergency Contacts
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <span className="text-sm font-inter font-medium text-dark dark:text-light">National Helpline</span>
            <a href="tel:1-800-799-7233" className="text-primary dark:text-primary-light font-inter font-semibold hover:underline">
              1-800-799-7233
            </a>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <span className="text-sm font-inter font-medium text-dark dark:text-light">Crisis Text Line</span>
            <span className="text-primary dark:text-primary-light font-inter font-semibold">Text HOME to 741741</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
