import Router from 'next/router'
import { useRef, useEffect } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { getCurrentUser, signOut as amplifySignOut, fetchAuthSession } from 'aws-amplify/auth'

const extractUserFromLocalStorage = () => {
  if (typeof window === 'undefined') return null
  
  try {
    const clientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_WEB_CLIENT_ID || '2sfsss72kin03gbilraa1pvlb5'
    const lastAuthUser = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`)
    
    if (!lastAuthUser) return null
    
    const idTokenKey = `CognitoIdentityServiceProvider.${clientId}.${lastAuthUser}.idToken`
    const accessTokenKey = `CognitoIdentityServiceProvider.${clientId}.${lastAuthUser}.accessToken`
    const userDataKey = `CognitoIdentityServiceProvider.${clientId}.${lastAuthUser}.userData`
    
    const idToken = localStorage.getItem(idTokenKey)
    const accessToken = localStorage.getItem(accessTokenKey)
    const userData = localStorage.getItem(userDataKey)
    
    if (!idToken) return null
    
    // Parse ID token payload
    const payload = JSON.parse(atob(idToken.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    
    // Check if token is expired
    if (payload.exp < currentTime) {
      console.log('⚠️ [useUser] Token expired, clearing localStorage')
      // Clear expired tokens
      localStorage.removeItem(idTokenKey)
      localStorage.removeItem(accessTokenKey)
      localStorage.removeItem(userDataKey)
      localStorage.removeItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`)
      return null
    }
    
    // Parse additional user data if available
    let parsedUserData = null
    try {
      if (userData) {
        parsedUserData = JSON.parse(userData)
      }
    } catch (e) {
      // Ignore userData parsing errors
    }
    
    // Crear objeto de usuario completo con todos los datos disponibles
    const user = {
      username: payload.username || payload.sub,
      userId: payload.sub,
      signInDetails: {
        loginId: payload.email || payload.username || payload.sub
      },
      // Datos del ID token
      email: payload.email,
      name: payload.name || payload.given_name || (payload.given_name && payload.family_name ? `${payload.given_name} ${payload.family_name}` : null),
      picture: payload.picture,
      // Datos adicionales del payload
      givenName: payload.given_name,
      familyName: payload.family_name,
      nickname: payload.nickname,
      // Metadatos del token
      tokenExp: payload.exp,
      tokenIat: payload.iat,
      // Datos adicionales si están disponibles
      ...(parsedUserData && typeof parsedUserData === 'object' ? parsedUserData : {})
    }
    
    return user
  } catch (error) {
    console.error('❌ [useUser] Error extracting from localStorage:', error)
    return null
  }
}

const fetcher = async () => {
  const startTime = performance.now()
  
  try {
    console.log('⚡ [useUser] Starting fast authentication check...')
    
    // MÉTODO PRINCIPAL: Extracción directa de localStorage (0-10ms)
    const localUser = extractUserFromLocalStorage()
    
    if (localUser) {
      const loadTime = Math.round(performance.now() - startTime)
      console.log('✅ [useUser] Fast localStorage auth succeeded:', {
        username: localUser.username,
        name: localUser.name,
        email: localUser.email,
        hasPicture: !!localUser.picture,
        loadTime: `${loadTime}ms`,
        tokenExpiresIn: `${Math.round((localUser.tokenExp - Date.now() / 1000) / 3600)}h`
      })
      
      return localUser
    }
    
    // FALLBACK: Solo para casos especiales (OAuth en progreso, etc.)
    console.log('⚠️ [useUser] No localStorage data, checking if OAuth in progress...')
    
    // Detectar si estamos en medio de un OAuth flow
    const isOAuthFlow = window.location.pathname === '/chat' && 
                       (window.location.search.includes('code=') || 
                        window.location.hash.includes('access_token'))
    
    if (isOAuthFlow) {
      console.log('🔄 [useUser] OAuth flow detected, waiting for token storage...')
      // Esperar múltiples intentos para que Amplify guarde los tokens
      for (let attempt = 1; attempt <= 5; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 500 * attempt)) // 500ms, 1s, 1.5s, 2s, 2.5s
        
        const retryUser = extractUserFromLocalStorage()
        if (retryUser) {
          const loadTime = Math.round(performance.now() - startTime)
          console.log('✅ [useUser] OAuth flow completed successfully:', {
            username: retryUser.username,
            name: retryUser.name,
            email: retryUser.email,
            attempt,
            loadTime: `${loadTime}ms`
          })
          return retryUser
        }
        console.log(`⏳ [useUser] OAuth attempt ${attempt}/5, still waiting...`)
      }
    }
    
    // ÚLTIMO RECURSO: APIs de Amplify con timeout muy corto
    console.log('🔄 [useUser] Falling back to Amplify APIs (last resort)...')
    
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Amplify timeout')), 1000)
      })
      
      const user = await Promise.race([
        getCurrentUser(),
        timeoutPromise
      ]) as Awaited<ReturnType<typeof getCurrentUser>>
      
      const loadTime = Math.round(performance.now() - startTime)
      console.log('✅ [useUser] Amplify fallback succeeded:', {
        username: user?.username,
        loadTime: `${loadTime}ms`
      })
      
      return user
    } catch (amplifyError) {
      const loadTime = Math.round(performance.now() - startTime)
      console.error('❌ [useUser] All methods failed:', {
        error: amplifyError,
        loadTime: `${loadTime}ms`
      })
      throw new Error('User is not authenticated')
    }
    
  } catch (error) {
    const loadTime = Math.round(performance.now() - startTime)
    console.error('❌ [useUser] Authentication failed:', {
      error,
      loadTime: `${loadTime}ms`
    })
    throw error
  }
}

export default function useUser({ redirect = '' } = {}) {
  const { cache } = useSWRConfig()
  const { data: user, error, isValidating } = useSWR('user', fetcher, {
    errorRetryCount: 0, // No retries - el fetcher ya tiene fallbacks internos
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
