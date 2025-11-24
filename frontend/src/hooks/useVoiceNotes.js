import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'

/**
 * Encrypted Voice Notes Hook
 * 
 * Records voice notes with optional transcription, encrypted locally.
 * 
 * Usage:
 * const { isRecording, startRecording, stopRecording, saveNote } = useVoiceNotes()
 */

export function useVoiceNotes() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [transcript, setTranscript] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const { encryptData } = useApp()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Microphone access denied. Please enable microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (audioBlob) => {
    setIsTranscribing(true)
    try {
      // Note: In production, use a speech-to-text API (Google Cloud, AWS Transcribe, etc.)
      // This is a placeholder - implement actual transcription service
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      // Placeholder: Replace with actual transcription API
      // const response = await fetch('/api/transcribe', { method: 'POST', body: formData })
      // const { transcript } = await response.json()
      
      // For now, return placeholder
      setTimeout(() => {
        setTranscript('Transcription service not configured. Please add transcription API endpoint.')
        setIsTranscribing(false)
      }, 1000)
    } catch (error) {
      console.error('Transcription error:', error)
      setIsTranscribing(false)
    }
  }

  const saveNote = async (title = 'Voice Note') => {
    if (!audioBlob) return

    try {
      // Convert blob to base64 for encryption
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1]
        
        const noteData = {
          title,
          audio: base64Audio,
          transcript,
          timestamp: new Date().toISOString(),
          geotag: await getGeotag(),
        }

        // Encrypt the note
        const encrypted = encryptData(noteData)

        // Save to localStorage (in production, save to backend)
        const savedNotes = JSON.parse(localStorage.getItem('voiceNotes') || '[]')
        savedNotes.push({
          id: Date.now().toString(),
          encrypted,
          createdAt: new Date().toISOString(),
        })
        localStorage.setItem('voiceNotes', JSON.stringify(savedNotes))

        // Reset state
        setAudioBlob(null)
        setTranscript('')
      }
      reader.readAsDataURL(audioBlob)
    } catch (error) {
      console.error('Error saving voice note:', error)
    }
  }

  const getGeotag = async () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          })
        },
        () => resolve(null),
        { timeout: 5000 }
      )
    })
  }

  useEffect(() => {
    if (audioBlob && !transcript) {
      transcribeAudio(audioBlob)
    }
  }, [audioBlob])

  return {
    isRecording,
    audioBlob,
    transcript,
    isTranscribing,
    startRecording,
    stopRecording,
    saveNote,
  }
}


