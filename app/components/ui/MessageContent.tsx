import React from 'react'
import { formatMessage, isStructuredList } from '../../utils/messageFormatter'

interface MessageContentProps {
  content: string
  isUser: boolean
  className?: string
}

/**
 * Componente especializado para renderizar contenido de mensajes
 * con soporte para saltos de línea, emojis y formato estructurado
 */
const MessageContent: React.FC<MessageContentProps> = ({
  content,
  isUser,
  className = ''
}) => {
  const formatted = formatMessage(content)
  const isStructured = isStructuredList(content)

  // Clases base para el contenido
  const baseClasses = `
    text-sm leading-relaxed whitespace-pre-line
    ${isStructured ? 'space-y-1' : ''}
    ${className}
  `

  // Clases específicas para contenido estructurado
  const structuredClasses = isStructured 
    ? 'font-medium tracking-wide' 
    : ''

  return (
    <div className={`${baseClasses} ${structuredClasses}`}>
      {formatted.content}
    </div>
  )
}

export default MessageContent