/**
 * Tests para verificar el formateo de mensajes
 * Ejecutar con: npm test messageFormatter.test.ts
 */

import { formatMessage, isStructuredList, extractJobPositions } from './messageFormatter'

// Mensaje de ejemplo como el que viene de n8n
const sampleN8NMessage = `📋 POSICIONES ACTIVAS DISPONIBLES

He encontrado 5 posiciones activas:

**ID 1** - Desarrollador Full Stack React/Node.js
🏢 Empresa: MercadoLibre
💰 Salario: $800.000 - $1.200.000 ARS
📍 Modalidad: Híbrido (3 días oficina, 2 home office)

**ID 2** - Data Scientist Senior
🏢 Empresa: Banco Galicia
💰 Salario: USD $3.500 - $5.000 mensual
📍 Modalidad: 100% Remoto

❓ ¿A cuál posición te gustaría postularte? Responde con el **ID** de la posición que te interese.`

// Test básico de formateo
console.log('=== TEST: Formateo básico ===')
const formatted = formatMessage(sampleN8NMessage)
console.log('Contenido formateado:')
console.log(formatted.content)
console.log('\nMetadatos:')
console.log('- Tiene markdown:', formatted.hasMarkdown)
console.log('- Tiene emojis:', formatted.hasEmojis)

// Test de detección de lista estructurada
console.log('\n=== TEST: Detección de lista estructurada ===')
console.log('Es lista estructurada:', isStructuredList(sampleN8NMessage))

// Test de extracción de posiciones
console.log('\n=== TEST: Extracción de posiciones ===')
const positions = extractJobPositions(sampleN8NMessage)
console.log('Posiciones extraídas:', positions.length)
positions.forEach((pos, index) => {
  console.log(`${index + 1}. ID ${pos.id}: ${pos.title}`)
  console.log(`   Empresa: ${pos.company}`)
  console.log(`   Salario: ${pos.salary}`)
  console.log(`   Modalidad: ${pos.modality}`)
})

export { sampleN8NMessage }