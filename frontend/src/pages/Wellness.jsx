import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Calendar, TrendingUp, Smile } from 'lucide-react'
import { useMoodTracker } from '../hooks/useMoodTracker'
import GroundingExercises from '../components/GroundingExercises'
import EmotionalCheckinTab from '../components/EmotionalCheckinTab'

/**
 * Wellness & Mental Health Page
 * 
 * Features:
 * - Mood Tracker
 * - Grounding Exercises
 * - Emotional Check-ins
 * - Wellness Stats
 */

export default function Wellness() {
  const { currentMood, moodOptions, logMood, getMoodHistory, getMoodStats } = useMoodTracker()
  const [activeTab, setActiveTab] = useState('mood') // mood, exercises, checkin
  const [selectedMood, setSelectedMood] = useState(null)
  const [notes, setNotes] = useState('')

  const moodStats = getMoodStats(7)
  const recentHistory = getMoodHistory(7)

  const handleLogMood = async () => {
    if (selectedMood) {
      const success = await logMood(selectedMood, notes)
      if (success) {
        setSelectedMood(null)
        setNotes('')
        // Reload mood history to update stats
        window.location.reload() // Simple refresh, or use state update
      } else {
        alert('Failed to log mood. Please try again.')
      }
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Wellness & Mental Health
        </h1>
        <p className="font-inter text-text-light dark:text-slate-300">Take care of yourself, one moment at a time</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'mood', label: 'Mood Tracker', icon: Heart },
          { id: 'exercises', label: 'Grounding', icon: Smile },
          { id: 'checkin', label: 'Check-in', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-text-light dark:text-slate-400 hover:text-text-dark dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Mood Tracker Tab */}
      {activeTab === 'mood' && (
        <div className="space-y-6">
          {/* Current Mood */}
          {currentMood && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6"
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{currentMood.emoji}</div>
                <div>
                  <h3 className="text-xl font-poppins font-semibold text-text-dark dark:text-white">
                    Current Mood: {currentMood.label}
                  </h3>
                  <p className="text-sm font-inter text-text-light dark:text-slate-300">Last logged: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Log Mood */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-poppins font-semibold text-text-dark dark:text-white mb-4">How are you feeling right now?</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
              {moodOptions.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedMood === mood.id
                      ? 'border-primary bg-primary/10'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="text-3xl mb-2">{mood.emoji}</div>
                  <div className="text-xs font-inter font-medium text-text-dark dark:text-white">{mood.label}</div>
                </button>
              ))}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional: Add notes about how you're feeling..."
              className="w-full p-3 font-inter border border-slate-300 dark:border-slate-600 rounded-lg mb-4 focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 bg-white dark:bg-slate-700 text-text-dark dark:text-white"
              rows={3}
            />
            <button
              onClick={handleLogMood}
              disabled={!selectedMood}
              className="w-full px-6 py-3 bg-primary hover:bg-primary-light text-white rounded-xl font-inter font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Log Mood
            </button>
          </div>

          {/* Mood Stats */}
          {Object.keys(moodStats).length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-poppins font-semibold text-text-dark dark:text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                This Week's Mood
              </h2>
              <div className="space-y-2">
                {Object.entries(moodStats).map(([moodId, count]) => {
                  const mood = moodOptions.find(m => m.id === moodId)
                  if (!mood) return null
                  return (
                    <div key={moodId} className="flex items-center space-x-3">
                      <span className="text-2xl">{mood.emoji}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{mood.label}</span>
                          <span>{count} times</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${mood.color}`}
                            style={{ width: `${(count / recentHistory.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grounding Exercises Tab */}
      {activeTab === 'exercises' && (
        <GroundingExercises />
      )}

      {/* Check-in Tab */}
      {activeTab === 'checkin' && (
        <EmotionalCheckinTab />
      )}
    </div>
  )
}

