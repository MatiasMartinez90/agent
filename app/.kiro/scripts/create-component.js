#!/usr/bin/env node

/**
 * Script para crear componentes React con la estructura estándar del proyecto
 * Uso: node .kiro/scripts/create-component.js ComponentName [type]
 * Tipos: ui, feature, layout
 */

const fs = require('fs')
const path = require('path')

// Obtener argumentos de línea de comandos
const componentName = process.argv[2]
const componentType = process.argv[3] || 'feature'

if (!componentName) {
  console.error('❌ Error: Debes proporcionar un nombre de componente')
  console.log('📖 Uso: node .kiro/scripts/create-component.js ComponentName [type]')
  console.log('📁 Tipos disponibles: ui, feature, layout')
  process.exit(1)
}

// Validar tipo de componente
const validTypes = ['ui', 'feature', 'layout']
if (!validTypes.includes(componentType)) {
  console.error(`❌ Error: Tipo "${componentType}" no válido`)
  console.log(`📁 Tipos válidos: ${validTypes.join(', ')}`)
  process.exit(1)
}

// Definir rutas
const templatePath = path.join(__dirname, '../templates/react-component.tsx')
const componentDir = path.join(__dirname, `../../components/${componentType}`)
const componentPath = path.join(componentDir, `${componentName}.tsx`)

// Crear directorio si no existe
if (!fs.existsSync(componentDir)) {
  fs.mkdirSync(componentDir, { recursive: true })
  console.log(`📁 Directorio creado: ${componentDir}`)
}

// Verificar si el componente ya existe
if (fs.existsSync(componentPath)) {
  console.error(`❌ Error: El componente ${componentName} ya existe en ${componentPath}`)
  process.exit(1)
}

// Leer template
let template
try {
  template = fs.readFileSync(templatePath, 'utf8')
} catch (error) {
  console.error('❌ Error: No se pudo leer el template')
  console.error(error.message)
  process.exit(1)
}

// Reemplazar placeholders
const componentCode = template.replace(/\{\{ComponentName\}\}/g, componentName)

// Escribir archivo
try {
  fs.writeFileSync(componentPath, componentCode)
  console.log(`✅ Componente creado exitosamente: ${componentPath}`)
  
  // Mostrar próximos pasos
  console.log('\n📋 Próximos pasos:')
  console.log(`1. Edita el componente en: ${componentPath}`)
  console.log(`2. Agrega el export en: components/${componentType}/index.ts`)
  console.log(`3. Importa donde lo necesites: import ${componentName} from 'components/${componentType}/${componentName}'`)
  
  // Crear archivo de index si no existe
  const indexPath = path.join(componentDir, 'index.ts')
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, `export { default as ${componentName} } from './${componentName}'\n`)
    console.log(`📝 Archivo index.ts creado: ${indexPath}`)
  } else {
    // Agregar export al index existente
    const indexContent = fs.readFileSync(indexPath, 'utf8')
    if (!indexContent.includes(componentName)) {
      fs.appendFileSync(indexPath, `export { default as ${componentName} } from './${componentName}'\n`)
      console.log(`📝 Export agregado a index.ts`)
    }
  }
  
} catch (error) {
  console.error('❌ Error: No se pudo crear el componente')
  console.error(error.message)
  process.exit(1)
}