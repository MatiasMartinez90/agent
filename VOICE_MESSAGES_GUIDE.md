# 🎤 Guía de Mensajes de Voz - Agent Platform

## 🎯 **Funcionalidad Implementada**

La aplicación ahora soporta mensajes de voz estilo WhatsApp que se envían a N8N para procesamiento con IA.

### **✅ Características:**
- **Grabación de audio** con Web Audio API
- **UI estilo WhatsApp** con botón de micrófono
- **Visualización de ondas** durante grabación
- **Reproducción de mensajes** de voz enviados y recibidos
- **Envío a N8N** como FormData con archivo de audio
- **Persistencia** en localStorage (temporal)

---

## 🛠️ **Componentes Implementados**

### **1. useVoiceRecording Hook**
- **Archivo**: `app/hooks/useVoiceRecording.ts`
- **Funcionalidad**:
  - ✅ Grabación con MediaRecorder API
  - ✅ Control de duración (máx 5 minutos)
  - ✅ Cancelación y pausa
  - ✅ Formato WebM con Opus codec
  - ✅ Configuración de audio optimizada

### **2. VoiceRecorder Component**
- **Archivo**: `app/components/VoiceRecorder.tsx`
- **Funcionalidad**:
  - ✅ Botón de micrófono estilo WhatsApp
  - ✅ UI de grabación con timer y ondas
  - ✅ Botones de cancelar/enviar
  - ✅ Estados visuales (grabando, enviando)

### **3. VoiceMessage Component**
- **Archivo**: `app/components/VoiceMessage.tsx`
- **Funcionalidad**:
  - ✅ Reproducción de audio con controles
  - ✅ Visualización de ondas de audio
  - ✅ Progress bar durante reproducción
  - ✅ Duración y timestamp

### **4. Chat Integration**
- **Archivo**: `app/pages/chat.tsx`
- **Funcionalidad**:
  - ✅ Envío de audio a N8N como FormData
  - ✅ Persistencia de mensajes de voz
  - ✅ Renderizado de mensajes de voz
  - ✅ UX integrada con chat de texto

---

## 📡 **Integración con N8N**

### **Payload para Mensajes de Voz**

```javascript
// FormData enviado a N8N webhook
const formData = new FormData()
formData.append('audio', audioBlob, 'voice-message.webm')
formData.append('duration', duration.toString())
formData.append('type', 'voice')
formData.append('user', JSON.stringify({
  email: 'user@example.com',
  name: 'Usuario',
  picture: 'https://...'
}))
formData.append('chatHistory', JSON.stringify([...]))
formData.append('sessionId', 'chat_1234567890')
formData.append('timestamp', '2025-01-26T15:30:00.000Z')
```

### **Configuración N8N Requerida**

#### **1. Webhook Node Configuration**
```json
{
  "httpMethod": "POST",
  "path": "cc4a018d-d373-4e35-88fe-547271539ae9",
  "responseMode": "responseNode",
  "options": {
    "rawBody": true
  }
}
```

#### **2. Detección de Tipo de Mensaje**
```javascript
// En N8N Function Node
if ($input.first().binary?.audio) {
  // Es un mensaje de voz
  const audioData = $input.first().binary.audio
  const duration = $input.first().json.duration
  const type = 'voice'
  
  // Procesar audio...
} else {
  // Es un mensaje de texto
  const message = $input.first().json.message
  const type = 'text'
  
  // Procesar texto...
}
```

#### **3. Transcripción de Audio (Whisper API)**
```javascript
// N8N HTTP Request Node para OpenAI Whisper
{
  "method": "POST",
  "url": "https://api.openai.com/v1/audio/transcriptions",
  "headers": {
    "Authorization": "Bearer {{$env.OPENAI_API_KEY}}"
  },
  "body": {
    "file": "{{$binary.audio}}",
    "model": "whisper-1",
    "language": "es"
  }
}
```

#### **4. Procesamiento con IA**
```javascript
// Después de transcripción
const transcription = $input.first().json.text
const prompt = `Usuario dijo por audio: "${transcription}"`

// Enviar a Claude/GPT como texto normal
// La respuesta puede ser texto o audio generado
```

---

## 🎨 **UX/UI Implementada**

### **Estados de Grabación**
```
1. Reposo: [🎤] Botón de micrófono
2. Grabando: [🔴 0:15] [~~~waves~~~] [❌] [✓]
3. Enviando: Loading spinner
4. Completado: Mensaje de voz en chat
```

### **Mensajes de Voz**
```
[👤] [▶️] [~~~progress~~~] [1:23 / 2:45] [14:30]
```

### **Responsive Design**
- **Desktop**: Botón junto al textarea
- **Mobile**: Optimizado para touch
- **Accesibilidad**: Tooltips y estados claros

---

## 🔧 **Configuración Técnica**

### **Permisos del Navegador**
```javascript
// Solicita permisos de micrófono automáticamente
navigator.mediaDevices.getUserMedia({ 
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 44100
  } 
})
```

### **Formatos de Audio Soportados**
- **Preferido**: `audio/webm;codecs=opus`
- **Fallback**: `audio/webm`
- **Compatibilidad**: Chrome, Firefox, Safari (parcial)

### **Limitaciones**
- **Duración máxima**: 5 minutos
- **Tamaño de archivo**: ~1MB por minuto
- **Navegadores**: Requiere HTTPS en producción

---

## 🚀 **Deployment y Testing**

### **Variables de Entorno**
```bash
# .env.local
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://n8n.cloud-it.com.ar/webhook/cc4a018d-d373-4e35-88fe-547271539ae9
```

### **Testing Local**
```bash
# 1. Iniciar desarrollo
npm run dev

# 2. Abrir https://localhost:3000/chat
# 3. Hacer login
# 4. Probar grabación de voz
# 5. Verificar en N8N que llega el audio
```

### **Debugging**
```javascript
// En DevTools Console
console.log('Voice recording state:', voiceRecordingState)
console.log('Audio blob:', audioBlob)
console.log('FormData entries:', [...formData.entries()])
```

---

## 📋 **N8N Workflow Sugerido**

### **Flujo Completo**
```
1. Webhook (recibe audio/texto)
2. Switch (detecta tipo de mensaje)
3a. Si es voz → Whisper API → Transcripción
3b. Si es texto → Usar directamente
4. Claude/GPT API (procesar mensaje)
5. Respuesta (texto o audio generado)
6. Return Response
```

### **Nodos N8N Necesarios**
- **Webhook** - Recibir datos
- **Switch** - Detectar tipo
- **HTTP Request** - Whisper API
- **HTTP Request** - Claude/GPT API
- **Function** - Procesamiento de datos
- **Respond to Webhook** - Enviar respuesta

---

## 🎯 **Próximas Mejoras**

### **Funcionalidades Avanzadas**
- [ ] **Respuestas de voz**: N8N genera audio con TTS
- [ ] **Transcripción en tiempo real**: Mostrar texto mientras graba
- [ ] **Compresión de audio**: Reducir tamaño de archivos
- [ ] **Múltiples idiomas**: Detección automática de idioma

### **UX Improvements**
- [ ] **Gestos táctiles**: Hold to record en móvil
- [ ] **Visualización mejorada**: Ondas de audio más realistas
- [ ] **Notificaciones**: Feedback visual/haptic
- [ ] **Accesibilidad**: Soporte para lectores de pantalla

### **Performance**
- [ ] **Streaming**: Envío de audio en chunks
- [ ] **Caching**: Cache de transcripciones
- [ ] **Offline**: Grabación sin conexión
- [ ] **WebRTC**: Mejor calidad de audio

---

## 🔍 **Troubleshooting**

### **Problemas Comunes**

#### **1. Micrófono no funciona**
```javascript
// Verificar permisos
navigator.permissions.query({name: 'microphone'})
  .then(result => console.log(result.state))
```

#### **2. Audio no llega a N8N**
```javascript
// Verificar FormData
console.log('FormData size:', formData.get('audio').size)
console.log('Content-Type:', formData.get('audio').type)
```

#### **3. Transcripción falla**
- Verificar API key de OpenAI
- Comprobar formato de audio soportado
- Revisar límites de tamaño (25MB max)

#### **4. UI no responde**
- Verificar estados de React
- Comprobar event listeners
- Revisar cleanup de useEffect

---

## 📞 **Soporte**

- **Documentación**: Este archivo
- **Logs**: DevTools Console
- **Testing**: https://agent.cloud-it.com.ar/chat
- **N8N**: https://n8n.cloud-it.com.ar

---

**🎤 ¡Los mensajes de voz están listos para usar! Solo falta configurar el workflow de N8N para procesar el audio.**