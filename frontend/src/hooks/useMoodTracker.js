import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { saveMoodEntry, getMoodHistory, getMoodStats as getMoodStatsAPI } from '../services/api'

/**
 * Mood Tracker Hook
 * 
 * Manages mood tracking with backend integration.
 * Stores mood entries in MongoDB via API.
 */

const moodOptions = [
  { id: 'calm', label: 'Calm', emoji: '😌', color: 'bg-blue-500' },
  { id: 'anxious', label: 'Anxious', emoji: '😰', color: 'bg-yellow-500' },
  { id: 'sad', label: 'Sad', emoji: '😢', color: 'bg-blue-600' },
  { id: 'angry', label: 'Angry', emoji: '😠', color: 'bg-red-500' },
  { id: 'hopeful', label: 'Hopeful', emoji: '✨', color: 'bg-purple-500' },
  { id: 'grateful', label: 'Grateful', emoji: '🙏', color: 'bg-green-500' },
]

export function useMoodTracker() {
  const { anonymousId } = useApp()
  const [moodHistory, setMoodHistory] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (anonymousId) {
      loadMoodHistory()
    }
  }, [anonymousId])

  const loadMoodHistory = async () => {
    try {
      setLoading(true)
      const response = await getMoodHistory(anonymousId)
      if (response.success) {
        setMoodHistory(response.entries || [])
      }
    } catch (error) {
      console.error('Load mood history error:', error)
    } finally {
      setLoading(false)
    }
  }

  const logMood = async (moodId, notes = '') => {
    if (!anonymousId) {
      console.error('No anonymousId available')
      return
    }

    try {
      const mood = moodOptions.find(m => m.id === moodId)
      if (!mood) {
        console.error('Invalid mood ID')
        return
      }

      // Get location if available
      let geotag = null
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          })
          geotag = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
        } catch (error) {
          console.log('Location not available')
        }
      }

      const response = await saveMoodEntry(anonymousId, {
        moodId,
        moodLabel: mood.label,
        emoji: mood.emoji,
        notes,
        geotag
      })

      if (response.success) {
        // Reload history
        await loadMoodHistory()
        return true
      }
      return false
    } catch (error) {
      console.error('Log mood error:', error)
      return false
    }
  }

  const getMoodHistoryLocal = (days = 30) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return moodHistory.filter(entry => {
      const entryDate = new Date(entry.createdAt)
      return entryDate >= cutoffDate
    })
  }

  const getMoodStats = (days = 7) => {
    const recentHistory = getMoodHistoryLocal(days)
    const stats = {}
    
    recentHistory.forEach(entry => {
      stats[entry.moodId] = (stats[entry.moodId] || 0) + 1
    })
    
    return stats
  }

  const currentMood = moodHistory.length > 0 
    ? moodOptions.find(m => m.id === moodHistory[0].moodId)
    : null

  return {
    currentMood,
    moodOptions,
    moodHistory,
    loading,
    logMood,
    getMoodHistory: getMoodHistoryLocal,
    getMoodStats
  }
}
