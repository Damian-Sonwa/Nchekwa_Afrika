import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { startChatSession, sendMessage, getMessages } from '../services/api'
import { initializeSocket, sendChatMessage, disconnectSocket } from '../services/socket'

export default function Chat() {
  const { anonymousId, encryptData, decryptData } = useApp()
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    initializeChat()
    return () => {
      disconnectSocket()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initializeChat = async () => {
    try {
      setLoading(true)
      const sessionResponse = await startChatSession(anonymousId)
      if (sessionResponse.success) {
        setSessionId(sessionResponse.sessionId)

        // Initialize socket
        initializeSocket(sessionResponse.sessionId, (message) => {
          try {
            const decrypted = decryptData(message.content)
            const messageId = message.id || Date.now().toString()
            setMessages((prev) => {
              // Check if message already exists to prevent duplicates
              const exists = prev.some(msg => msg.id === messageId || 
                (msg.content === (decrypted || message.content) && 
                 msg.senderType === message.senderType &&
                 Math.abs(new Date(msg.timestamp) - new Date(message.timestamp || new Date())) < 1000))
              if (exists) return prev
              return [
                ...prev,
                {
                  id: messageId,
                  content: decrypted || message.content,
                  senderType: message.senderType,
                  timestamp: message.timestamp || new Date(),
                },
              ]
            })
          } catch (error) {
            const messageId = message.id || Date.now().toString()
            setMessages((prev) => {
              // Check if message already exists
              const exists = prev.some(msg => msg.id === messageId)
              if (exists) return prev
              return [...prev, message]
            })
          }
        })

        // Load previous messages
        const messagesResponse = await getMessages(sessionResponse.sessionId)
        if (messagesResponse.success) {
          const decryptedMessages = messagesResponse.messages.map((msg) => ({
            ...msg,
            content: decryptData(msg.content) || msg.content,
          }))
          setMessages(decryptedMessages)
        }

        setIsConnected(true)
      }
    } catch (error) {
      console.error('Initialize chat error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!inputText.trim() || !sessionId) return

    const messageContent = inputText.trim()
    const encryptedContent = encryptData(messageContent)
    const messageId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const newMessage = {
      id: messageId,
      content: messageContent,
      senderType: 'user',
      timestamp: new Date(),
    }

    // Add message optimistically
    setMessages((prev) => [...prev, newMessage])
    setInputText('')

    try {
      // Send via API (this will save to database)
      const response = await sendMessage(sessionId, anonymousId, 'user', encryptedContent)
      // Update message with server ID if provided
      if (response.message?.id) {
        setMessages((prev) => prev.map(msg => 
          msg.id === messageId ? { ...msg, id: response.message.id } : msg
        ))
      }
      // Don't send via socket to avoid duplication - the server will broadcast it
    } catch (error) {
      console.error('Send message error:', error)
      // Remove message on error
      setMessages((prev) => prev.filter(msg => msg.id !== messageId))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] min-h-[500px]">
      {/* Header */}
      <div className="bg-white dark:bg-dark rounded-xl shadow-md p-4 mb-4 border border-light dark:border-light/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-success dark:bg-success animate-pulse"></div>
            <div>
              <h2 className="font-poppins font-semibold text-dark dark:text-white">Support Chat</h2>
              <p className="text-sm font-inter text-light dark:text-light">
                {isConnected ? 'Connected to counselor' : 'Connecting...'}
              </p>
            </div>
          </div>
          <MessageCircle className="w-6 h-6 text-primary dark:text-primaryLight" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-2">
        <AnimatePresence>
          {messages.map((message) => {
            const isUser = message.senderType === 'user'
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
                    isUser
                      ? 'bg-primary text-white'
                      : 'bg-background dark:bg-dark/50 border border-light dark:border-light/30 text-dark dark:text-white'
                  }`}
                >
                  <p className="text-sm font-inter">{message.content}</p>
                  <p
                    className={`text-xs mt-1 font-inter ${
                      isUser ? 'text-white/80' : 'text-light dark:text-light'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-dark rounded-xl shadow-md p-4 border border-light dark:border-light/30">
        <div className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 font-inter border border-light dark:border-light/30 rounded-xl bg-white dark:bg-dark/50 text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryLight focus:border-primaryLight"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="px-6 py-3 bg-primary hover:bg-primaryLight text-white rounded-xl font-inter font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span className="hidden md:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  )
}

