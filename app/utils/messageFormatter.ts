/**
 * Utilidad para formatear mensajes de n8n con saltos de línea y markdown básico
 */

export interface FormattedMessage {
  content: string
  hasMarkdown: boolean
  hasEmojis: boolean
}

/**
 * Formatea el contenido del mensaje para mejor visualización
 * @param text - Texto crudo del mensaje
 * @returns Objeto con contenido formateado y metadatos
 */
export const formatMessage = (text: string): FormattedMessage => {
  if (!text || typeof text !== 'string') {
    return {
      content: '',
      hasMarkdown: false,
      hasEmojis: false
    }
  }

  let formattedContent = text

  // Detectar si tiene markdown
  const hasMarkdown = /\*\*(.*?)\*\*/g.test(text)
  
  // Detectar si tiene emojis (simplified for ES5 compatibility)
  const hasEmojis = /😀|😃|😄|😁|😆|😅|😂|🤣|🙂|🙃|😉|😊|😇|🥰|😍|🤩|😘|😗|😚|😙|😋|😛|😜|🤪|😝|🤑|🤗|🤭|🤫|🤔|🤐|🤨|😐|😑|😶|😏|😒|🙄|😬|🤥|😔|😪|🤤|😴|😷|🤒|🤕|🤢|🤮|🤧|🥵|🥶|🥴|😵|🤯|🤠|🥳|😎|🤓|🧐|😕|😟|🙁|☹️|😮|😯|😲|😳|🥺|😦|😧|😨|😰|😥|😢|😭|😱|😖|😣|😞|😓|😩|😫|🥱|😤|😡|😠|🤬|😈|👿|💀|☠️|💩|🤡|👹|👺|👻|👽|👾|🤖|🎃|😺|😸|😹|😻|😼|😽|🙀|😿|😾|🙈|🙉|🙊|💋|💌|💘|💝|💖|💗|💓|💞|💕|💟|❣️|💔|❤️|🧡|💛|💚|💙|💜|🤎|🖤|🤍|💯|💫|💥|💢|💨|💤|💦|💧|💨|💢|👋|🤚|🖐️|✋|🖖|👌|🤏|✌️|🤞|🤟|🤘|🤙|👈|👉|👆|🖕|👇|☝️|👍|👎|👊|✊|🤛|🤜|👏|🙌|👐|🤲|🤝|🙏|✍️|💅|🤳|💪|🦾|🦿|🦵|🦶|👂|🦻|👃|🧠|🦷|🦴|👀|👁️|👅|👄|👶|🧒|👦|👧|🧑|👱|👨|🧔|👩|🧓|👴|👵|🙍|🙎|🙅|🙆|💁|🙋|🧏|🙇|🤦|🤷|👮|🕵️|💂|👷|🤴|👸|👳|👲|🧕|🤵|👰|🤰|🤱|👼|🎅|🤶|🦸|🦹|🧙|🧚|🧛|🧜|🧝|🧞|🧟|💆|💇|🚶|🏃|💃|🕺|🕴️|👯|🧖|🧘|🛀|🛌|👤|👥|👫|👬|👭|💏|💑|👪|🤳/.test(text)

  // Procesar markdown básico (**texto** -> texto en bold)
  // Por ahora removemos el markdown para mantener consistencia visual
  formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '$1')

  // Mejorar espaciado alrededor de emojis comunes de n8n
  const commonEmojis = [
    '🏢', '💰', '📍', '🎯', '🔧', '❓', '✅', '📋', 
    '🤖', '💼', '📊', '⚡', '🚀', '📝', '💡', '🔍'
  ]
  
  commonEmojis.forEach(emoji => {
    const emojiRegex = new RegExp(`([^\\s])${emoji}([^\\s])`, 'g')
    formattedContent = formattedContent.replace(emojiRegex, `$1 ${emoji} $2`)
  })

  // Limpiar espacios múltiples pero preservar saltos de línea
  formattedContent = formattedContent
    .replace(/[ \t]+/g, ' ') // Reemplazar múltiples espacios/tabs con uno solo
    .replace(/\n\s+\n/g, '\n\n') // Limpiar líneas vacías con espacios
    .trim()

  return {
    content: formattedContent,
    hasMarkdown,
    hasEmojis
  }
}

/**
 * Detecta si el mensaje es una lista estructurada (posiciones, opciones, etc.)
 * @param text - Texto del mensaje
 * @returns true si parece ser una lista estructurada
 */
export const isStructuredList = (text: string): boolean => {
  const listIndicators = [
    /\*\*ID \d+\*\*/g, // **ID 1**, **ID 2**
    /^\d+\./gm, // 1. 2. 3.
    /^[-*]\s/gm, // - item, * item
    /🏢|💰|📍/g // Emojis típicos de listados de trabajo
  ]

  return listIndicators.some(regex => regex.test(text))
}

/**
 * Extrae información estructurada de mensajes de posiciones de trabajo
 * @param text - Texto del mensaje
 * @returns Array de posiciones extraídas
 */
export const extractJobPositions = (text: string): Array<{
  id: string
  title: string
  company: string
  salary: string
  modality: string
}> => {
  const positions: Array<{
    id: string
    title: string
    company: string
    salary: string
    modality: string
  }> = []

  // Regex para extraer posiciones con formato **ID X** - Título
  const positionRegex = /\*\*ID (\d+)\*\*\s*-\s*([^\n]+)[\s\S]*?🏢\s*Empresa:\s*([^\n]+)[\s\S]*?💰\s*Salario:\s*([^\n]+)[\s\S]*?📍\s*Modalidad:\s*([^\n]+)/g

  let match
  while ((match = positionRegex.exec(text)) !== null) {
    positions.push({
      id: match[1],
      title: match[2].trim(),
      company: match[3].trim(),
      salary: match[4].trim(),
      modality: match[5].trim()
    })
  }

  return positions
}