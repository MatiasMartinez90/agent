import { useState, useEffect } from 'react'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  type?: 'text' | 'voice'
  voiceData?: {
    audioBlob?: Blob
    audioUrl?: string
    duration: number
    audioBase64?: string
    audioType?: string
  }
}

// Helper function to convert Blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data:mime/type;base64, prefix
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Helper function to convert base64 to Blob
const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
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
      saveMessages(messages).catch(error => {
        console.error('Failed to save messages:', error)
      })
    }
  }, [messages, isLoaded])

  const loadMessages = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedMessages = JSON.parse(stored)
        // Convertir timestamps de string a Date y base64 a Blob
        const messagesWithDates = parsedMessages.map((msg: any) => {
          const message = {
            ...msg,
            timestamp: new Date(msg.timestamp)
          }
          
          // Convertir base64 de vuelta a Blob si existe
          if (msg.voiceData?.audioBase64 && msg.voiceData?.audioType) {
            try {
              const audioBlob = base64ToBlob(msg.voiceData.audioBase64, msg.voiceData.audioType)
              message.voiceData = {
                ...msg.voiceData,
                audioBlob,
                audioBase64: undefined // Remove base64 after conversion
              }
            } catch (error) {
              console.error('Error converting base64 to blob:', error)
              // Keep voiceData without blob if conversion fails
              message.voiceData = {
                ...msg.voiceData,
                audioBase64: undefined
              }
            }
          }
          
          return message
        })
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

  const saveMessages = async (messagesToSave: Message[]) => {
    try {
      // Limitar el número de mensajes para no saturar localStorage
      const limitedMessages = messagesToSave.slice(-MAX_MESSAGES)
      
      // Convertir Date a string y Blob a base64 para JSON
      const messagesForStorage = await Promise.all(limitedMessages.map(async (msg) => {
        const messageForStorage: any = {
          ...msg,
          timestamp: msg.timestamp.toISOString()
        }
        
        // Convertir audioBlob a base64 si existe
        if (msg.voiceData?.audioBlob) {
          try {
            const base64 = await blobToBase64(msg.voiceData.audioBlob)
            messageForStorage.voiceData = {
              ...msg.voiceData,
              audioBlob: undefined, // Remove original blob
              audioBase64: base64,
              audioType: msg.voiceData.audioBlob.type
            }
          } catch (error) {
            console.error('Error converting blob to base64:', error)
            // Keep voiceData without blob if conversion fails
            messageForStorage.voiceData = {
              ...msg.voiceData,
              audioBlob: undefined
            }
          }
        }
        
        return messageForStorage
      }))
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesForStorage))
      console.log('Chat messages saved to localStorage:', limitedMessages.length)
    } catch (error) {
      console.error('Error saving messages to localStorage:', error)
    }
  }

  const addMessage = (content: string, isUser: boolean, type: 'text' | 'voice' = 'text', voiceData?: { audioBlob?: Blob; audioUrl?: string; duration: number }): Message => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date(),
      type,
      voiceData
    }
    
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }

  const addVoiceMessage = (audioBlob: Blob, duration: number, isUser: boolean): Message => {
    const content = isUser ? `🎤 Mensaje de voz (${Math.floor(duration)}s)` : `🤖 Respuesta de voz (${Math.floor(duration)}s)`
    
    return addMessage(content, isUser, 'voice', {
      audioBlob,
      duration
    })
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
    addVoiceMessage,
    clearMessages,
    isLoaded
  }
}