import { motion } from 'framer-motion'
import { Shield, X } from 'lucide-react'
import { useSilentEscape } from '../hooks/useSilentEscape'

/**
 * Silent Escape Decoy Screen Component
 * 
 * Displays a decoy screen (news, calculator, weather) to hide the app
 * when escape mode is activated.
 */

export default function SilentEscapeScreen() {
  const { isEscapeMode, decoyScreen, deactivateEscape, decoyType } = useSilentEscape()

  if (!isEscapeMode) return null

  const renderDecoyContent = () => {
    switch (decoyType) {
      case 'calculator':
        return (
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
            <div className="text-right text-4xl font-light mb-4 p-4 bg-gray-50 rounded">
              0
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['C', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map((btn) => (
                <button
                  key={btn}
                  className="p-4 bg-gray-100 hover:bg-gray-200 rounded text-xl font-medium"
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        )
      case 'weather':
        return (
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-8 rounded-lg shadow-lg max-w-sm w-full text-center">
            <div className="text-6xl mb-4">☀️</div>
            <div className="text-5xl font-light mb-2">72°F</div>
            <div className="text-xl mb-4">Sunny</div>
            <div className="text-sm opacity-90">San Francisco, CA</div>
          </div>
        )
      default: // news
        return (
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
            <h1 className="text-3xl font-bold mb-4">Breaking News</h1>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h2 className="text-xl font-semibold mb-2">Tech Stocks Rise</h2>
                <p className="text-gray-600">Major technology companies see gains in today's trading session...</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h2 className="text-xl font-semibold mb-2">Weather Update</h2>
                <p className="text-gray-600">Sunny skies expected throughout the week...</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h2 className="text-xl font-semibold mb-2">Sports Highlights</h2>
                <p className="text-gray-600">Local team wins championship game...</p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-gray-100 flex items-center justify-center p-4"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {renderDecoyContent()}
        
        {/* Secret exit button - hold for 3 seconds to exit */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          whileHover={{ opacity: 1 }}
          onMouseDown={() => {
            const timer = setTimeout(() => {
              deactivateEscape()
            }, 3000)
            const cleanup = () => clearTimeout(timer)
            document.addEventListener('mouseup', cleanup, { once: true })
            document.addEventListener('mouseleave', cleanup, { once: true })
          }}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg cursor-pointer"
          title="Hold for 3 seconds to exit escape mode"
        >
          <Shield className="w-5 h-5 text-gray-400" />
        </motion.button>
      </div>
    </motion.div>
  )
}

