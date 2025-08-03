#!/usr/bin/env node

/**
 * Script para analizar el bundle y generar reporte de optimización
 * Uso: node .kiro/scripts/analyze-bundle.js
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔍 Analizando bundle de la aplicación...\n')

// Función para ejecutar comandos
const runCommand = (command, description) => {
  console.log(`📊 ${description}...`)
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' })
    return output
  } catch (error) {
    console.error(`❌ Error ejecutando: ${command}`)
    console.error(error.message)
    return null
  }
}

// Función para formatear bytes
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 1. Construir la aplicación
console.log('🏗️  Construyendo aplicación...')
runCommand('npm run build', 'Build de producción')

// 2. Analizar tamaño de archivos
console.log('\n📦 Analizando tamaños de archivos...')

const buildDir = path.join(__dirname, '../../.next')
const staticDir = path.join(buildDir, 'static')

if (fs.existsSync(staticDir)) {
  const getDirectorySize = (dirPath) => {
    let totalSize = 0
    const files = fs.readdirSync(dirPath, { withFileTypes: true })
    
    for (const file of files) {
      const filePath = path.join(dirPath, file.name)
      if (file.isDirectory()) {
        totalSize += getDirectorySize(filePath)
      } else {
        totalSize += fs.statSync(filePath).size
      }
    }
    return totalSize
  }
  
  const totalSize = getDirectorySize(staticDir)
  console.log(`📊 Tamaño total del bundle: ${formatBytes(totalSize)}`)
  
  // Analizar chunks individuales
  const chunksDir = path.join(staticDir, 'chunks')
  if (fs.existsSync(chunksDir)) {
    const chunks = fs.readdirSync(chunksDir)
      .filter(file => file.endsWith('.js'))
      .map(file => {
        const filePath = path.join(chunksDir, file)
        const size = fs.statSync(filePath).size
        return { name: file, size, formattedSize: formatBytes(size) }
      })
      .sort((a, b) => b.size - a.size)
      .slice(0, 10) // Top 10 chunks más grandes
    
    console.log('\n📋 Top 10 chunks más grandes:')
    chunks.forEach((chunk, index) => {
      console.log(`${index + 1}. ${chunk.name}: ${chunk.formattedSize}`)
    })
  }
}

// 3. Analizar dependencias
console.log('\n📚 Analizando dependencias...')
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'))
const dependencies = Object.keys(packageJson.dependencies || {})
const devDependencies = Object.keys(packageJson.devDependencies || {})

console.log(`📦 Dependencias de producción: ${dependencies.length}`)
console.log(`🛠️  Dependencias de desarrollo: ${devDependencies.length}`)

// Dependencias más pesadas (estimación)
const heavyDependencies = [
  'aws-amplify',
  'react',
  'react-dom',
  'next',
  '@aws-amplify/ui-react'
]

console.log('\n⚠️  Dependencias potencialmente pesadas detectadas:')
heavyDependencies.forEach(dep => {
  if (dependencies.includes(dep)) {
    console.log(`   • ${dep}`)
  }
})

// 4. Recomendaciones de optimización
console.log('\n💡 Recomendaciones de optimización:')

const recommendations = [
  {
    condition: totalSize > 500 * 1024, // 500KB
    message: '📦 Bundle size > 500KB - Considera implementar code splitting'
  },
  {
    condition: dependencies.includes('lodash'),
    message: '🔧 Lodash detectado - Usa imports específicos: import debounce from "lodash/debounce"'
  },
  {
    condition: dependencies.includes('moment'),
    message: '📅 Moment.js detectado - Considera migrar a date-fns o dayjs (más ligeros)'
  },
  {
    condition: !fs.existsSync(path.join(__dirname, '../../next.config.js')),
    message: '⚙️  Configura next.config.js para optimizaciones adicionales'
  }
]

recommendations.forEach(rec => {
  if (rec.condition) {
    console.log(`   ${rec.message}`)
  }
})

// 5. Generar reporte
const report = {
  timestamp: new Date().toISOString(),
  bundleSize: totalSize ? formatBytes(totalSize) : 'N/A',
  dependencies: dependencies.length,
  devDependencies: devDependencies.length,
  recommendations: recommendations.filter(rec => rec.condition).map(rec => rec.message)
}

const reportPath = path.join(__dirname, '../monitoring/bundle-analysis.json')
fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

console.log(`\n📄 Reporte guardado en: ${reportPath}`)
console.log('\n✅ Análisis completado!')

// 6. Abrir bundle analyzer si está disponible
console.log('\n🌐 Para análisis visual detallado, ejecuta:')
console.log('   npm run analyze')
console.log('   Esto abrirá el bundle analyzer en tu navegador')