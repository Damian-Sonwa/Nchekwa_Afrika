import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, MessageSquare, BookOpen, ShieldCheck, Lock, GraduationCap,
  Shield, Heart, Settings, LogOut, AlertCircle, ChevronLeft,
  ChevronRight, Radio, Smartphone, Zap,
  Calendar, FileText, Gavel, Brain, Users, HelpCircle, Menu, X,
  Moon, Sun
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { useAuthStore } from '../store/authStore'
import { cn } from '../lib/utils'

/**
 * Collapsible Sidebar Component
 * 
 * Primary navigation hub with all features organized in sections.
 * Replaces header navigation completely.
 * 
 * Features:
 * - Collapsible/expandable
 * - Responsive (overlay on mobile, fixed on desktop)
 * - Smooth animations
 * - Active route highlighting
 * - Organized by category
 */

// Main navigation items
const mainNav = [
  { name: 'Home', href: '/app', icon: Home, color: 'text-primary' },
  { name: 'Chat', href: '/app/chat', icon: MessageSquare, color: 'text-primary' },
  { name: 'Resources', href: '/app/resources', icon: BookOpen, color: 'text-primary' },
  { name: 'Safety Plan', href: '/app/safety-plan', icon: ShieldCheck, color: 'text-primary' },
  { name: 'Evidence', href: '/app/evidence', icon: Lock, color: 'text-primary' },
  { name: 'Education', href: '/app/education', icon: GraduationCap, color: 'text-primary' },
  { name: 'Advanced Safety', href: '/app/advanced-safety', icon: Shield, color: 'text-primary' },
  { name: 'Wellness', href: '/app/wellness', icon: Heart, color: 'text-primary' },
]

// Wellness & Mental Health (individual features - kept for future expansion)
const wellnessFeatures = [
  { name: 'Mood Tracker', href: '/app/wellness', icon: Heart, color: 'text-primary' },
  { name: 'Grounding', href: '/app/wellness', icon: Brain, color: 'text-primary' },
  { name: 'Check-ins', href: '/app/wellness', icon: Calendar, color: 'text-primary' },
]

// Legal & Advocacy (to be implemented)
const legalFeatures = [
  { name: 'Law Database', href: '/app/legal', icon: Gavel, color: 'text-light', comingSoon: true },
  { name: 'Report Templates', href: '/app/legal', icon: FileText, color: 'text-light', comingSoon: true },
  { name: 'Legal Reminders', href: '/app/legal', icon: Calendar, color: 'text-light', comingSoon: true },
]

// Community & Support (to be implemented)
const communityFeatures = [
  { name: 'Peer Support', href: '/app/community', icon: Users, color: 'text-light', comingSoon: true },
  { name: 'Expert Q&A', href: '/app/community', icon: HelpCircle, color: 'text-light', comingSoon: true },
]

// Tech Features (to be implemented)
const techFeatures = [
  { name: 'Offline Mode', href: '/app/tech', icon: Radio, color: 'text-light', comingSoon: true },
  { name: 'Wearable', href: '/app/tech', icon: Smartphone, color: 'text-light', comingSoon: true },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { anonymousId, wipeAllData } = useApp()
  const { theme, toggleTheme, isDark } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState(null)

  // Load sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  // Save sidebar state
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed))
  }, [isCollapsed])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

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

  const NavItem = ({ item, onClick }) => {
    const isActive = location.pathname === item.href
    const Icon = item.icon

    return (
      <motion.button
        whileHover={{ x: isCollapsed ? 0 : 4 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick || (() => navigate(item.href))}
        className={cn(
          "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative font-inter",
          isActive
            ? "bg-primaryLight text-white shadow-md"
            : "text-dark dark:text-light hover:bg-background dark:hover:bg-dark/50 hover:text-dark dark:hover:text-white"
        )}
        title={isCollapsed ? item.name : undefined}
      >
        <Icon className={cn(
          "w-5 h-5 flex-shrink-0",
          isActive ? "text-white" : item.color || "text-light group-hover:text-dark"
        )} />
        {!isCollapsed && (
          <>
            <span className="font-inter font-medium flex-1 text-left">{item.name}</span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs bg-white/20 rounded-full font-inter">
                {item.badge}
              </span>
            )}
            {item.comingSoon && (
              <span className="px-2 py-0.5 text-xs bg-background text-light rounded-full font-inter">
                Soon
              </span>
            )}
          </>
        )}
        {isActive && !isCollapsed && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
      </motion.button>
    )
  }

  const NavSection = ({ title, items, icon: SectionIcon }) => {
    const isExpanded = expandedSection === title

    return (
      <div className="space-y-2">
        {!isCollapsed && (
          <button
            onClick={() => setExpandedSection(isExpanded ? null : title)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs font-inter font-semibold text-light dark:text-light uppercase tracking-wider hover:text-dark dark:hover:text-slate-300 transition-colors"
          >
            <div className="flex items-center space-x-2">
              {SectionIcon && <SectionIcon className="w-4 h-4" />}
              <span>{title}</span>
            </div>
            <ChevronRight className={cn(
              "w-4 h-4 transition-transform",
              isExpanded && "rotate-90"
            )} />
          </button>
        )}
        <AnimatePresence>
          {(!isCollapsed && isExpanded) || isCollapsed ? (
            <motion.div
              initial={isCollapsed ? false : { height: 0, opacity: 0 }}
              animate={isCollapsed ? false : { height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-1"
            >
              {items.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo/Header */}
      <div className="p-4 border-b border-light dark:border-light/30">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-poppins font-semibold text-primary">
                  Nchekwa_Afrika
                </h1>
                <p className="text-xs font-inter text-light dark:text-light">You are safe here</p>
              </div>
            </motion.div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md mx-auto" title="Nchekwa_Afrika">
              <Shield className="w-6 h-6 text-white" />
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-background dark:hover:bg-dark/50 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-light dark:text-light" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-light dark:text-light" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainNav.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>


        {/* Legal & Advocacy */}
        <NavSection
          title="Legal & Advocacy"
          items={legalFeatures}
          icon={Gavel}
        />

        {/* Community */}
        <NavSection
          title="Community"
          items={communityFeatures}
          icon={Users}
        />

        {/* Tech Features */}
        <NavSection
          title="Tech Features"
          items={techFeatures}
          icon={Zap}
        />
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-light dark:border-light/30 space-y-2">
        <NavItem
          item={{ name: 'Settings', href: '/app/settings', icon: Settings, color: 'text-light dark:text-light' }}
        />
        <button
          onClick={handleQuickExit}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-dark dark:text-light hover:bg-error/10 dark:hover:bg-error/20 hover:text-error dark:hover:text-error transition-all duration-200 group font-inter"
          title={isCollapsed ? 'Quick Exit' : undefined}
        >
          <AlertCircle className="w-5 h-5 text-light dark:text-slate-500 group-hover:text-error dark:group-hover:text-error" />
          {!isCollapsed && <span className="font-medium">Quick Exit</span>}
        </button>
        {anonymousId && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-dark dark:text-light hover:bg-background dark:hover:bg-dark/50 transition-all duration-200 group font-inter"
            title={isCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5 text-light dark:text-slate-500 group-hover:text-dark dark:group-hover:text-slate-300" />
            {!isCollapsed && <span className="font-medium">Sign Out</span>}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      {/* Width: 280px expanded, 80px collapsed - update Layout.jsx margin if changed */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 280,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 bg-white dark:bg-slate-900 border-r border-light dark:border-light/30 shadow-md"
        style={{ width: isCollapsed ? 80 : 280 }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-900 rounded-lg shadow-md border border-light dark:border-light/30"
      >
        <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 shadow-2xl z-50 md:hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Nchekwa
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">You are safe here</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="h-[calc(100vh-73px)] overflow-y-auto">
                <SidebarContent />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

