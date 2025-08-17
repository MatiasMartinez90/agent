import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Amplify } from 'aws-amplify'
import { ResourcesConfig } from 'aws-amplify'
import '@aws-amplify/ui-react/styles.css'
import useEnv from '../lib/useEnv'

function MyApp({ Component, pageProps }: AppProps) {
  const { env } = useEnv()
  
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
        loginWith: {
          oauth: {
            domain: env.cognitoDomain,
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
  
  console.log('🔧 [Amplify] Configuration from env variables:', {
    userPoolId: env.cognitoUserPoolId?.substring(0, 15) + '...',
    clientId: env.cognitoUserPoolWebClientId?.substring(0, 10) + '...',  
    domain: env.cognitoDomain?.split('.')[0] + '...'
  })
  
  Amplify.configure(amplifyConfig)

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
