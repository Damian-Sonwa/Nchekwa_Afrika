import { useState, useEffect, useRef } from 'react'
import { sendSOSAlert } from '../services/api'

/**
 * Automated Location Trail Alerts Hook
 * 
 * Shares user location periodically with trusted contacts during emergencies.
 * 
 * Usage:
 * const { startTrail, stopTrail, isActive } = useLocationTrail(anonymousId)
 */

export function useLocationTrail(anonymousId) {
  const [isActive, setIsActive] = useState(false)
  const [interval, setInterval] = useState(30000) // 30 seconds default
  const [trustedContacts, setTrustedContacts] = useState([])
  const intervalRef = useRef(null)
  const watchIdRef = useRef(null)

  // Load saved settings
  useEffect(() => {
    const saved = localStorage.getItem('locationTrailSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      setInterval(settings.interval || 30000)
      setTrustedContacts(settings.contacts || [])
    }
  }, [])

  // Save settings
  useEffect(() => {
    localStorage.setItem('locationTrailSettings', JSON.stringify({
      interval,
      contacts: trustedContacts,
    }))
  }, [interval, trustedContacts])

  const sendLocationUpdate = async (location) => {
    try {
      // Send to backend which will notify trusted contacts
      await sendSOSAlert(anonymousId, location)
      console.log('Location trail update sent:', location)
    } catch (error) {
      console.error('Location trail error:', error)
    }
  }

  const startTrail = (customInterval = null) => {
    if (!navigator.geolocation) {
      alert('Location services are not available')
      return
    }

    setIsActive(true)
    const updateInterval = customInterval || interval

    // Get initial location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date().toISOString(),
        }
        sendLocationUpdate(location)
      },
      (error) => {
        console.error('Location error:', error)
        setIsActive(false)
      }
    )

    // Watch position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date().toISOString(),
        }
        sendLocationUpdate(location)
      },
      (error) => {
        console.error('Location watch error:', error)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    )

    // Also send periodic updates
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString(),
          }
          sendLocationUpdate(location)
        },
        (error) => console.error('Periodic location error:', error)
      )
    }, updateInterval)
  }

  const stopTrail = () => {
    setIsActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTrail()
    }
  }, [])

  return {
    isActive,
    startTrail,
    stopTrail,
    interval,
    setInterval,
    trustedContacts,
    setTrustedContacts,
  }
}


