import Router from 'next/router'
import { useRef, useEffect } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { getCurrentUser, signOut as amplifySignOut, fetchAuthSession } from 'aws-amplify/auth'

const extractUserFromLocalStorage = () => {
  console.log('🔍 [DEBUG] extractUserFromLocalStorage called')
  
  if (typeof window === 'undefined') {
    console.log('❌ [DEBUG] Not in browser environment')
    return null
  }
  
  try {
    // CORRECCIÓN CRÍTICA: Usar el clientId correcto para producción
    const clientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_WEB_CLIENT_ID || '7ho22jco9j63c3hmsrsp4bj0ti'
    console.log('🔍 [DEBUG] Using clientId:', clientId)
    console.log('🔍 [DEBUG] Environment NODE_ENV:', process.env.NODE_ENV)
    
    const lastAuthUser = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`)
    console.log('🔍 [DEBUG] lastAuthUser:', lastAuthUser)
    
    if (!lastAuthUser) {
      console.log('❌ [DEBUG] No lastAuthUser found')
      // Log all Cognito keys to see what's actually there
      const allKeys = Object.keys(localStorage).filter(key => key.includes('Cognito'))
      console.log('🔍 [DEBUG] All Cognito keys in localStorage:', allKeys)
      return null
    }
    
    const idTokenKey = `CognitoIdentityServiceProvider.${clientId}.${lastAuthUser}.idToken`
    const accessTokenKey = `CognitoIdentityServiceProvider.${clientId}.${lastAuthUser}.accessToken`
    const userDataKey = `CognitoIdentityServiceProvider.${clientId}.${lastAuthUser}.userData`
    
    console.log('🔍 [DEBUG] Looking for keys:', {
      idTokenKey,
      accessTokenKey,
      userDataKey
    })
    
    const idToken = localStorage.getItem(idTokenKey)
    const accessToken = localStorage.getItem(accessTokenKey)
    const userData = localStorage.getItem(userDataKey)
    
    console.log('🔍 [DEBUG] Token status:', {
      hasIdToken: !!idToken,
      hasAccessToken: !!accessToken,
      hasUserData: !!userData,
      idTokenLength: idToken?.length,
      accessTokenLength: accessToken?.length,
      userDataLength: userData?.length
    })
    
    if (!idToken) {
      console.log('❌ [DEBUG] No idToken found')
      return null
    }
    
    // Parse ID token payload
    console.log('🔍 [DEBUG] Parsing ID token...')
    const payload = JSON.parse(atob(idToken.split('.')[1]))
    console.log('🔍 [DEBUG] Raw token payload:', payload)
    
    const currentTime = Math.floor(Date.now() / 1000)
    const timeUntilExp = payload.exp - currentTime
    
    console.log('🔍 [DEBUG] Token timing:', {
      currentTime,
      tokenExp: payload.exp,
      timeUntilExpiry: timeUntilExp,
      isExpired: timeUntilExp <= 0
    })
    
    // Check if token is expired
    if (payload.exp < currentTime) {
      console.log('⚠️ [DEBUG] Token expired, clearing localStorage')
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
        console.log('🔍 [DEBUG] Parsed userData:', parsedUserData)
      }
    } catch (e) {
      console.log('⚠️ [DEBUG] Failed to parse userData:', e)
    }
    
    // Crear objeto de usuario completo con todos los datos disponibles
    const user = {
      username: payload.username || payload.sub,
      userId: payload.sub,
      signInDetails: {
        loginId: payload.email || payload.username || payload.sub
      },
      // Datos del ID token con prioridad en Google OAuth attributes
      email: payload.email,
      name: payload.name || payload.given_name || (payload.given_name && payload.family_name ? `${payload.given_name} ${payload.family_name}` : payload.email?.split('@')[0]),
      picture: payload.picture,
      // Datos específicos de Google OAuth
      google_name: payload.name,
      google_picture: payload.picture,
      google_email: payload.email,
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
    
    console.log('✅ [DEBUG] Final user object:', {
      username: user.username,
      email: user.email,
      name: user.name,
      picture: user.picture,
      hasSignInDetails: !!user.signInDetails,
      allKeys: Object.keys(user)
    })
    
    return user
  } catch (error) {
    console.error('❌ [DEBUG] Error extracting from localStorage:', error)
    console.error('❌ [DEBUG] Error stack:', error.stack)
    return null
  }
}

const fetcher = async () => {
  const startTime = performance.now()
  
  try {
    console.log('⚡ [DEBUG] Starting authentication check at', new Date().toISOString())
    console.log('🔍 [DEBUG] Current URL:', window.location.href)
    console.log('🔍 [DEBUG] Current pathname:', window.location.pathname)
    console.log('🔍 [DEBUG] Current search:', window.location.search)
    
    // MÉTODO PRINCIPAL: Extracción directa de localStorage (0-10ms)
    console.log('🔍 [DEBUG] Calling extractUserFromLocalStorage...')
    const localUser = extractUserFromLocalStorage()
    console.log('🔍 [DEBUG] extractUserFromLocalStorage returned:', !!localUser)
    
    if (localUser) {
      const loadTime = Math.round(performance.now() - startTime)
      console.log('✅ [DEBUG] Fast localStorage auth succeeded:', {
        username: localUser.username,
        name: localUser.name,
        email: localUser.email,
        hasPicture: !!localUser.picture,
        google_name: localUser.google_name,
        google_email: localUser.google_email,
        google_picture: localUser.google_picture,
        loadTime: `${loadTime}ms`,
        tokenExpiresIn: `${Math.round((localUser.tokenExp - Date.now() / 1000) / 3600)}h`,
        allUserKeys: Object.keys(localUser)
      })
      
      return localUser
    }
    
    // FALLBACK: Solo para casos especiales (OAuth en progreso, etc.)
    console.log('⚠️ [DEBUG] No localStorage data, checking if OAuth in progress...')
    
    // Detectar si estamos en medio de un OAuth flow
    const isOAuthFlow = window.location.pathname === '/chat' && 
                       (window.location.search.includes('code=') || 
                        window.location.hash.includes('access_token') ||
                        window.location.hash.includes('id_token'))
    
    console.log('🔍 [DEBUG] OAuth flow detection:', {
      isInChatPath: window.location.pathname === '/chat',
      hasCodeParam: window.location.search.includes('code='),
      hasAccessTokenHash: window.location.hash.includes('access_token'),
      isOAuthFlow
    })
    
    if (isOAuthFlow) {
      console.log('🔄 [DEBUG] OAuth flow detected, waiting for token storage...')
      // Esperar múltiples intentos para que Amplify guarde los tokens
      for (let attempt = 1; attempt <= 8; attempt++) {
        const waitTime = attempt <= 3 ? 200 * attempt : 1000 // Primeros 3 intentos rápidos, luego 1s
        console.log(`⏳ [DEBUG] OAuth attempt ${attempt}/8, waiting ${waitTime}ms...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        
        console.log(`🔍 [DEBUG] OAuth retry ${attempt}: calling extractUserFromLocalStorage...`)
        const retryUser = extractUserFromLocalStorage()
        
        if (retryUser) {
          const loadTime = Math.round(performance.now() - startTime)
          console.log('✅ [DEBUG] OAuth flow completed successfully:', {
            username: retryUser.username,
            name: retryUser.name,
            email: retryUser.email,
            google_name: retryUser.google_name,
            google_email: retryUser.google_email,
            google_picture: retryUser.google_picture,
            attempt,
            loadTime: `${loadTime}ms`
          })
          return retryUser
        }
        console.log(`❌ [DEBUG] OAuth attempt ${attempt}/8 failed, retryUser was:`, !!retryUser)
      }
      console.log('❌ [DEBUG] All OAuth attempts failed')
    }
    
    // ÚLTIMO RECURSO: APIs de Amplify con timeout muy corto
    console.log('🔄 [DEBUG] Falling back to Amplify APIs (last resort)...')
    
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.log('❌ [DEBUG] Amplify getCurrentUser timeout after 1000ms')
          reject(new Error('Amplify timeout'))
        }, 1000)
      })
      
      console.log('🔍 [DEBUG] Calling getCurrentUser with 1s timeout...')
      const user = await Promise.race([
        getCurrentUser(),
        timeoutPromise
      ]) as Awaited<ReturnType<typeof getCurrentUser>>
      
      const loadTime = Math.round(performance.now() - startTime)
      console.log('✅ [DEBUG] Amplify fallback succeeded:', {
        username: user?.username,
        hasUser: !!user,
        loadTime: `${loadTime}ms`
      })
      
      return user
    } catch (amplifyError) {
      const loadTime = Math.round(performance.now() - startTime)
      console.error('❌ [DEBUG] Amplify fallback failed:', {
        error: amplifyError,
        errorMessage: amplifyError instanceof Error ? amplifyError.message : String(amplifyError),
        loadTime: `${loadTime}ms`
      })
      throw new Error('User is not authenticated')
    }
    
  } catch (error) {
    const loadTime = Math.round(performance.now() - startTime)
    console.error('❌ [DEBUG] Authentication failed:', {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
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
    revalidateOnReconnect: false, // Disable automatic reconnect revalidation
    revalidateOnMount: true,
    dedupingInterval: 10000, // Aumentar deduping interval
    focusThrottleInterval: 30000, // Throttle focus revalidation
    refreshInterval: 0, // No polling
    shouldRetryOnError: false, // No retry on error
    refreshWhenHidden: false, // Don't refresh when tab is hidden
    refreshWhenOffline: false // Don't refresh when offline
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
