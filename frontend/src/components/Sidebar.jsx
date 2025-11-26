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
  { name: 'Community', href: '/app/community', icon: Users, color: 'text-primary' },
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

    const handleClick = (e) => {
      // Stop event propagation to prevent clicks from bubbling to parent elements
      e.preventDefault()
      e.stopPropagation()
      
      if (onClick) {
        onClick()
      } else {
        navigate(item.href)
      }
    }

    return (
      // Container: Isolated clickable area with proper spacing to prevent overlap
      // mb-2 provides clear separation between items to prevent click interference
      <div className="relative w-full mb-2 isolate">
        {/* Active indicator - positioned absolutely behind button, z-0, pointer-events-none */}
        {isActive && !isCollapsed && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r z-0 pointer-events-none"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        
        {/* Clickable button - Full width button with proper z-index stacking */}
        {/* Removed scale animations to prevent layout shifts that interfere with click detection */}
        <button
          onClick={handleClick}
          type="button"
          className={cn(
            // Base styles: Full width, proper padding, cursor pointer, relative positioning
            "relative z-50 w-full flex items-center space-x-3 px-4 py-3 rounded-xl",
            // Transition: Smooth color transitions only (no scale to prevent layout shifts)
            "transition-colors duration-300",
            // Font and cursor
            "group font-body cursor-pointer",
            // Ensure proper containment - no margin that could shift clickable area
            "m-0",
            // Active state styling
            isActive
              ? "bg-background-light text-primary font-bold shadow-md dark:bg-background-light dark:text-primary"
              : "text-white dark:text-white/80 hover:bg-primary-light hover:text-text-main dark:hover:bg-primary dark:hover:text-white active:bg-primary-dark",
            // Ensure button is always clickable and on top
            "pointer-events-auto"
          )}
          title={isCollapsed ? item.name : undefined}
          aria-label={item.name}
        >
          <Icon className={cn(
            "w-5 h-5 flex-shrink-0 pointer-events-none",
            isActive ? "text-primary dark:text-primary" : "text-white/80 dark:text-white/80 group-hover:text-text-main dark:group-hover:text-white"
          )} />
          {!isCollapsed && (
            <>
              <span className="font-body font-medium flex-1 text-left pointer-events-none">{item.name}</span>
              {item.badge && (
                <span className="px-2 py-0.5 text-xs bg-white/20 rounded-full font-inter pointer-events-none">
                  {item.badge}
                </span>
              )}
              {item.comingSoon && (
                <span className="px-2 py-0.5 text-xs bg-background text-light rounded-full font-inter pointer-events-none">
                  Soon
                </span>
              )}
            </>
          )}
        </button>
      </div>
    )
  }

  const NavSection = ({ title, items, icon: SectionIcon }) => {
    const isExpanded = expandedSection === title

    const handleSectionToggle = (e) => {
      // Stop propagation to prevent triggering parent click handlers
      e.preventDefault()
      e.stopPropagation()
      setExpandedSection(isExpanded ? null : title)
    }

    return (
      // Section container: Isolated to prevent click interference with other sections
      <div className="relative w-full isolate mb-4">
        {/* Section Header - z-20 for toggle button, but items will be z-50 when expanded */}
        {!isCollapsed && (
          <div className="relative z-20 mb-3">
            <button
              type="button"
              onClick={handleSectionToggle}
              className={cn(
                // Base styles: Full width, proper padding, cursor pointer
                "relative w-full flex items-center justify-between px-4 py-2.5",
                "text-xs font-body font-semibold uppercase tracking-wider",
                "text-white/70 dark:text-white/70",
                "hover:text-white dark:hover:text-white",
                "transition-colors duration-300",
                "cursor-pointer m-0 pointer-events-auto",
                "rounded-lg hover:bg-primary/10",
                // Ensure proper containment
                "border-0 outline-none focus:outline-none"
              )}
              aria-label={`Toggle ${title} section`}
              aria-expanded={isExpanded}
            >
              <div className="flex items-center space-x-2 pointer-events-none">
                {SectionIcon && <SectionIcon className="w-4 h-4 pointer-events-none" />}
                <span className="pointer-events-none">{title}</span>
              </div>
              <ChevronRight className={cn(
                "w-4 h-4 transition-transform pointer-events-none",
                isExpanded && "rotate-90"
              )} />
            </button>
          </div>
        )}
        
        {/* Expanded Items Container - z-30 container, but items inside are z-50 */}
        <AnimatePresence>
          {(!isCollapsed && isExpanded) || isCollapsed ? (
            <motion.div
              initial={isCollapsed ? false : { height: 0, opacity: 0 }}
              animate={isCollapsed ? false : { height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className={cn(
                // Container: z-30 base, overflow-hidden to prevent items from extending during animation
                "relative z-30 overflow-hidden",
                // Margin when expanded to create clear separation from header
                !isCollapsed && isExpanded && "mt-2"
              )}
            >
              {/* Items container: space-y-0 because NavItem has mb-2 for spacing */}
              <div className="space-y-0">
                {items.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo/Header */}
      <div className="p-4 border-b border-primary/20">
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
                <h1 className="text-lg font-heading font-semibold text-white">
                  Nchekwa_Afrika
                </h1>
                <p className="text-xs font-body text-white/70">You are safe here</p>
              </div>
            </motion.div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md mx-auto" title="Nchekwa_Afrika">
              <Shield className="w-6 h-6 text-white" />
            </div>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsCollapsed(!isCollapsed)
            }}
            className="relative z-10 p-2 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-white/80 pointer-events-none" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-white/80 pointer-events-none" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Container - Proper overflow handling and spacing */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        {/* Main Navigation - Increased spacing (space-y-0 because NavItem has mb-2) */}
        {/* z-10 ensures main nav is above background but below expandable sections when expanded */}
        <div className="relative z-10 mb-6">
          {mainNav.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>

        {/* Expandable Sections - Proper spacing between sections */}
        {/* z-10 base, but items inside will have z-50 when expanded */}
        <div className="relative z-10 space-y-4">
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
      </div>

      {/* Footer Actions - Proper spacing and z-index, isolated from navigation */}
      <div className="p-4 border-t border-primary/20 relative z-10 isolate">
        {/* Settings item - mb-2 for spacing */}
        <div className="mb-2">
          <NavItem
            item={{ name: 'Settings', href: '/app/settings', icon: Settings, color: 'text-white/80' }}
          />
        </div>
        
        {/* Quick Exit button - Removed scale animations, proper spacing */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleQuickExit()
          }}
          className={cn(
            // Base styles: Full width, proper padding, cursor pointer
            "relative z-50 w-full flex items-center space-x-3 px-4 py-3 rounded-xl",
            "text-white/80 hover:bg-error/20 hover:text-white",
            "active:bg-error/30",
            "transition-colors duration-300",
            "group font-body cursor-pointer",
            "m-0 mb-2 pointer-events-auto",
            // Ensure proper containment
            "border-0 outline-none focus:outline-none"
          )}
          title={isCollapsed ? 'Quick Exit' : undefined}
          aria-label="Quick Exit"
        >
          <AlertCircle className="w-5 h-5 text-white/80 group-hover:text-white pointer-events-none" />
          {!isCollapsed && <span className="font-medium pointer-events-none">Quick Exit</span>}
        </button>
        
        {/* Sign Out button - Removed scale animations, proper spacing */}
        {anonymousId && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleLogout()
            }}
            className={cn(
              // Base styles: Full width, proper padding, cursor pointer
              "relative z-50 w-full flex items-center space-x-3 px-4 py-3 rounded-xl",
              "text-white/80",
              "hover:bg-primary-light hover:text-text-main",
              "dark:hover:bg-primary dark:hover:text-white",
              "active:bg-primary-dark",
              "transition-colors duration-300",
              "group font-body cursor-pointer",
              "m-0 pointer-events-auto",
              // Ensure proper containment
              "border-0 outline-none focus:outline-none"
            )}
            title={isCollapsed ? 'Sign Out' : undefined}
            aria-label="Sign Out"
          >
            <LogOut className="w-5 h-5 text-white/80 group-hover:text-text-main dark:group-hover:text-white pointer-events-none" />
            {!isCollapsed && <span className="font-medium pointer-events-none">Sign Out</span>}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      {/* Width: 280px expanded, 80px collapsed - update Layout.jsx margin if changed */}
      {/* Z-index: 50 ensures sidebar is above main content but below modals (z-50+) */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 280,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-50 bg-primary-dark dark:bg-primary-dark border-r border-primary/20 shadow-lg overflow-hidden"
        style={{ width: isCollapsed ? 80 : 280, maxWidth: isCollapsed ? 80 : 280 }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Menu Button - z-50 to be above main content */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsMobileOpen(true)
        }}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-primary-dark dark:bg-primary-dark rounded-lg shadow-md border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-white pointer-events-none" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {/* Z-index hierarchy: overlay z-40, sidebar z-50, button z-50 */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Overlay background - z-40, clickable to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsMobileOpen(false)
              }}
              className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 md:hidden cursor-pointer"
            />
            {/* Mobile sidebar drawer - z-50 to be above overlay */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed left-0 top-0 bottom-0 w-72 bg-primary-dark dark:bg-primary-dark shadow-2xl z-50 md:hidden overflow-hidden"
            >
              <div className="p-4 border-b border-primary/20 flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3 pointer-events-none">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-heading font-bold text-white">
                      Nchekwa_Afrika
                    </h1>
                    <p className="text-xs font-body text-white/70">You are safe here</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsMobileOpen(false)
                  }}
                  className="relative z-10 p-2 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-white/80 pointer-events-none" />
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

