import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { Amplify } from 'aws-amplify'
import { ResourcesConfig } from 'aws-amplify'
import '@aws-amplify/ui-react/styles.css'

function MyApp({ Component, pageProps }: AppProps) {
  const [amplifyConfigured, setAmplifyConfigured] = useState(false)
  
  useEffect(() => {
    // CONFIGURACIÓN SEGURA: Fetch desde endpoint privado
    const configureAmplify = async () => {
      try {
        console.log('🔐 [Security] Loading auth config from secure endpoint...')
        
        const response = await fetch('/api/auth-config', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        if (!response.ok) {
          throw new Error(`Config fetch failed: ${response.status}`)
        }
        
        const config = await response.json()
        
        const amplifyConfig: ResourcesConfig = {
          Auth: {
            Cognito: {
              userPoolId: config.userPoolId,
              userPoolClientId: config.userPoolClientId,
              loginWith: {
                oauth: {
                  domain: config.cognitoDomain,
                  scopes: ['email', 'openid', 'profile'],
                  redirectSignIn: [
                    typeof window !== 'undefined' ? window.location.origin + '/chat' : 'http://localhost:3000/chat'
                  ],
                  redirectSignOut: [
                    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
                  ],
                  responseType: 'code',
                  providers: ['Google']
                }
              }
            }
          }
        }
        
        console.log('✅ [Security] Secure config loaded:', {
          userPoolId: config.userPoolId.substring(0, 15) + '...',
          userPoolClientId: config.userPoolClientId.substring(0, 10) + '...',
          domain: config.cognitoDomain.split('.')[0] + '...'
        })
        
        Amplify.configure(amplifyConfig)
        setAmplifyConfigured(true)
        
      } catch (error) {
        console.error('❌ [Security] Failed to load secure config, falling back:', error)
        
        // FALLBACK: Variables públicas como último recurso
        const fallbackConfig: ResourcesConfig = {
          Auth: {
            Cognito: {
              userPoolId: process.env.NEXT_PUBLIC_AUTH_USER_POOL_ID || 'us-east-1_LXi5Bd95p',
              userPoolClientId: process.env.NEXT_PUBLIC_AUTH_WEB_CLIENT_ID || '7ho22jco9j63c3hmsrsp4bj0ti',
              loginWith: {
                oauth: {
                  domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'agent-auth-42h6i1bt.auth.us-east-1.amazoncognito.com',
                  scopes: ['email', 'openid', 'profile'],
                  redirectSignIn: [
                    typeof window !== 'undefined' ? window.location.origin + '/chat' : 'http://localhost:3000/chat'
                  ],
                  redirectSignOut: [
                    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
                  ],
                  responseType: 'code',
                  providers: ['Google']
                }
              }
            }
          }
        }
        
        console.log('⚠️ [Security] Using fallback configuration')
        Amplify.configure(fallbackConfig)
        setAmplifyConfigured(true)
      }
    }
    
    configureAmplify()
  }, [])
  
  if (!amplifyConfigured) {
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
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔐</div>
          <div>Configurando autenticación segura...</div>
        </div>
      </div>
    )
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
