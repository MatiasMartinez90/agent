import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Amplify } from 'aws-amplify'
import { ResourcesConfig } from 'aws-amplify'
import '@aws-amplify/ui-react/styles.css'
import useEnv from '../lib/useEnv'

function MyApp({ Component, pageProps }: AppProps) {
  const { env } = useEnv()
  if (!env) return <>Loading...</>

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
