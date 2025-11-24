import { useState, useEffect } from 'react'

/**
 * Silent Escape Mode Hook
 * 
 * Instantly switches app to a decoy screen (news app, calculator, etc.)
 * to hide the GBV app if someone approaches.
 * 
 * Usage:
 * const { isEscapeMode, activateEscape, deactivateEscape } = useSilentEscape()
 */

const DECOY_SCREENS = {
  news: {
    title: 'Breaking News',
    content: 'Latest headlines and updates',
    bgColor: 'bg-gray-100',
  },
  calculator: {
    title: 'Calculator',
    content: '0',
    bgColor: 'bg-white',
  },
  weather: {
    title: 'Weather',
    content: 'Sunny, 72°F',
    bgColor: 'bg-blue-50',
  },
}

export function useSilentEscape() {
  const [isEscapeMode, setIsEscapeMode] = useState(false)
  const [decoyType, setDecoyType] = useState('news')

  // Load escape mode state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('escapeMode')
    if (saved) {
      const { active, type } = JSON.parse(saved)
      setIsEscapeMode(active)
      setDecoyType(type || 'news')
    }
  }, [])

  // Save escape mode state
  useEffect(() => {
    localStorage.setItem('escapeMode', JSON.stringify({
      active: isEscapeMode,
      type: decoyType,
    }))
  }, [isEscapeMode, decoyType])

  const activateEscape = (type = 'news') => {
    setDecoyType(type)
    setIsEscapeMode(true)
    // Hide all app content
    document.body.style.overflow = 'hidden'
  }

  const deactivateEscape = () => {
    setIsEscapeMode(false)
    document.body.style.overflow = ''
  }

  // Keyboard shortcut: Triple tap on screen or specific key combo
  useEffect(() => {
    let tapCount = 0
    let tapTimer = null

    const handleTripleTap = (e) => {
      // Triple tap anywhere on screen to activate
      tapCount++
      clearTimeout(tapTimer)
      tapTimer = setTimeout(() => {
        tapCount = 0
      }, 500)

      if (tapCount === 3) {
        activateEscape()
        tapCount = 0
      }
    }

    // Keyboard shortcut: Ctrl+Shift+E
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault()
        if (isEscapeMode) {
          deactivateEscape()
        } else {
          activateEscape()
        }
      }
    }

    document.addEventListener('click', handleTripleTap)
    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('click', handleTripleTap)
      document.removeEventListener('keydown', handleKeyPress)
      clearTimeout(tapTimer)
    }
  }, [isEscapeMode])

  return {
    isEscapeMode,
    decoyType,
    decoyScreen: DECOY_SCREENS[decoyType],
    activateEscape,
    deactivateEscape,
    setDecoyType,
  }
}


