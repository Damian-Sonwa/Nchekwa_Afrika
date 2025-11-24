import { useEffect, useRef } from 'react'
import { sendSOSAlert } from '../services/api'

/**
 * Smart Exit Detection Hook
 * 
 * Detects forced app closure or unusual navigation and triggers SOS automatically.
 * 
 * Usage:
 * useSmartExitDetection(anonymousId, { enabled: true })
 */

export function useSmartExitDetection(anonymousId, options = {}) {
  const { enabled = true, onDetect } = options
  const lastInteractionRef = useRef(Date.now())
  const suspiciousActivityRef = useRef(0)

  useEffect(() => {
    if (!enabled || !anonymousId) return

    // Track user interactions
    const updateInteraction = () => {
      lastInteractionRef.current = Date.now()
    }

    // Detect page visibility changes (tab switching, app minimization)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page hidden - could be suspicious
        suspiciousActivityRef.current++
        
        // If hidden multiple times quickly, might be forced closure
        if (suspiciousActivityRef.current > 3) {
          triggerSOS('Multiple rapid visibility changes detected')
        }
      } else {
        // Reset on return
        suspiciousActivityRef.current = 0
      }
    }

    // Detect beforeunload (attempted navigation/closure)
    const handleBeforeUnload = (e) => {
      const timeSinceInteraction = Date.now() - lastInteractionRef.current
      
      // If trying to close very quickly after interaction, might be forced
      if (timeSinceInteraction < 2000) {
        triggerSOS('Rapid app closure detected')
        // Don't prevent default - let it close, but SOS is sent
      }
    }

    // Detect rapid back button presses
    let backButtonPresses = 0
    const handlePopState = () => {
      backButtonPresses++
      if (backButtonPresses > 2) {
        triggerSOS('Rapid navigation detected')
        backButtonPresses = 0
      }
      setTimeout(() => {
        backButtonPresses = 0
      }, 2000)
    }

    // Detect focus loss (could indicate forced app switch)
    const handleBlur = () => {
      const timeSinceInteraction = Date.now() - lastInteractionRef.current
      if (timeSinceInteraction < 1000) {
        suspiciousActivityRef.current++
      }
    }

    // Monitor for inactivity followed by sudden closure
    const inactivityTimer = setInterval(() => {
      const timeSinceInteraction = Date.now() - lastInteractionRef.current
      // If inactive for 30 seconds, then suddenly active, might be suspicious
      if (timeSinceInteraction > 30000) {
        suspiciousActivityRef.current++
      }
    }, 5000)

    const triggerSOS = async (reason) => {
      console.warn('Smart exit detection triggered:', reason)
      
      try {
        let location = null
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }
              sendSOSAlert(anonymousId, location)
            },
            () => {
              sendSOSAlert(anonymousId, null)
            },
            { timeout: 2000 }
          )
        } else {
          await sendSOSAlert(anonymousId, null)
        }

        if (onDetect) {
          onDetect(reason)
        }
      } catch (error) {
        console.error('SOS trigger error:', error)
      }
    }

    // Event listeners
    document.addEventListener('click', updateInteraction)
    document.addEventListener('keydown', updateInteraction)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('click', updateInteraction)
      document.removeEventListener('keydown', updateInteraction)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('blur', handleBlur)
      clearInterval(inactivityTimer)
    }
  }, [enabled, anonymousId, onDetect])
}


