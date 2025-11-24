import { useState, useEffect, useRef } from 'react'
import { sendSOSAlert } from '../services/api'

/**
 * Voice Command SOS Hook
 * 
 * Trigger emergency alert hands-free using voice commands.
 * 
 * Usage:
 * const { isListening, startListening, stopListening } = useVoiceCommandSOS(anonymousId)
 */

const SOS_KEYWORDS = ['help', 'emergency', 'sos', 'danger', 'assist']

export function useVoiceCommandSOS(anonymousId) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(finalTranscript + interimTranscript)

      // Check for SOS keywords
      const lowerTranscript = (finalTranscript + interimTranscript).toLowerCase()
      const hasSOSKeyword = SOS_KEYWORDS.some(keyword => 
        lowerTranscript.includes(keyword)
      )

      if (hasSOSKeyword && finalTranscript) {
        triggerSOS()
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const triggerSOS = async () => {
    try {
      let location = null
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            sendSOSAlert(anonymousId, location)
          },
          () => {
            sendSOSAlert(anonymousId, null)
          }
        )
      } else {
        await sendSOSAlert(anonymousId, null)
      }
    } catch (error) {
      console.error('Voice SOS error:', error)
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    triggerSOS,
  }
}


