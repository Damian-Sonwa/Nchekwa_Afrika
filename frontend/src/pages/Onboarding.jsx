import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Lock, Heart, LogOut } from 'lucide-react'
import { useApp } from '../context/AppContext'

const steps = [
  {
    icon: Shield,
    title: 'Welcome',
    description: 'You are safe here. This app provides support, resources, and tools to help you on your journey.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'Your privacy is our priority. All data is encrypted, and you can delete everything at any time.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Heart,
    title: 'You Are Not Alone',
    description: 'Connect with trained counselors, access resources, and build your safety plan—all anonymously.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: LogOut,
    title: 'Quick Exit',
    description: 'Tap the quick exit button anytime to instantly close the app if you need to.',
    color: 'from-orange-500 to-red-500',
  },
]

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const navigate = useNavigate()
  const { completeOnboarding } = useApp()

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      await completeOnboarding()
      navigate('/app')
    }
  }

  const handleSkip = async () => {
    await completeOnboarding()
    navigate('/')
  }

  const Icon = steps[currentStep].icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 md:p-12">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="text-center"
          >
            <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${steps[currentStep].color} mb-6`}>
              <Icon className="w-16 h-16 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {steps[currentStep].title}
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {steps[currentStep].description}
            </p>
          </motion.div>

          {/* Progress Indicators */}
          <div className="flex justify-center space-x-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-600'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
            {currentStep < steps.length - 1 ? (
              <>
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Next
                </button>
              </>
            ) : (
              <button
                onClick={handleNext}
                className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

