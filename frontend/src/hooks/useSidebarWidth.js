import { useState, useEffect } from 'react'

/**
 * Sidebar Width Hook
 * 
 * Tracks sidebar collapsed state to adjust main content margin.
 * 
 * Usage:
 * const { sidebarWidth } = useSidebarWidth()
 */

export function useSidebarWidth() {
  const [sidebarWidth, setSidebarWidth] = useState(280) // Default expanded width

  useEffect(() => {
    // Listen for sidebar state changes
    const checkSidebarState = () => {
      const collapsed = localStorage.getItem('sidebarCollapsed')
      if (collapsed !== null) {
        setSidebarWidth(JSON.parse(collapsed) ? 80 : 280)
      }
    }

    // Check on mount
    checkSidebarState()

    // Listen for storage changes (when sidebar toggles)
    window.addEventListener('storage', checkSidebarState)
    
    // Also check periodically (for same-tab updates)
    const interval = setInterval(checkSidebarState, 100)

    return () => {
      window.removeEventListener('storage', checkSidebarState)
      clearInterval(interval)
    }
  }, [])

  return { sidebarWidth }
}


