import type { NextPage } from 'next'
import { useState, useRef, useEffect, useCallback } from 'react'
import useUser from '../lib/useUser'
import Router from 'next/router'
import SmartUserAvatar from '../components/SmartUserAvatar'
import UserAvatar from '../components/UserAvatar'
import AIInterviewLogo from '../components/AIInterviewLogo'
import VoiceRecorder from '../components/VoiceRecorder'
import VoiceMessage from '../components/VoiceMessage'
import VoiceDiagnostics from '../components/VoiceDiagnostics'
import AudioTest from '../components/AudioTest'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import MessageSkeleton from '../components/ui/MessageSkeleton'
import MessageContent from '../components/ui/MessageContent'
import { useChatPersistence } from '../hooks/useChatPersistence'
import { AvatarCache } from '../utils/avatarCache'
import { fetchAuthSession } from 'aws-amplify/auth'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

const Chat: NextPage = () => {
  const { user, loading, loggedOut, signOut } = useUser({ redirect: '/signin' })
  
  // State for user attributes from Amplify v6
  const [userAttributes, setUserAttributes] = useState<Record<string, string> | null>(null)
  const [attributesLoading, setAttributesLoading] = useState(false)
  
  
  // Extract user attributes from ID token when user is available
  useEffect(() => {
    const loadUserFromToken = async () => {
      if (user && !userAttributes && !attributesLoading) {
        console.log('🔍 [Chat] Loading user attributes from token...')
        setAttributesLoading(true)
        try {
          // Primero intentar obtener desde los datos ya disponibles en useUser
          const userAny = user as any
          if (userAny.google_name || userAny.google_email || userAny.google_picture) {
            console.log('✅ [Chat] Using pre-loaded Google data from useUser')
            const attributes = {
              name: userAny.google_name || userAny.name || '',
              email: userAny.google_email || userAny.email || userAny.signInDetails?.loginId || '',
              picture: userAny.google_picture || ''
            }
            setUserAttributes(attributes)
            setAttributesLoading(false)
            return
          }

          // Fallback: Extraer desde el token si no están disponibles
          console.log('🔄 [Chat] Fallback: extracting from token...')
          const session = await fetchAuthSession()
          const idToken = session.tokens?.idToken
          
          if (idToken) {
            // Parse the JWT payload to get user claims
            const payload = JSON.parse(atob(idToken.toString().split('.')[1]))
            
            const attributes = {
              name: payload.name || payload.given_name || payload.family_name || '',
              email: payload.email || '',
              picture: payload.picture || ''
            }
            
            console.log('✅ [Chat] Extracted attributes from token:', attributes)
            setUserAttributes(attributes)
          } else {
            console.log('⚠️ [Chat] No idToken found, setting empty attributes')
            setUserAttributes({})
          }
        } catch (error) {
          console.error('❌ [Chat] Error extracting user from token:', error)
          setUserAttributes({})
        } finally {
          setAttributesLoading(false)
        }
      }
    }

    loadUserFromToken()
  }, [user, userAttributes, attributesLoading])
  
  // Helper functions to extract user data consistently
  const getUserName = () => {
    // First try to get name from user attributes (real name from Google)
    if (userAttributes?.name) {
      return userAttributes.name
    }
    
    // Try new Google fields from useUser
    const userAny = user as any
    if (userAny?.google_name) {
      return userAny.google_name
    }
    
    // Fallback to email-based username extraction
    if (user?.username) {
      return user.username.split('@')[0] || user.username
    }
    
    if (user?.signInDetails?.loginId) {
      return user.signInDetails.loginId.split('@')[0] || user.signInDetails.loginId
    }
    
    return 'Usuario'
  }

  const { messages, addMessage, addVoiceMessage, clearMessages, isLoaded } = useChatPersistence(getUserName())

  const getUserEmail = useCallback(() => {
    // First try to get email from user attributes (real email from Google)
    if (userAttributes?.email) {
      return userAttributes.email
    }
    
    // Try new Google fields from useUser
    const userAny = user as any
    if (userAny?.google_email) {
      return userAny.google_email
    }
    
    // Fallback to Amplify user object
    return user?.signInDetails?.loginId || 
           user?.username || 
           ''
  }, [user, userAttributes])
  
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingType, setLoadingType] = useState<'text' | 'voice' | null>(null)
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [lastAudioBlob, setLastAudioBlob] = useState<Blob | null>(null)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-focus cuando el componente se monta completamente
  useEffect(() => {
    // Este useEffect se ejecuta solo una vez al montar el componente
    const timer = setTimeout(() => {
      if (textareaRef.current && !loading && !loggedOut) {
        textareaRef.current.focus()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [loading, loggedOut]) // Include dependencies

  // Auto-focus cuando la ventana recibe focus (usuario vuelve a la pestaña)
  useEffect(() => {
    const handleWindowFocus = () => {
      if (textareaRef.current && !loading && !loggedOut && !isLoading) {
        setTimeout(() => {
          textareaRef.current?.focus()
        }, 100)
      }
    }

    window.addEventListener('focus', handleWindowFocus)
    return () => window.removeEventListener('focus', handleWindowFocus)
  }, [loading, loggedOut, isLoading])

  // Auto-focus en el textarea cuando la página esté lista
  useEffect(() => {
    if (isLoaded && !loading && !loggedOut) {
      // Múltiples intentos con delays incrementales para asegurar que funcione
      const focusTextarea = () => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          return true
        }
        return false
      }

      // Primer intento inmediato
      if (!focusTextarea()) {
        // Segundo intento con delay corto
        const timer1 = setTimeout(() => {
          if (!focusTextarea()) {
            // Tercer intento con delay más largo
            const timer2 = setTimeout(() => {
              focusTextarea()
            }, 500)
            return () => clearTimeout(timer2)
          }
        }, 100)
        return () => clearTimeout(timer1)
      }
    }
  }, [isLoaded, loading, loggedOut])

  // Pre-cache user avatar when user becomes available
  useEffect(() => {
    if (user && !loading && !loggedOut && userAttributes) {
      const userEmail = getUserEmail()
      if (!userEmail) return

      // Check if already cached
      const cached = AvatarCache.getCachedAvatar(userEmail)
      if (cached) return

      // Use picture from user attributes (Google profile picture)
      const sources = [
        userAttributes.picture // Real picture from Google OAuth
      ]

      for (const source of sources) {
        if (source && typeof source === 'string' && source.trim().length > 0) {
          let url = source.trim().replace(/^http:/, 'https:')
          
          // Optimize Google URLs
          if (url.includes('googleusercontent.com')) {
            url = url.replace(/[?&]s=\d+/g, '').replace(/[?&]sz=\d+/g, '')
            const separator = url.includes('?') ? '&' : '?'
            url = `${url}${separator}s=96`
          }

          // Pre-cache the avatar
          AvatarCache.cacheAvatar(userEmail, url)
          break
        }
      }
    }
  }, [user, loading, loggedOut, userAttributes, getUserEmail])

  // Auto-focus adicional cuando el textarea ref cambia
  useEffect(() => {
    if (textareaRef.current && isLoaded && !loading && !loggedOut) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus()
      }, 200)
      
      return () => clearTimeout(timer)
    }
  }, [isLoaded, loading, loggedOut])

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          text="Cargando conversación..."
          variant="default"
        />
      </div>
    )
  }

  if (loggedOut) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner 
          size="md" 
          text="Redirigiendo al login..."
          variant="pulse"
        />
      </div>
    )
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    // Agregar mensaje del usuario usando el hook de persistencia
    const userMessage = addMessage(inputMessage.trim(), true)
    const messageText = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)
    setLoadingType('text')

    await sendToN8N(messageText, 'text')
  }

  const sendVoiceMessage = async (audioBlob: Blob, duration: number) => {
    if (isLoading) return


    // Guardar el último blob para testing
    setLastAudioBlob(audioBlob)

    // Agregar mensaje de voz del usuario
    const userMessage = addVoiceMessage(audioBlob, duration, true)
    setIsLoading(true)
    setLoadingType('voice')

    await sendToN8N(audioBlob, 'voice', duration)
  }

  const sendToN8N = async (content: string | Blob, type: 'text' | 'voice', duration?: number) => {
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://n8n.cloud-it.com.ar/webhook/cc4a018d-d373-4e35-88fe-547271539ae9'
      
      let response: Response

      if (type === 'voice' && content instanceof Blob) {
        // Enviar audio como FormData
        const formData = new FormData()
        formData.append('audio', content, `voice-message-${Date.now()}.webm`)
        formData.append('duration', duration?.toString() || '0')
        formData.append('type', 'voice')
        formData.append('user', JSON.stringify({
          email: getUserEmail() || 'unknown@email.com',
          name: getUserName(),
          picture: userAttributes?.picture || null // Real picture from Google OAuth
        }))
        formData.append('chatHistory', JSON.stringify(messages.map(msg => ({
          content: msg.content,
          isUser: msg.isUser,
          timestamp: msg.timestamp.toISOString(),
          type: msg.type || 'text'
        }))))
        formData.append('sessionId', `chat_${Date.now()}`)
        formData.append('timestamp', new Date().toISOString())


        response = await fetch(webhookUrl, {
          method: 'POST',
          body: formData
        })
      } else {
        // Enviar texto como JSON
        const n8nPayload = {
          message: content as string,
          type: 'text',
          user: {
            email: getUserEmail() || 'unknown@email.com',
            name: getUserName(),
            picture: userAttributes?.picture || null // Real picture from Google OAuth
          },
          chatHistory: messages.map(msg => ({
            content: msg.content,
            isUser: msg.isUser,
            timestamp: msg.timestamp.toISOString(),
            type: msg.type || 'text'
          })),
          sessionId: `chat_${Date.now()}`,
          timestamp: new Date().toISOString()
        }

        response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(n8nPayload)
        })
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // n8n puede devolver diferentes tipos de respuesta
      const responseText = await response.text()
      
      // Extraer el contenido de la respuesta
      let aiContent = 'Lo siento, no pude procesar tu mensaje. ¿Podrías intentar de nuevo?'
      
      try {
        // Si la respuesta está vacía, usar mensaje por defecto
        if (!responseText || responseText.trim().length === 0) {
          aiContent = type === 'voice' 
            ? 'Recibí tu mensaje de voz. El sistema está procesando audio, por favor intenta con texto por ahora.'
            : 'Mensaje recibido. El sistema está procesando tu solicitud.'
        } else if (response.headers.get('content-type')?.includes('application/json')) {
          // Si es JSON, parsearlo normalmente
          const aiResponseData = JSON.parse(responseText)
          aiContent = aiResponseData.output || aiResponseData.response || aiResponseData.message || aiContent
        } else if (responseText.includes('srcdoc="')) {
          // Si es HTML con iframe, extraer el contenido del srcdoc
          const match = responseText.match(/srcdoc="([^"]*)"/)
          if (match && match[1]) {
            aiContent = match[1]
          }
        } else if (responseText.trim()) {
          // Si es texto plano y no está vacío
          aiContent = responseText.trim()
        }
      } catch (parseError) {
        aiContent = type === 'voice'
          ? 'Recibí tu audio pero el sistema aún no está configurado para procesarlo. ¿Podrías escribir tu mensaje?'
          : 'Recibí tu mensaje pero hubo un problema al procesar la respuesta. ¿Podrías intentar de nuevo?'
      }
      
      // Agregar respuesta del agente usando el hook de persistencia
      addMessage(aiContent, false)
      setIsLoading(false)
      setLoadingType(null)

      // Re-focus en el textarea después de recibir respuesta
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)

    } catch (error) {
      // Fallback response en caso de error usando el hook de persistencia
      addMessage('Disculpa, estoy teniendo problemas técnicos. Por favor intenta nuevamente en unos momentos.', false)
      setIsLoading(false)
      setLoadingType(null)

      // Re-focus en el textarea después de error
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="flex items-center">
            <AIInterviewLogo size="lg" />
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Nombre y email - Solo visible en desktop */}
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-medium">{getUserName()}</p>
              <p className="text-slate-400 text-xs">{getUserEmail()}</p>
            </div>
            <UserAvatar user={user} userAttributes={userAttributes} size="md" />
            {/* Debug button - only in development */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => setShowDiagnostics(true)}
                className="text-slate-400 hover:text-yellow-400 transition-colors"
                title="Voice Diagnostics"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
            
            <button
              onClick={() => signOut({ redirect: '/' })}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-4 max-w-[95%] sm:max-w-2xl ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                {message.isUser ? (
                  <UserAvatar user={user} userAttributes={userAttributes} size="md" />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-green-500 to-emerald-500">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                )}

                {/* Message Content */}
                {message.type === 'voice' && message.voiceData ? (
                  <VoiceMessage
                    audioBlob={message.voiceData.audioBlob}
                    audioUrl={message.voiceData.audioUrl}
                    duration={message.voiceData.duration}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                  />
                ) : (
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.isUser 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                      : 'bg-slate-800 text-slate-100 border border-slate-700'
                  }`}>
                    <MessageContent 
                      content={message.content}
                      isUser={message.isUser}
                    />
                    <p className={`text-xs mt-2 opacity-70 ${
                      message.isUser ? 'text-blue-100' : 'text-slate-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-4 max-w-2xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  🤖
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-3 sm:p-4">
          <div className={`flex items-center ${isRecordingVoice ? 'w-full' : 'space-x-2 sm:space-x-3'}`}>
            {!isRecordingVoice && (
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribí tu respuesta..."
                  className="w-full bg-slate-800 border border-slate-600 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 text-sm sm:text-base"
                  rows={1}
                  disabled={isLoading}
                />
              </div>
            )}
            
            {/* Voice Recorder Button */}
            <VoiceRecorder
              onSendVoice={sendVoiceMessage}
              disabled={isLoading}
              onRecordingStateChange={setIsRecordingVoice}
            />
            
            {/* Clear Chat History Button - Hidden during recording */}
            {!isRecordingVoice && (
              <button
                onClick={clearMessages}
                disabled={isLoading}
                className="text-slate-400 hover:text-red-400 p-3 rounded-xl hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
                title="Limpiar historial del chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            
            {/* Send Text Button */}
            {!isRecordingVoice && (
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Voice Diagnostics Modal */}
      <VoiceDiagnostics 
        show={showDiagnostics} 
        onClose={() => setShowDiagnostics(false)} 
      />
      
      {/* Audio Test Component - Temporarily disabled */}
      {false && process.env.NODE_ENV === 'development' && lastAudioBlob && (
        <div className="fixed bottom-4 left-4 z-50">
          <AudioTest audioBlob={lastAudioBlob!} />
        </div>
      )}
    </div>
  )
}

export default Chat