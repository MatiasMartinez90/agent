// Script para limpiar manualmente localStorage de Cognito
// Ejecutar en consola del navegador: fetch('/clear-auth.js').then(r=>r.text()).then(eval)

console.log('🧹 Iniciando limpieza manual de localStorage...')

// Obtener todas las claves de Cognito
const allKeys = Object.keys(localStorage)
const cognitoKeys = allKeys.filter(key => key.includes('Cognito'))

console.log('🔍 Claves de Cognito encontradas:', cognitoKeys)

// Limpiar todas las claves de Cognito
let removedCount = 0
cognitoKeys.forEach(key => {
  localStorage.removeItem(key)
  console.log('🗑️ Removido:', key)
  removedCount++
})

// Limpiar también cache de SWR si existe
if (typeof localStorage.getItem('swr-cache') !== null) {
  localStorage.removeItem('swr-cache')
  console.log('🗑️ Removido: swr-cache')
  removedCount++
}

console.log(`✅ Limpieza completada. ${removedCount} elementos removidos.`)
console.log('🔄 Por favor, recarga la página y haz login nuevamente.')
console.log('📍 Ve a: /signin')

// Auto-redirigir al signin
if (window.location.pathname !== '/signin') {
  console.log('🚀 Redirigiendo automáticamente al login...')
  setTimeout(() => {
    window.location.href = '/signin'
  }, 2000)
} else {
  console.log('💡 Ya estás en la página de login. Intenta hacer login con Google.')
}