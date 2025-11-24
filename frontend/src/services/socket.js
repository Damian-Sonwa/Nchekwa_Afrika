import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

let socket = null
let currentSessionId = null

export const initializeSocket = (sessionId, onMessage) => {
  if (socket && socket.connected) {
    socket.disconnect()
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  })

  currentSessionId = sessionId

  socket.on('connect', () => {
    console.log('Socket connected')
    socket.emit('join-chat', sessionId)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected')
  })

  socket.on('chat-message', (data) => {
    if (data.sessionId === sessionId && onMessage) {
      onMessage(data)
    }
  })

  socket.on('error', (error) => {
    console.error('Socket error:', error)
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


