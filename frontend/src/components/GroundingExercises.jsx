import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wind, Eye, Hand, Heart } from 'lucide-react'

/**
 * Grounding Exercises Component
 * 
 * Provides breathing, meditation, and visualization exercises
 * to help users during moments of distress.
 */

const EXERCISES = {
  breathing: {
    name: 'Breathing Exercise',
    icon: Wind,
    description: 'Follow the circle to breathe in and out',
    duration: 300, // 5 minutes
  },
  fiveSenses: {
    name: '5-4-3-2-1 Grounding',
    icon: Eye,
    description: 'Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste',
    duration: 600, // 10 minutes
  },
  bodyScan: {
    name: 'Body Scan',
    icon: Hand,
    description: 'Focus on each part of your body, releasing tension',
    duration: 900, // 15 minutes
  },
  visualization: {
    name: 'Safe Place Visualization',
    icon: Heart,
    description: 'Imagine yourself in a safe, peaceful place',
    duration: 600, // 10 minutes
  },
}

export default function GroundingExercises() {
  const [activeExercise, setActiveExercise] = useState(null)
  const [breathPhase, setBreathPhase] = useState('inhale') // inhale, hold, exhale
  const [breathProgress, setBreathProgress] = useState(0)

  const startBreathing = () => {
    setActiveExercise('breathing')
    const cycle = () => {
      // Inhale: 4 seconds
      setBreathPhase('inhale')
      setBreathProgress(0)
      let progress = 0
      const inhaleInterval = setInterval(() => {
        progress += 100 / 40 // 4 seconds = 40 * 100ms
        setBreathProgress(Math.min(progress, 100))
        if (progress >= 100) {
          clearInterval(inhaleInterval)
          // Hold: 2 seconds
          setBreathPhase('hold')
          setTimeout(() => {
            // Exhale: 6 seconds
            setBreathPhase('exhale')
            setBreathProgress(0)
            progress = 0
            const exhaleInterval = setInterval(() => {
              progress += 100 / 60 // 6 seconds = 60 * 100ms
              setBreathProgress(Math.min(progress, 100))
              if (progress >= 100) {
                clearInterval(exhaleInterval)
                // Repeat
                setTimeout(cycle, 1000)
              }
            }, 100)
          }, 2000)
        }
      }, 100)
    }
    cycle()
  }

  const startFiveSenses = () => {
    setActiveExercise('fiveSenses')
  }

  const renderExercise = () => {
    switch (activeExercise) {
      case 'breathing':
        return (
          <div className="text-center space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Breathing Exercise</h2>
            <p className="text-gray-600">
              {breathPhase === 'inhale' && 'Breathe in slowly...'}
              {breathPhase === 'hold' && 'Hold your breath...'}
              {breathPhase === 'exhale' && 'Breathe out slowly...'}
            </p>
            <div className="flex items-center justify-center">
              <motion.div
                animate={{
                  scale: breathPhase === 'inhale' ? [1, 1.3, 1.3] : 
                         breathPhase === 'hold' ? [1.3, 1.3, 1.3] :
                         [1.3, 1, 1],
                }}
                transition={{
                  duration: breathPhase === 'inhale' ? 4 :
                           breathPhase === 'hold' ? 2 : 6,
                  ease: 'easeInOut',
                }}
                className="w-64 h-64 rounded-full border-4 border-blue-500 flex items-center justify-center"
              >
                <Wind className="w-16 h-16 text-blue-500" />
              </motion.div>
            </div>
            <button
              onClick={() => setActiveExercise(null)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Stop Exercise
            </button>
          </div>
        )
      case 'fiveSenses':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">5-4-3-2-1 Grounding</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">5 things you can SEE</h3>
                <input
                  type="text"
                  placeholder="List 5 things..."
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold mb-2">4 things you can TOUCH</h3>
                <input
                  type="text"
                  placeholder="List 4 things..."
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold mb-2">3 things you can HEAR</h3>
                <input
                  type="text"
                  placeholder="List 3 things..."
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold mb-2">2 things you can SMELL</h3>
                <input
                  type="text"
                  placeholder="List 2 things..."
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <h3 className="font-semibold mb-2">1 thing you can TASTE</h3>
                <input
                  type="text"
                  placeholder="List 1 thing..."
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <button
              onClick={() => setActiveExercise(null)}
              className="w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Complete Exercise
            </button>
          </div>
        )
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(EXERCISES).map(([key, exercise]) => {
              const Icon = exercise.icon
              return (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (key === 'breathing') startBreathing()
                    else if (key === 'fiveSenses') startFiveSenses()
                    else setActiveExercise(key)
                  }}
                  className="p-6 bg-white rounded-xl shadow-md border border-gray-200 text-left hover:shadow-lg transition-shadow"
                >
                  <Icon className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {exercise.name}
                  </h3>
                  <p className="text-sm text-gray-600">{exercise.description}</p>
                </motion.button>
              )
            })}
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Grounding Exercises</h1>
        <p className="text-gray-600">Take a moment to center yourself</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeExercise || 'list'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          {renderExercise()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}


