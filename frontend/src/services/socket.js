import { io } from 'socket.io-client'

// Get socket URL - use VITE_SOCKET_URL if set, otherwise derive from API URL, or default to localhost for dev
let SOCKET_URL = import.meta.env.VITE_SOCKET_URL

// If SOCKET_URL is not set, try to derive it from API URL
if (!SOCKET_URL) {
  const API_URL = import.meta.env.VITE_API_URL || '/api'
  
  // If API_URL is a full URL (production), remove /api to get base URL
  if (API_URL.startsWith('http')) {
    SOCKET_URL = API_URL.replace('/api', '')
  } else if (API_URL === '/api') {
    // In production without env vars, we can't determine the socket URL
    // This will show a warning
    SOCKET_URL = null
  } else {
    // Development fallback
    SOCKET_URL = 'http://localhost:3000'
  }
}

// Final fallback
SOCKET_URL = SOCKET_URL || 'http://localhost:3000'

let socket = null
let currentSessionId = null
let connectionCallbacks = []

// Log socket URL for debugging
console.log('🔌 Socket URL:', SOCKET_URL)
if (import.meta.env.PROD && !import.meta.env.VITE_SOCKET_URL) {
  console.warn('⚠️ VITE_SOCKET_URL is not set in production! Socket connections may fail.')
  console.warn('💡 Set VITE_SOCKET_URL in Vercel environment variables to: https://nchekwa-afrika.onrender.com')
}

export const initializeSocket = (sessionId, onMessage, onConnectionChange) => {
  if (socket && socket.connected) {
    socket.disconnect()
  }

  // Add connection status callback
  if (onConnectionChange) {
    connectionCallbacks.push(onConnectionChange)
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'], // Try both transports
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
    timeout: 10000, // Reduced from 20000 to 10000 (10 seconds)
    forceNew: true,
    upgrade: true, // Allow transport upgrades
    rememberUpgrade: false, // Don't remember upgrade preference
    autoConnect: true,
  })

  currentSessionId = sessionId

  // Add connection timeout detection
  let connectionTimeout = null

  socket.on('connect', () => {
    console.log('✅ Socket connected, ID:', socket.id)
    if (connectionTimeout) {
      clearTimeout(connectionTimeout)
      connectionTimeout = null
    }
    socket.emit('join-chat', sessionId)
    connectionCallbacks.forEach(cb => cb(true))
  })

  // Set connection timeout
  connectionTimeout = setTimeout(() => {
    if (!socket.connected) {
      console.error('❌ Socket connection timeout after 10 seconds')
      connectionCallbacks.forEach(cb => cb(false))
      // Try to reconnect
      socket.connect()
    }
  }, 10000)

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason)
    if (connectionTimeout) {
      clearTimeout(connectionTimeout)
      connectionTimeout = null
    }
    connectionCallbacks.forEach(cb => cb(false))
    
    // Auto-reconnect on unexpected disconnects
    if (reason === 'io server disconnect') {
      // Server disconnected, reconnect manually
      console.log('🔄 Attempting to reconnect...')
      socket.connect()
    } else if (reason === 'transport close' || reason === 'transport error') {
      // Transport error, try reconnecting
      console.log('🔄 Transport error, attempting to reconnect...')
      socket.connect()
    }
  })

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message)
    console.error('❌ Error details:', {
      type: error.type,
      description: error.description,
      context: error.context,
      transport: error.transport
    })
    if (connectionTimeout) {
      clearTimeout(connectionTimeout)
      connectionTimeout = null
    }
    connectionCallbacks.forEach(cb => cb(false))
  })

  socket.on('reconnect', (attemptNumber) => {
    console.log('🔄 Socket reconnected after', attemptNumber, 'attempts')
    if (connectionTimeout) {
      clearTimeout(connectionTimeout)
      connectionTimeout = null
    }
    socket.emit('join-chat', sessionId)
    connectionCallbacks.forEach(cb => cb(true))
  })

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('🔄 Reconnection attempt', attemptNumber)
  })

  socket.on('reconnect_error', (error) => {
    console.error('❌ Reconnection error:', error.message)
  })

  socket.on('reconnect_failed', () => {
    console.error('❌ Socket reconnection failed after all attempts')
    if (connectionTimeout) {
      clearTimeout(connectionTimeout)
      connectionTimeout = null
    }
    connectionCallbacks.forEach(cb => cb(false))
    // Try one more time after a delay
    setTimeout(() => {
      if (!socket.connected) {
        console.log('🔄 Final reconnection attempt...')
        socket.connect()
      }
    }, 5000)
  })

  socket.on('chat-message', (data) => {
    if (data.sessionId === sessionId && onMessage) {
      onMessage(data)
    }
  })

  socket.on('error', (error) => {
    console.error('❌ Socket error:', error)
  })

  return socket
}

export const sendChatMessage = (sessionId, messageData) => {
  if (socket && socket.connected) {
    socket.emit('chat-message', {
      sessionId,
      ...messageData,
    })
  } else {
    console.warn('Socket not connected')
  }
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    currentSessionId = null
  }
}

export const isSocketConnected = () => {
  return socket && socket.connected
}

export const getSocketConnectionStatus = () => {
  if (!socket) return 'disconnected'
  if (socket.connected) return 'connected'
  return 'connecting'
}

export const removeConnectionCallback = (callback) => {
  connectionCallbacks = connectionCallbacks.filter(cb => cb !== callback)
}


