import Router from 'next/router'
import { useRef, useEffect } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { getCurrentUser, signOut as amplifySignOut, fetchAuthSession } from 'aws-amplify/auth'

const fetcher = async () => {
  try {
    console.log('🔍 [useUser] Checking authentication state...')
    
    // Método 1: Intentar getCurrentUser con timeout corto
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('getCurrentUser timeout')), 3000)
      })
      
      const user = await Promise.race([
        getCurrentUser(),
        timeoutPromise
      ]) as Awaited<ReturnType<typeof getCurrentUser>>
      
      console.log('✅ [useUser] getCurrentUser succeeded:', {
        username: user?.username,
        signInDetails: user?.signInDetails?.loginId
      })
      return user
    } catch (getCurrentUserError) {
      console.log('⚠️ [useUser] getCurrentUser failed, trying session-based approach...')
      
      // Método 2: Usar fetchAuthSession que es más confiable después de OAuth
      try {
        const sessionTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('fetchAuthSession timeout')), 5000)
        })
        
        const session = await Promise.race([
          fetchAuthSession(),
          sessionTimeoutPromise
        ]) as Awaited<ReturnType<typeof fetchAuthSession>>
        
        console.log('🔍 [useUser] Session fetched, checking tokens...')
        
        if (!session.tokens?.idToken) {
          throw new Error('No ID token found in session')
        }
        
        // Extraer información del usuario del ID token
        const idToken = session.tokens.idToken.toString()
        const payload = JSON.parse(atob(idToken.split('.')[1]))
        
        // Crear un objeto de usuario compatible
        const user = {
          username: payload.username || payload.sub,
          userId: payload.sub,
          signInDetails: {
            loginId: payload.email || payload.username
          },
          // Agregar propiedades adicionales si están disponibles
          ...(payload.email && { email: payload.email }),
          ...(payload.name && { name: payload.name }),
          ...(payload.picture && { picture: payload.picture })
        }
        
        console.log('✅ [useUser] Session-based auth succeeded:', {
          username: user.username,
          email: payload.email,
          hasIdToken: true
        })
        
        return user
      } catch (sessionError) {
        console.error('❌ [useUser] Session-based auth failed:', sessionError)
        throw new Error('User is not authenticated')
      }
    }
  } catch (error) {
    console.error('❌ [useUser] Authentication failed:', error)
    throw error
  }
}

export default function useUser({ redirect = '' } = {}) {
  const { cache } = useSWRConfig()
  const { data: user, error, isValidating } = useSWR('user', fetcher, {
    errorRetryCount: 3,
    errorRetryInterval: 2000,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000
  })
  const hasRedirected = useRef(false)
  const renderCount = useRef(0)
  
  renderCount.current += 1

  const loading = !user && !error
  const loggedOut = error && error === 'The user is not authenticated'
  const isAuthenticating = isValidating && !user

  console.log('👤 [useUser] Hook call #' + renderCount.current, {
    hasUser: !!user,
    userEmail: user?.signInDetails?.loginId || user?.username,
    error: error?.message || error,
    loading,
    loggedOut,
    isValidating,
    redirect,
    hasRedirected: hasRedirected.current,
    renderCount: renderCount.current,
    currentPath: typeof window !== 'undefined' ? window.location.pathname : 'server',
    timestamp: new Date().toISOString(),
    stackTrace: renderCount.current > 10 ? new Error().stack?.split('\n').slice(0, 5).join('\n') : 'normal'
  })
  
  if (renderCount.current > 50) {
    console.error('🚨 [useUser] LOOP INFINITO DETECTADO - MAS DE 50 CALLS!')
    throw new Error('Loop infinito detectado en useUser hook')
  }

  // Usar useEffect para manejar redirects de forma segura
  useEffect(() => {
    console.log('🔄 [useUser] useEffect redirect ejecutado:', {
      loggedOut,
      redirect,
      hasRedirected: hasRedirected.current,
      shouldRedirect: loggedOut && redirect && !hasRedirected.current
    })
    
    if (loggedOut && redirect && !hasRedirected.current) {
      console.log('🚪 [useUser] Redirigiendo usuario no autenticado (primera vez):', {
        from: typeof window !== 'undefined' ? window.location.pathname : 'server',
        to: redirect,
        timestamp: new Date().toISOString()
      })
      
      hasRedirected.current = true
      
      setTimeout(() => {
        Router.push({ pathname: redirect, query: { redirect: Router.asPath } })
      }, 100)
    }
  }, [loggedOut, redirect]) // ← Estas dependencias pueden ser problemáticas

  // Reset del flag cuando el usuario se autentica
  useEffect(() => {
    console.log('🔄 [useUser] useEffect reset ejecutado:', {
      hasUser: !!user,
      hasRedirected: hasRedirected.current,
      shouldReset: user && hasRedirected.current
    })
    
    if (user && hasRedirected.current) {
      console.log('🔄 [useUser] Usuario autenticado, reseteando flag de redirect')
      hasRedirected.current = false
    }
  }, [user])

  const signOut = async ({ redirect = '/' }) => {
    cache.delete('user')
    await Router.push(redirect)
    await amplifySignOut()
  }

  return { 
    loading, 
    loggedOut, 
    user, 
    signOut,
    isAuthenticating,
    loadingMessage: isAuthenticating ? 'Verificando autenticación...' : 'Cargando usuario...'
  }
}
