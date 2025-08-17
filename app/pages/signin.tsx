import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { signInWithRedirect, getCurrentUser } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'

// Hub listener outside of component to avoid useEffect issues
let hubUnsubscribe: (() => void) | null = null

const SignIn: NextPage = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Hub event handler function
  const handleHubEvent = ({ payload }: any) => {
    console.log('🔔 [SignIn] Hub auth event received:', {
      event: payload.event,
      data: payload.data,
      timestamp: new Date().toISOString()
    })
    
    switch (payload.event) {
      case "signInWithRedirect":
        console.log('✅ [SignIn] OAuth redirect successful, getting user...')
        getUser()
        break
      case "signInWithRedirect_failure":
        console.error('❌ [SignIn] OAuth redirect failed:', payload.data)
        setError("Error en el proceso de autenticación con Google")
        setLoading(false)
        break
      case "customOAuthState":
        console.log('🔔 [SignIn] Custom OAuth state:', payload.data)
        break
      case "signedIn":
        console.log('✅ [SignIn] User signed in via Hub event, getting user...')
        getUser()
        break
      default:
        console.log('🔔 [SignIn] Other auth event:', payload.event)
    }
  }

  // Setup Hub listener outside of useEffect to avoid v6 issues
  useEffect(() => {
    console.log('🔧 [SignIn] Setting up Hub listener for auth events...')
    console.log('🔍 [SignIn] Current URL on load:', window.location.href)
    
    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const error = urlParams.get('error')
    const errorDescription = urlParams.get('error_description')
    
    if (code || state || error) {
      console.log('🔔 [SignIn] OAuth callback detected:', {
        hasCode: !!code,
        hasState: !!state,
        hasError: !!error,
        error: error,
        errorDescription: errorDescription,
        fullURL: window.location.href
      })
    }
    
    // Clean up previous listener if exists
    if (hubUnsubscribe) {
      hubUnsubscribe()
    }
    
    // Set up new Hub listener
    hubUnsubscribe = Hub.listen("auth", handleHubEvent)
    console.log('🔍 [SignIn] Hub listener configured')
    
    // Check if user is already signed in
    getUser()
    
    // If we have OAuth callback parameters, try to process them
    if (code) {
      console.log('🔄 [SignIn] OAuth callback with code detected, processing...')
      console.log('🔄 [SignIn] Code present, state present:', !!state)
      
      // Force authentication check immediately and after delay
      setTimeout(() => {
        console.log('🔄 [SignIn] First timeout: checking user...')
        getUser()
      }, 1000)
      
      setTimeout(() => {
        console.log('🔄 [SignIn] Second timeout: checking user again...')
        getUser()
      }, 3000)
      
      setTimeout(() => {
        console.log('🔄 [SignIn] Third timeout: checking user final time...')
        getUser()
      }, 5000)
    }
    
    // Cleanup function
    return () => {
      if (hubUnsubscribe) {
        hubUnsubscribe()
        hubUnsubscribe = null
      }
    }
  }, [])

  const getUser = async () => {
    try {
      console.log('🔍 [SignIn] Checking current user...')
      console.log('🔍 [SignIn] Current URL during check:', window.location.href)
      
      const currentUser = await getCurrentUser()
      console.log('✅ [SignIn] User found:', {
        username: currentUser.username,
        userId: currentUser.userId,
        signInDetails: currentUser.signInDetails
      })
      
      // Check localStorage for tokens  
      const clientId = '2sfsss72kin03gbilraa1pvlb5'
      const cognitoKeys = Object.keys(localStorage).filter(key => key.includes('CognitoIdentityServiceProvider'))
      console.log('🔍 [SignIn] Cognito localStorage keys found:', cognitoKeys)
      
      setUser(currentUser)
      setLoading(false)
      
      // Redirect to admin after successful login
      setTimeout(() => {
        console.log('🚀 [SignIn] Redirecting to /admin...')
        window.location.href = '/admin'
      }, 1000)
      
    } catch (error) {
      console.log('👤 [SignIn] No user signed in:', {
        error: error.message,
        currentURL: window.location.href,
        hasCode: window.location.search.includes('code=')
      })
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      console.log('🔍 [SignIn] Starting Google OAuth with signInWithRedirect...')
      console.log('🔍 [SignIn] Current URL before OAuth:', window.location.href)
      console.log('🔍 [SignIn] Expected redirect URL:', 'http://localhost:3001/signin')
      
      // Test what URL signInWithRedirect will actually use
      console.log('🔍 [SignIn] About to call signInWithRedirect...')
      
      // Call the standard Amplify v6 signInWithRedirect
      const result = await signInWithRedirect({ provider: 'Google' })
      console.log('✅ [SignIn] signInWithRedirect result:', result)
      
    } catch (error) {
      console.error('❌ [SignIn] signInWithRedirect failed:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      })
      setError(`Error al iniciar sesión con Google: ${error.message}`)
    }
  }

  // Test direct OAuth URL to compare
  const handleDirectOAuthTest = () => {
    const directUrl = `https://agent-auth-2sc4m5q6.auth.us-east-1.amazoncognito.com/oauth2/authorize?identity_provider=Google&redirect_uri=${encodeURIComponent('http://localhost:3001/signin')}&response_type=code&client_id=2sfsss72kin03gbilraa1pvlb5&scope=email+openid+profile`
    console.log('🔗 [SignIn] Direct OAuth URL for comparison:', directUrl)
    console.log('🔗 [SignIn] Going to direct OAuth URL...')
    window.location.href = directUrl
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Show success message if user is authenticated
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Usuario autenticado. Redirigiendo...</p>
          <p className="text-xs text-gray-400 mt-2">Usuario: {user.username}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and title */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RRHH Agent
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Accede a tu Entrevista</h2>
            <p className="text-gray-600">Inicia sesión para comenzar tu proceso de selección</p>
            
            {/* Google Sign In Button - Standard Implementation */}
            <div className="mt-8">
              <button 
                onClick={handleGoogleSignIn}
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm font-medium"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>
            </div>

            {/* Error display */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {/* Debug section */}
            <div className="mt-6 p-4 bg-gray-100 rounded text-sm">
              <p className="text-gray-600 mb-2">Debug Info:</p>
              <p className="text-xs text-gray-500">
                URL: {typeof window !== 'undefined' ? window.location.href : 'server'}
              </p>
              <p className="text-xs text-gray-500">
                Loading: {loading ? 'true' : 'false'} | User: {user ? 'authenticated' : 'none'}
              </p>
              
              {/* Test direct OAuth */}
              <div className="mt-3">
                <button 
                  onClick={handleDirectOAuthTest}
                  className="px-3 py-1 bg-yellow-500 text-white rounded text-xs"
                >
                  Test Direct OAuth to /signin
                </button>
                <p className="text-xs text-gray-400 mt-1">
                  Compare: Does direct OAuth work vs signInWithRedirect?
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <h3 className="text-4xl font-bold mb-4">Tu Futuro Profesional</h3>
            <p className="text-xl opacity-90">Comienza tu proceso de selección con IA</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn