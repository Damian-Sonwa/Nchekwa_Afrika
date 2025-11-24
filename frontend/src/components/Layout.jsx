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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content - adjusts for sidebar width dynamically */}
      <motion.main
        animate={{
          marginLeft: isMobile ? 0 : sidebarWidth,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <Outlet />
        </motion.div>
      </motion.main>
    </div>
  )
}

