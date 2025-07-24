import type { NextPage } from 'next'
import { useState, useRef, useEffect } from 'react'
import useUser from '../lib/useUser'
import Router from 'next/router'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

const Chat: NextPage = () => {
  const { user, loading, loggedOut, signOut } = useUser({ redirect: '/signin' })
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '¡Hola! Soy tu asistente de entrevistas con IA. Te voy a hacer algunas preguntas para conocerte mejor. ¿A qué posición te estás postulando?',
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
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

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Integración con n8n webhook
      const n8nPayload = {
        message: inputMessage.trim(),
        user: {
          email: user?.email || 'unknown@email.com',
          name: user?.name || 'Usuario Anónimo',
          picture: user?.picture || null
        },
        chatHistory: messages.map(msg => ({
          content: msg.content,
          isUser: msg.isUser,
          timestamp: msg.timestamp.toISOString()
        })),
        sessionId: `chat_${Date.now()}`,
        timestamp: new Date().toISOString()
      }

      const response = await fetch('https://n8n.cloud-it.com.ar/webhook/cc4a018d-d373-4e35-88fe-547271539ae9', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(n8nPayload)
      })

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
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: aiContent,
        isUser: false,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)

    } catch (error) {
      console.error('Error sending message to n8n:', error)
      
      // Fallback response en caso de error
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Disculpa, estoy teniendo problemas técnicos. Por favor intenta nuevamente en unos momentos.',
        isUser: false,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorResponse])
      setIsLoading(false)
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
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              🤖
            </div>
            <div>
              <h1 className="text-white font-semibold">Entrevista con IA</h1>
              <p className="text-slate-400 text-sm">Agent Platform</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-white text-sm font-medium">{user?.name}</p>
              <p className="text-slate-400 text-xs">{user?.email}</p>
            </div>
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.isUser 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}>
                  {message.isUser ? '👤' : '🤖'}
                </div>

                {/* Message Content */}
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
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu respuesta..."
                className="w-full bg-slate-800 border border-slate-600 rounded-2xl px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
                rows={1}
                disabled={isLoading}
              />
            </div>
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
    </div>
  )
}

export default Chat