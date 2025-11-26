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
    <div className="w-full max-w-full overflow-x-hidden box-border space-y-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-heading font-bold text-text-main">
          Wellness & Mental Health
        </h1>
        <p className="text-lg font-body text-text-secondary leading-relaxed dark:text-white/80">Take care of yourself, one moment at a time</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-accent/20">
        {[
          { id: 'mood', label: 'Mood Tracker', icon: Heart },
          { id: 'exercises', label: 'Grounding', icon: Smile },
          { id: 'checkin', label: 'Check-in', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-all duration-300 font-heading ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-main'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </motion.button>
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
              className="bg-accent/20 border border-primary-light rounded-2xl p-6"
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{currentMood.emoji}</div>
                <div>
                  <h3 className="text-3xl font-heading font-bold text-text-main">
                    Current Mood: {currentMood.label}
                  </h3>
                  <p className="text-sm font-body text-text-secondary">Last logged: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Log Mood */}
          <div className="bg-card border rounded-2xl shadow-lg p-6" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <h2 className="text-3xl font-heading font-bold text-text-main mb-4">How are you feeling right now?</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4 w-full max-w-full">
              {moodOptions.map((mood) => (
                <motion.button
                  key={mood.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedMood === mood.id
                      ? 'border-primary bg-accent/20'
                      : 'border-accent/20 hover:border-primary'
                  }`}
                >
                  <div className="text-3xl mb-2">{mood.emoji}</div>
                  <div className="text-xs font-body font-medium text-text-main">{mood.label}</div>
                </motion.button>
              ))}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional: Add notes about how you're feeling..."
              className="w-full p-3 font-body border-2 border-primary-light dark:border-primary/30 rounded-xl mb-4 focus:border-primary focus:ring-2 focus:ring-accent bg-white dark:bg-background-dark text-text-main transition-all duration-300"
              rows={3}
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogMood}
              disabled={!selectedMood}
              className="w-full px-6 py-3 rounded-xl bg-accent text-primary font-heading font-bold shadow-md hover:bg-accent-gold hover:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Log Mood
            </motion.button>
          </div>

          {/* Mood Stats */}
          {Object.keys(moodStats).length > 0 && (
            <div className="bg-card border rounded-2xl shadow-lg p-6" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <h2 className="text-3xl font-heading font-bold text-text-main mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
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
                        <div className="flex justify-between text-sm font-body mb-1 text-text-main">
                          <span>{mood.label}</span>
                          <span>{count} times</span>
                        </div>
                        <div className="w-full bg-background-light dark:bg-background-dark rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-primary"
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

