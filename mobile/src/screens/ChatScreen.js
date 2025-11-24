import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { theme } from '../theme/theme';
import { startChatSession, sendMessage, getMessages } from '../services/api';
import { initializeSocket, sendChatMessage, disconnectSocket } from '../services/socket';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ChatScreen() {
  const { anonymousId, encryptData, decryptData } = useAppContext();
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    initializeChat();
    return () => {
      disconnectSocket();
    };
  }, []);

  const initializeChat = async () => {
    try {
      // Start chat session
      const sessionResponse = await startChatSession(anonymousId);
      if (sessionResponse.success) {
        setSessionId(sessionResponse.sessionId);
        
        // Initialize socket connection
        initializeSocket(sessionResponse.sessionId, (message) => {
          // Decrypt message
          try {
            const decrypted = decryptData(message.content);
            setMessages(prev => [...prev, {
              id: message.id || Date.now().toString(),
              content: decrypted || message.content,
              senderType: message.senderType,
              timestamp: message.timestamp || new Date(),
            }]);
            scrollToBottom();
          } catch (error) {
            console.error('Decrypt error:', error);
            setMessages(prev => [...prev, message]);
            scrollToBottom();
          }
        });

        // Load previous messages
        const messagesResponse = await getMessages(sessionResponse.sessionId);
        if (messagesResponse.success) {
          const decryptedMessages = messagesResponse.messages.map(msg => ({
            ...msg,
            content: decryptData(msg.content) || msg.content,
          }));
          setMessages(decryptedMessages);
          scrollToBottom();
        }

        setIsConnected(true);
      }
    } catch (error) {
      console.error('Initialize chat error:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    if (!inputText.trim() || !sessionId) return;

    const messageContent = inputText.trim();
    const encryptedContent = encryptData(messageContent);

    const newMessage = {
      id: Date.now().toString(),
      content: messageContent,
      senderType: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    scrollToBottom();

    try {
      // Send via API
      await sendMessage(sessionId, anonymousId, 'user', encryptedContent);
      
      // Also send via socket for real-time
      sendChatMessage(sessionId, {
        content: encryptedContent,
        senderId: anonymousId,
        senderType: 'user',
      });
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.senderType === 'user';
    
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.counselorMessage,
        ]}
      >
        <Text style={[
          styles.messageText,
          isUser && styles.userMessageText,
        ]}>
          {item.content}
        </Text>
        <Text style={styles.messageTime}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, isConnected && styles.statusDotActive]} />
          <Text style={styles.statusText}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </Text>
        </View>
        <Text style={styles.headerTitle}>Support Chat</Text>
        <Text style={styles.headerSubtitle}>You're chatting with a trained counselor</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={scrollToBottom}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Icon name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  statusDotActive: {
    backgroundColor: theme.colors.success,
  },
  statusText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  messagesList: {
    padding: theme.spacing.md,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
  },
  counselorMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontSize: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    maxHeight: 100,
    marginRight: theme.spacing.sm,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});


