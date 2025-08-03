# 🏗️ Architecture - Mejoras Estructurales

## Task ARCH-001: Reorganizar Estructura de Archivos
**Prioridad:** Alta  
**Tiempo estimado:** 6 horas  
**Tipo:** Refactoring

### Descripción
Reorganizar la estructura de archivos para mejorar mantenibilidad y escalabilidad.

### Nueva estructura propuesta:
```
app/
├── components/
│   ├── ui/              # Componentes base reutilizables
│   │   ├── Button.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx
│   ├── features/        # Componentes específicos de funcionalidades
│   │   ├── chat/
│   │   ├── voice/
│   │   └── auth/
│   └── layout/          # Componentes de layout
├── types/               # Definiciones TypeScript centralizadas
├── constants/           # Constantes de la aplicación
└── utils/              # Utilidades (ya existe)
```

### Tareas específicas:
- [ ] Crear nuevos directorios
- [ ] Mover componentes existentes
- [ ] Actualizar todos los imports
- [ ] Crear index.ts para exports limpios
- [ ] Documentar nueva estructura

### Archivos afectados:
- Todos los componentes existentes
- Todos los archivos que importan componentes

---

## Task ARCH-002: Centralizar Tipos TypeScript
**Prioridad:** Alta  
**Tiempo estimado:** 4 horas  
**Tipo:** TypeScript

### Descripción
Crear definiciones de tipos centralizadas para mejorar consistencia y mantenibilidad.

### Tareas específicas:
- [ ] Crear `app/types/index.ts`
- [ ] Definir interface User centralizada
- [ ] Definir interface Message centralizada
- [ ] Definir interface VoiceData centralizada
- [ ] Crear tipos para API responses
- [ ] Actualizar todos los componentes

### Tipos a crear:
```typescript
export interface User {
  email: string
  name: string
  picture?: string
  attributes?: Record<string, any>
  signInUserSession?: any
}

export interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  type?: 'text' | 'voice'
  voiceData?: VoiceData
}

export interface VoiceData {
  audioBlob?: Blob
  audioUrl?: string
  duration: number
  audioBase64?: string
  audioType?: string
}
```

### Archivos afectados:
- `app/hooks/useChatPersistence.ts`
- `app/pages/chat.tsx`
- `app/lib/useUser.ts`
- Todos los componentes que usan estos tipos

---

## Task ARCH-003: Implementar Context API para Estado Global
**Prioridad:** Media  
**Tiempo estimado:** 5 horas  
**Tipo:** State Management

### Descripción
Implementar Context API para manejar estado global de usuario y chat.

### Tareas específicas:
- [ ] Crear UserContext para estado de usuario
- [ ] Crear ChatContext para estado de chat
- [ ] Implementar providers en _app.tsx
- [ ] Migrar lógica de useUser a context
- [ ] Crear hooks personalizados para contexts
- [ ] Actualizar componentes para usar contexts

### Archivos a crear:
- `app/contexts/UserContext.tsx`
- `app/contexts/ChatContext.tsx`
- `app/hooks/useUserContext.ts`
- `app/hooks/useChatContext.ts`

### Archivos afectados:
- `app/pages/_app.tsx`
- `app/pages/chat.tsx`
- `app/lib/useUser.ts`

---

## Task ARCH-004: Implementar Error Boundaries Completos
**Prioridad:** Alta  
**Tiempo estimado:** 3 horas  
**Tipo:** Error Handling

### Descripción
Implementar sistema completo de Error Boundaries para capturar y manejar errores.

### Tareas específicas:
- [ ] Crear ErrorBoundary principal
- [ ] Crear ErrorBoundary específico para chat
- [ ] Crear ErrorBoundary específico para voice
- [ ] Implementar logging de errores
- [ ] Crear fallback UIs informativos
- [ ] Agregar error reporting

### Componentes a crear:
```typescript
// app/components/ui/ErrorBoundary.tsx
interface Props {
  fallback?: React.ComponentType<{error: Error}>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  children: React.ReactNode
}
```

### Archivos afectados:
- `app/pages/_app.tsx`
- `app/pages/chat.tsx`
- `app/components/VoiceRecorder.tsx`