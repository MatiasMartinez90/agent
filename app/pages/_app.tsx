import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Amplify } from 'aws-amplify'
import { ResourcesConfig } from 'aws-amplify'
import '@aws-amplify/ui-react/styles.css'

function MyApp({ Component, pageProps }: AppProps) {
  // REVERT: Configuración directa simple que funcionaba
  const amplifyConfig: ResourcesConfig = {
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
  
  console.log('🔧 [Amplify] Configuration loaded successfully')
  
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
