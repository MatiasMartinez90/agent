import { useState, useEffect } from 'react'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

const STORAGE_KEY = 'agent_chat_messages'
const MAX_MESSAGES = 100 // Límite para no saturar localStorage

export const useChatPersistence = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar mensajes del localStorage al inicializar
  useEffect(() => {
    loadMessages()
  }, [])

  // Guardar mensajes en localStorage cada vez que cambien
  useEffect(() => {
    if (isLoaded && messages.length > 0) {
      saveMessages(messages)
    }
  }, [messages, isLoaded])

  const loadMessages = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedMessages = JSON.parse(stored)
        // Convertir timestamps de string a Date
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(messagesWithDates)
        console.log('Chat messages loaded from localStorage:', messagesWithDates.length)
      } else {
        // Si no hay mensajes guardados, mostrar mensaje inicial del agente
        const initialMessage: Message = {
          id: '1',
          content: '¡Hola! Soy tu asistente de entrevistas con IA. Te voy a hacer algunas preguntas para conocerte mejor. ¿A qué posición te estás postulando?',
          isUser: false,
          timestamp: new Date()
        }
        setMessages([initialMessage])
        console.log('No stored messages found, showing initial message')
      }
    } catch (error) {
      console.error('Error loading messages from localStorage:', error)
      // En caso de error, mostrar mensaje inicial
      const initialMessage: Message = {
        id: '1',
        content: '¡Hola! Soy tu asistente de entrevistas con IA. Te voy a hacer algunas preguntas para conocerte mejor. ¿A qué posición te estás postulando?',
        isUser: false,
        timestamp: new Date()
      }
      setMessages([initialMessage])
    } finally {
      setIsLoaded(true)
    }
  }

  const saveMessages = (messagesToSave: Message[]) => {
    try {
      // Limitar el número de mensajes para no saturar localStorage
      const limitedMessages = messagesToSave.slice(-MAX_MESSAGES)
      
      // Convertir Date a string para JSON
      const messagesForStorage = limitedMessages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }))
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesForStorage))
      console.log('Chat messages saved to localStorage:', limitedMessages.length)
    } catch (error) {
      console.error('Error saving messages to localStorage:', error)
    }
  }

  const addMessage = (content: string, isUser: boolean): Message => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }

  const clearMessages = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      const initialMessage: Message = {
        id: '1',
        content: '¡Hola! Soy tu asistente de entrevistas con IA. Te voy a hacer algunas preguntas para conocerte mejor. ¿A qué posición te estás postulando?',
        isUser: false,
        timestamp: new Date()
      }
      setMessages([initialMessage])
      console.log('Chat messages cleared')
    } catch (error) {
      console.error('Error clearing messages:', error)
    }
  }

  return {
    messages,
    addMessage,
    clearMessages,
    isLoaded
  }
}