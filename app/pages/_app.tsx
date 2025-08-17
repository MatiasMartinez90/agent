import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Amplify } from 'aws-amplify'
import { Hub } from 'aws-amplify/utils'
import { ResourcesConfig } from 'aws-amplify'
import '@aws-amplify/ui-react/styles.css'
import useEnv from '../lib/useEnv'
import { useEffect } from 'react'
// Import signInWithRedirect globally to enable OAuth callback processing
import { signInWithRedirect } from 'aws-amplify/auth'

// Add global logging to verify OAuth listener setup
console.log('🌍 [Global] signInWithRedirect imported - OAuth listener should be active')

function MyApp({ Component, pageProps }: AppProps) {
  const { env } = useEnv()
  
  // Listen for auth events - MUST be before any conditional returns
  useEffect(() => {
    if (!env) return // Don't set up listener if no config
    
    const hubListenerCancel = Hub.listen('auth', (data) => {
      const { payload } = data
      console.log('🔔 [Hub] Auth event:', payload.event)

      switch (payload.event) {
        case 'signedIn':
        case 'signInWithRedirect':
          console.log('✅ [Hub] User signed in successfully')
          window.dispatchEvent(new CustomEvent('amplify-auth-success'))
          break
        case 'signInWithRedirect_failure':
          console.error('❌ [Hub] Sign in failed:', payload.data)
          break
        case 'tokenRefresh':
          console.log('🔄 [Hub] Token refreshed')
          break
      }
    })

    return () => hubListenerCancel()
  }, [env])
  
  // Solo continúa si tenemos la configuración
  if (!env) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#0F172A',
        color: 'white',
        fontFamily: 'system-ui'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⚙️</div>
          <div>Cargando configuración...</div>
        </div>
      </div>
    )
  }

  const amplifyConfig: ResourcesConfig = {
    Auth: {
      Cognito: {
        userPoolId: env.cognitoUserPoolId,
        userPoolClientId: env.cognitoUserPoolWebClientId,
        identityPoolId: undefined, // Not using identity pool
        loginWith: {
          oauth: {
            domain: env.cognitoDomain,
            scopes: ['email', 'openid', 'profile'],
            redirectSignIn: [
              'http://localhost:3001/signin'
            ],
            redirectSignOut: [
              'http://localhost:3001'
            ],
            responseType: 'code',
            providers: ['Google']
          }
        }
      }
    }
  }
  
  console.log('🔧 [Amplify] FULL Configuration details:', {
    userPoolId: env.cognitoUserPoolId,
    clientId: env.cognitoUserPoolWebClientId,
    domain: env.cognitoDomain,
    redirectSignIn: amplifyConfig.Auth?.Cognito?.loginWith?.oauth?.redirectSignIn,
    redirectSignOut: amplifyConfig.Auth?.Cognito?.loginWith?.oauth?.redirectSignOut,
    providers: amplifyConfig.Auth?.Cognito?.loginWith?.oauth?.providers,
    scopes: amplifyConfig.Auth?.Cognito?.loginWith?.oauth?.scopes
  })
  
  try {
    // Configure Amplify with SSR support for Next.js
    Amplify.configure(amplifyConfig, { ssr: true })
    console.log('✅ [Amplify] Configuration successful with SSR support')
  } catch (error) {
    console.error('❌ [Amplify] Configuration failed:', error)
  }



  return (
    <>
      <Head>
        <title>RRHH Agent</title>
        <meta name="description" content="Plataforma de entrevistas laborales con IA - Proceso de selección automatizado" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <meta name="theme-color" content="#3B82F6" />
      </Head>

      <Component {...pageProps} />
    </>
  )
}

export default MyApp
