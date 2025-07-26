import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Amplify } from 'aws-amplify'
import '@aws-amplify/ui-react/styles.css'
import useEnv from '../lib/useEnv'

function MyApp({ Component, pageProps }: AppProps) {
  const { env } = useEnv()
  if (!env) return <>Loading...</>

  Amplify.configure({
    Auth: {
      region: 'us-east-1',
      userPoolId: env.cognitoUserPoolId,
      userPoolWebClientId: env.cognitoUserPoolWebClientId,
      oauth: {
        domain: env.cognitoDomain,
        scope: ['email', 'openid', 'profile'],
        redirectSignIn: typeof window !== 'undefined' ? window.location.origin + '/admin' : 'http://localhost:3000/admin',
        redirectSignOut: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
        responseType: 'code',
        options: {
          AdvancedSecurityDataCollectionFlag: false,
        },
      },
    },
  })

  return (
    <>
      <Head>
        <title>Agent Platform - Entrevistas con IA</title>
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
