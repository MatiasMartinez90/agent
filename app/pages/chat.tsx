import type { NextPage } from 'next'
import { useState, useRef, useEffect } from 'react'
import useUser from '../lib/useUser'
import Router from 'next/router'
import SmartUserAvatar from '../components/SmartUserAvatar'
import HRIcon from '../components/HRIcon'
import VoiceRecorder from '../components/VoiceRecorder'
import VoiceMessage from '../components/VoiceMessage'
import VoiceDiagnostics from '../components/VoiceDiagnostics'
import { useChatPersistence } from '../hooks/useChatPersistence'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

const Chat: NextPage = () => {
  const { user, loading, loggedOut, signOut } = useUser({ redirect: '/signin' })
  const { messages, addMessage, addVoiceMessage, isLoaded } = useChatPersistence()

  // Helper functions to extract user data consistently
  const getUserName = () => {
    // Intentar múltiples fuentes de datos para el nombre
    const sources = [
      user?.name,
      user?.signInUserSession?.idToken?.payload?.name,
      user?.attributes?.name,
      user?.signInUserSession?.idToken?.payload?.given_name,
      user?.signInUserSession?.idToken?.payload?.nickname,
      // Combinar given_name + family_name si están disponibles
      user?.signInUserSession?.idToken?.payload?.given_name && user?.signInUserSession?.idToken?.payload?.family_name 
        ? `${user.signInUserSession.idToken.payload.given_name} ${user.signInUserSession.idToken.payload.family_name}`
        : null,
      // Extraer nombre del email como último recurso
      user?.email ? user.email.split('@')[0] : null,
      user?.signInUserSession?.idToken?.payload?.email ? user.signInUserSession.idToken.payload.email.split('@')[0] : null
    ]
    
    // Retornar la primera fuente que tenga un valor válido
    for (const source of sources) {
      if (source && typeof source === 'string' && source.trim().length > 0) {
        console.log('Using name source:', source)
        return source.trim()
      }
    }
    
    return 'Usuario'
  }

  const getUserEmail = () => {
    return user?.email || 
           user?.signInUserSession?.idToken?.payload?.email || 
           user?.attributes?.email || 
           ''
  }
  
  // Debug: ver qué datos del usuario tenemos
  console.log('=== USER DEBUG INFO ===')
  console.log('Full user object:', user)
  console.log('User keys:', user ? Object.keys(user) : 'no user')
  
  if (user?.signInUserSession?.idToken?.payload) {
    console.log('JWT Payload:', user.signInUserSession.idToken.payload)
    console.log('JWT Payload keys:', Object.keys(user.signInUserSession.idToken.payload))
  }
  
  if (user?.attributes) {
    console.log('User attributes:', user.attributes)
    console.log('Attributes keys:', Object.keys(user.attributes))
  }
  
  console.log('User name sources:', {
    direct: user?.name,
    jwt: user?.signInUserSession?.idToken?.payload?.name,
    attributes: user?.attributes?.name,
    given_name: user?.signInUserSession?.idToken?.payload?.given_name,
    family_name: user?.signInUserSession?.idToken?.payload?.family_name,
    nickname: user?.signInUserSession?.idToken?.payload?.nickname
  })
  
  console.log('Final getUserName() result:', getUserName())
  console.log('========================')
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showDiagnostics, setShowDiagnostics] = useState(false)
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
        console.log('Auto-focus applied on component mount')
      }
    }, 300)

    return () => clearTimeout(timer)
  }, []) // Array vacío = solo se ejecuta al montar

  // Auto-focus cuando la ventana recibe focus (usuario vuelve a la pestaña)
  useEffect(() => {
    const handleWindowFocus = () => {
      if (textareaRef.current && !loading && !loggedOut && !isLoading) {
        setTimeout(() => {
          textareaRef.current?.focus()
          console.log('Auto-focus applied on window focus')
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
          console.log('Auto-focus applied to textarea')
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

  // Auto-focus adicional cuando el textarea ref cambia
  useEffect(() => {
    if (textareaRef.current && isLoaded && !loading && !loggedOut) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus()
        console.log('Auto-focus applied on textarea ref change')
      }, 200)
      
      return () => clearTimeout(timer)
    }
  }, [textareaRef.current, isLoaded, loading, loggedOut])

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <div className="text-white text-xl">
            {loading ? 'Cargando usuario...' : 'Cargando conversación...'}
          </div>
        </div>
      </div>
    )
  }

  if (loggedOut) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Redirigiendo...</div>
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

    await sendToN8N(messageText, 'text')
  }

  const sendVoiceMessage = async (audioBlob: Blob, duration: number) => {
    if (isLoading) return

    // Agregar mensaje de voz del usuario
    const userMessage = addVoiceMessage(audioBlob, duration, true)
    setIsLoading(true)

    await sendToN8N(audioBlob, 'voice', duration)
  }

  const sendToN8N = async (content: string | Blob, type: 'text' | 'voice', duration?: number) => {
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://n8n.cloud-it.com.ar/webhook/cc4a018d-d373-4e35-88fe-547271539ae9'
      
      let response: Response

      if (type === 'voice' && content instanceof Blob) {
        // Enviar audio como FormData
        const formData = new FormData()
        formData.append('audio', content, 'voice-message.webm')
        formData.append('duration', duration?.toString() || '0')
        formData.append('type', 'voice')
        formData.append('user', JSON.stringify({
          email: getUserEmail() || 'unknown@email.com',
          name: getUserName(),
          picture: user?.picture || user?.signInUserSession?.idToken?.payload?.picture || user?.attributes?.picture || null
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
            picture: user?.picture || user?.signInUserSession?.idToken?.payload?.picture || user?.attributes?.picture || null
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

      // n8n devuelve HTML con la respuesta, necesitamos extraer el contenido
      const responseText = await response.text()
      
      // Extraer el contenido del iframe srcdoc
      let aiContent = 'Lo siento, no pude procesar tu mensaje. ¿Podrías intentar de nuevo?'
      
      if (response.headers.get('content-type')?.includes('application/json')) {
        // Si es JSON, parsearlo normalmente
        const aiResponseData = JSON.parse(responseText)
        aiContent = aiResponseData.output || aiResponseData.response || aiContent
      } else if (responseText.includes('srcdoc="')) {
        // Si es HTML con iframe, extraer el contenido del srcdoc
        const match = responseText.match(/srcdoc="([^"]*)"/)
        if (match && match[1]) {
          aiContent = match[1]
        }
      } else {
        // Si es texto plano
        aiContent = responseText || aiContent
      }
      
      // Agregar respuesta del agente usando el hook de persistencia
      addMessage(aiContent, false)
      setIsLoading(false)

      // Re-focus en el textarea después de recibir respuesta
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)

    } catch (error) {
      console.error('Error sending message to n8n:', error)
      
      // Fallback response en caso de error usando el hook de persistencia
      addMessage('Disculpa, estoy teniendo problemas técnicos. Por favor intenta nuevamente en unos momentos.', false)
      setIsLoading(false)

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
          <div className="flex items-center space-x-3">
            <HRIcon size="lg" />
            <div>
              <h1 className="text-white font-semibold">Entrevista con IA</h1>
              <p className="text-slate-400 text-sm">Agent Platform</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Nombre y email - Solo visible en desktop */}
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-medium">{getUserName()}</p>
              <p className="text-slate-400 text-xs">{getUserEmail()}</p>
            </div>
            <SmartUserAvatar user={user} size="md" priority="high" />
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
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-2xl ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                {message.isUser ? (
                  <SmartUserAvatar user={user} size="md" priority="normal" />
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
                    <p className="text-sm leading-relaxed">{message.content}</p>
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
              <div className="flex items-start space-x-3 max-w-2xl">
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
        <div className="border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-4">
          <VoiceRecorder
            onSendVoice={sendVoiceMessage}
            disabled={isLoading}
            className="mb-4"
          />
          
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu respuesta o usa el micrófono..."
                className="w-full bg-slate-800 border border-slate-600 rounded-2xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
                rows={1}
                disabled={isLoading}
              />
            </div>
            
            {/* Voice Recorder Button */}
            <VoiceRecorder
              onSendVoice={sendVoiceMessage}
              disabled={isLoading}
            />
            
            {/* Send Text Button */}
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Voice Diagnostics Modal */}
      <VoiceDiagnostics 
        show={showDiagnostics} 
        onClose={() => setShowDiagnostics(false)} 
      />
    </div>
  )
}

export default Chat