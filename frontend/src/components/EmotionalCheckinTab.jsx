import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, CheckCircle2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { saveEmotionalCheckin } from '../services/api'

/**
 * Emotional Check-in Tab Component
 * 
 * Allows users to reflect on their feelings and needs.
 * Saves to database via API.
 */

export default function EmotionalCheckinTab() {
  const { anonymousId } = useApp()
  const [feeling, setFeeling] = useState('')
  const [needs, setNeeds] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!anonymousId) {
      alert('Please complete onboarding first')
      return
    }

    setSaving(true)
    try {
      await saveEmotionalCheckin(anonymousId, {
        feeling,
        needs,
        notes
      })
      setSaved(true)
      setFeeling('')
      setNeeds('')
      setNotes('')
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Save check-in error:', error)
      alert('Failed to save check-in. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Emotional Check-in</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Take a moment to reflect on how you're feeling and what you need right now.
      </p>
      
      {saved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-2"
        >
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-600 dark:text-green-400">Check-in saved successfully</p>
        </motion.div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            How are you feeling today?
          </label>
          <textarea
            value={feeling}
            onChange={(e) => setFeeling(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Share your thoughts..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What do you need right now?
          </label>
          <textarea
            value={needs}
            onChange={(e) => setNeeds(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Support, space, resources..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="Any other thoughts..."
          />
        </div>
        <motion.button
          onClick={handleSave}
          disabled={saving || (!feeling.trim() && !needs.trim())}
          whileHover={{ scale: saving ? 1 : 1.02 }}
          whileTap={{ scale: saving ? 1 : 0.98 }}
          className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Check-in</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}


