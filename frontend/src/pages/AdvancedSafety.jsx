import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, MapPin, Mic, Volume2, Battery, Eye, EyeOff,
  Radio, Smartphone, Zap, Settings
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useSilentEscape } from '../hooks/useSilentEscape'
import { useLocationTrail } from '../hooks/useLocationTrail'
import { useVoiceCommandSOS } from '../hooks/useVoiceCommandSOS'
import SilentEscapeScreen from '../components/SilentEscapeScreen'

/**
 * Advanced Safety Features Page
 * 
 * Central hub for all advanced safety features:
 * - Silent Escape Mode
 * - Location Trail Alerts
 * - Voice Command SOS
 * - Smart Exit Detection
 * - Battery-Saver SOS Mode
 */

export default function AdvancedSafety() {
  const { anonymousId } = useApp()
  const { isEscapeMode, activateEscape, decoyType, setDecoyType } = useSilentEscape()
  const { isActive: trailActive, startTrail, stopTrail, interval, setInterval } = useLocationTrail(anonymousId)
  const { isListening, startListening, stopListening, transcript } = useVoiceCommandSOS(anonymousId)
  const [batterySaverMode, setBatterySaverMode] = useState(false)

  return (
    <>
      <SilentEscapeScreen />
      
      <div className="space-y-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Advanced Safety Features
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Enhanced protection and emergency tools</p>
        </motion.div>

        {/* Silent Escape Mode */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Silent Escape Mode</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Instantly switch to a decoy screen</p>
              </div>
            </div>
            <button
              onClick={() => activateEscape(decoyType)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Activate
            </button>
          </div>
          <div className="flex space-x-2">
            {['news', 'calculator', 'weather'].map((type) => (
              <button
                key={type}
                onClick={() => setDecoyType(type)}
                className={`px-3 py-1 rounded text-sm ${
                  decoyType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Triple tap anywhere or press Ctrl+Shift+E to activate
          </p>
        </motion.div>

        {/* Location Trail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Location Trail</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Share location with trusted contacts</p>
              </div>
            </div>
            <button
              onClick={trailActive ? stopTrail : () => startTrail()}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                trailActive
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {trailActive ? 'Stop' : 'Start'}
            </button>
          </div>
          {trailActive && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                ✓ Location sharing active - Updates every {interval / 1000} seconds
              </p>
            </div>
          )}
        </motion.div>

        {/* Voice Command SOS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Voice Command SOS</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Hands-free emergency activation</p>
              </div>
            </div>
            <button
              onClick={isListening ? stopListening : startListening}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isListening
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isListening ? 'Stop' : 'Start'}
            </button>
          </div>
          {isListening && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">Listening for: help, emergency, sos, danger, assist</p>
              {transcript && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{transcript}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Battery Saver SOS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Battery className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Battery-Saver SOS Mode</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reduce power usage while sending SOS</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={batterySaverMode}
                onChange={(e) => setBatterySaverMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {batterySaverMode && (
            <div className="mt-4 p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-700">
                ✓ Battery saver active - SOS signals sent with reduced frequency
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}

