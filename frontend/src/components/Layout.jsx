import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'

/**
 * Main Layout Component
 * 
 * Uses collapsible sidebar instead of header navigation.
 * Content adjusts dynamically when sidebar expands/collapses.
 */

export default function Layout() {
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Listen for sidebar state changes
    const updateWidth = () => {
      const collapsed = localStorage.getItem('sidebarCollapsed')
      if (collapsed !== null) {
        setSidebarWidth(JSON.parse(collapsed) ? 80 : 280)
      }
    }

    updateWidth()
    const interval = setInterval(updateWidth, 100)

    return () => {
      window.removeEventListener('resize', checkMobile)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark overflow-x-hidden w-full max-w-full relative">
      {/* Collapsible Sidebar - z-50 to be above main content */}
      <Sidebar />

      {/* Main Content - adjusts for sidebar width dynamically */}
      {/* Z-index: 0 (default) ensures main content is below sidebar (z-50) */}
      <motion.main
        animate={{
          marginLeft: isMobile ? 0 : sidebarWidth,
          width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen overflow-y-auto overflow-x-hidden box-border relative z-0"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 box-border"
        >
          <Outlet />
        </motion.div>
      </motion.main>
    </div>
  )
}

