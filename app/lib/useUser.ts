import Router from 'next/router'
import { useRef, useEffect } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { getCurrentUser, signOut as amplifySignOut, fetchAuthSession } from 'aws-amplify/auth'

const extractUserFromLocalStorage = () => {
  if (typeof window === 'undefined') return null
  
  try {
    const clientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_WEB_CLIENT_ID || '2sfsss72kin03gbilraa1pvlb5'
    const lastAuthUser = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`)
    
    if (!lastAuthUser) {
      // Quick cleanup of old tokens
      const allKeys = Object.keys(localStorage).filter(key => key.includes('Cognito'))
      const obsoleteKeys = allKeys.filter(key => key.includes('2sfsss72kin03gbilraa1pvlb5'))
      obsoleteKeys.forEach(key => localStorage.removeItem(key))
      return null
    }
    
    const idTokenKey = `CognitoIdentityServiceProvider.${clientId}.${lastAuthUser}.idToken`
    const idToken = localStorage.getItem(idTokenKey)
    
    if (!idToken) return null
    
    // Parse ID token payload
    const payload = JSON.parse(atob(idToken.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    
    // Check if token is expired
    if (payload.exp < currentTime) {
      localStorage.removeItem(idTokenKey)
      localStorage.removeItem(`CognitoIdentityServiceProvider.${clientId}.${lastAuthUser}.accessToken`)
      localStorage.removeItem(`CognitoIdentityServiceProvider.${clientId}.${lastAuthUser}.userData`)
      localStorage.removeItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`)
      return null
    }
    
    // Create user object with Google OAuth data prioritized
    const user = {
      username: payload.username || payload.sub,
      userId: payload.sub,
      signInDetails: {
        loginId: payload.email || payload.username || payload.sub
      },
      email: payload.email,
      name: payload.name || payload.given_name || (payload.given_name && payload.family_name ? `${payload.given_name} ${payload.family_name}` : payload.email?.split('@')[0]),
      picture: payload.picture,
      // Google OAuth specific data
      google_name: payload.name,
      google_picture: payload.picture,
      google_email: payload.email,
      givenName: payload.given_name,
      familyName: payload.family_name,
      tokenExp: payload.exp,
      tokenIat: payload.iat
    }
    
    return user
  } catch (error) {
    console.error('Error extracting user from localStorage:', error)
    return null
  }
}

const fetcher = async () => {
  const startTime = performance.now()
  console.log('🔍 [fetcher] Starting authentication check...', {
    currentURL: typeof window !== 'undefined' ? window.location.href : 'server',
    timestamp: new Date().toISOString()
  })
  
  try {
    // Try localStorage first
    const localUser = extractUserFromLocalStorage()
    if (localUser) {
      console.log('✅ [fetcher] Found user in localStorage:', localUser.email)
      return localUser
    }
    
    // Try Amplify getCurrentUser
    const user = await getCurrentUser()
    console.log('✅ [fetcher] getCurrentUser successful:', {
      username: user.username,
      userId: user.userId
    })
    
    // Try to get session with tokens
    console.log('🔍 [fetcher] Getting auth session...')
    try {
      const session = await fetchAuthSession()
      console.log('✅ [fetcher] Got session:', {
        hasTokens: !!session.tokens,
        hasIdToken: !!session.tokens?.idToken,
        hasAccessToken: !!session.tokens?.accessToken
      })
      
      const idToken = session.tokens?.idToken
      
      if (idToken) {
        console.log('🔍 [fetcher] Parsing ID token...')
        const payload = JSON.parse(atob(idToken.toString().split('.')[1]))
        const enrichedUser = {
          ...user,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          google_name: payload.name,
          google_picture: payload.picture,
          google_email: payload.email,
          signInDetails: {
            loginId: payload.email || user.username
          }
        }
        
        console.log('✅ [fetcher] User enriched with token data:', {
          email: enrichedUser.email,
          name: enrichedUser.name,
          hasPicture: !!enrichedUser.picture
        })
        
        return enrichedUser
      }
    } catch (sessionError) {
      console.log('⚠️ [fetcher] Could not get session, using basic user:', sessionError)
    }
    
    const loadTime = Math.round(performance.now() - startTime)
    console.log('✅ [fetcher] Returning basic user data:', {
      username: user.username,
      loadTime: `${loadTime}ms`
    })
    return user
    
  } catch (error) {
    const loadTime = Math.round(performance.now() - startTime)
    console.log('❌ [fetcher] Authentication failed:', {
      error: error instanceof Error ? error.message : String(error),
      loadTime: `${loadTime}ms`
    })
    throw new Error('User is not authenticated')
  }
}

export default function useUser({ redirect = '' } = {}) {
  const { cache } = useSWRConfig()
  const { data: user, error, isValidating, mutate } = useSWR('user', fetcher, {
    errorRetryCount: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true,
    dedupingInterval: 30000, // 30 seconds caching
    refreshInterval: 0,
    shouldRetryOnError: false,
    refreshWhenHidden: false,
    refreshWhenOffline: false
  })
  
  // Listen for auth success events
  useEffect(() => {
    const handleAuthSuccess = () => {
      console.log('🔔 [useUser] Auth success event received, revalidating...')
      mutate() // Force revalidation
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('amplify-auth-success', handleAuthSuccess)
      return () => {
        window.removeEventListener('amplify-auth-success', handleAuthSuccess)
      }
    }
  }, [mutate])
  const hasRedirected = useRef(false)

  const loading = !user && !error
  const loggedOut = error && error.message === 'User is not authenticated'

  // Simple debug logging
  if (user) {
    console.log('👤 [useUser] Authenticated:', (user as any).email || user.username)
  } else if (loggedOut) {
    console.log('👤 [useUser] Not authenticated')
  }

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (loggedOut && redirect && !hasRedirected.current) {
      console.log('🚪 [useUser] Redirecting unauthenticated user:', {
        from: typeof window !== 'undefined' ? window.location.pathname : 'server',
        to: redirect
      })
      hasRedirected.current = true
      setTimeout(() => {
        Router.push({ pathname: redirect, query: { redirect: Router.asPath } })
      }, 100)
    }
  }, [loggedOut, redirect])

  // Reset redirect flag when user authenticates
  useEffect(() => {
    if (user && hasRedirected.current) {
      hasRedirected.current = false
    }
  }, [user])

  const signOut = async ({ redirect = '/' }) => {
    try {
      console.log('🚪 [useUser] Starting signOut process...')
      
      // Clear SWR cache first
      cache.delete('user')
      
      // Call Amplify signOut with proper parameters for OAuth
      await amplifySignOut({ global: true })
      console.log('✅ [useUser] Amplify signOut successful')
      
      // Redirect after successful signout
      await Router.push(redirect)
      
    } catch (error) {
      console.error('❌ [useUser] SignOut error:', error)
      
      // If signOut fails, still try to redirect
      await Router.push(redirect)
    }
  }

  return { 
    loading, 
    loggedOut, 
    user, 
    signOut,
    isAuthenticating: isValidating && !user
  }
}
