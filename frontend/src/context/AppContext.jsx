import { createContext, useContext, useState, useEffect } from 'react'
import CryptoJS from 'crypto-js'
import { createAnonymousSession } from '../services/api'

const AppContext = createContext()

const ENCRYPTION_KEY = 'gbv-app-encryption-key-2024'

export function AppProvider({ children }) {
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [anonymousId, setAnonymousId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAppState()
  }, [])

  const loadAppState = async () => {
    try {
      // Small delay to ensure localStorage is available
      await new Promise(resolve => setTimeout(resolve, 50))
      
      const onboarded = localStorage.getItem('isOnboarded')
      const anonId = localStorage.getItem('anonymousId')

      if (onboarded === 'true' && anonId) {
        setIsOnboarded(true)
        setAnonymousId(anonId)
      }
    } catch (error) {
      console.error('Load app state error:', error)
    } finally {
      // Always set loading to false, even on error
      setLoading(false)
    }
  }

  const completeOnboarding = async () => {
    try {
      const response = await createAnonymousSession()
      if (response.success) {
        localStorage.setItem('isOnboarded', 'true')
        localStorage.setItem('anonymousId', response.anonymousId)
        setAnonymousId(response.anonymousId)
        setIsOnboarded(true)
        return true
      }
    } catch (error) {
      console.error('Onboarding error:', error)
      // Create local ID as fallback
      const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('isOnboarded', 'true')
      localStorage.setItem('anonymousId', localId)
      setAnonymousId(localId)
      setIsOnboarded(true)
      return true
    }
  }

  // Also allow direct auth completion (for Auth page)
  const completeAuth = async () => {
    const anonId = localStorage.getItem('anonymousId')
    if (anonId) {
      setAnonymousId(anonId)
      setIsOnboarded(true)
      return true
    }
    return await completeOnboarding()
  }

  const encryptData = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString()
  }

  const decryptData = (encryptedData) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
    } catch (error) {
      console.error('Decrypt error:', error)
      return null
    }
  }

  const wipeAllData = async () => {
    try {
      localStorage.clear()
      setIsOnboarded(false)
      setAnonymousId(null)
    } catch (error) {
      console.error('Wipe data error:', error)
    }
  }

  return (
    <AppContext.Provider
      value={{
        isOnboarded,
        anonymousId,
        loading,
        completeOnboarding,
        completeAuth,
        encryptData,
        decryptData,
        wipeAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

