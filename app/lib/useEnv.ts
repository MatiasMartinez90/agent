interface Env {
  cognitoUserPoolId: string
  cognitoUserPoolWebClientId: string
  cognitoDomain: string
}

export default function useEnv() {
  // Variables de entorno con fallbacks conocidos
  const env: Env = {
    cognitoUserPoolId: process.env.NEXT_PUBLIC_AUTH_USER_POOL_ID || 'us-east-1_LXi5Bd95p',
    cognitoUserPoolWebClientId: process.env.NEXT_PUBLIC_AUTH_WEB_CLIENT_ID || '7ho22jco9j63c3hmsrsp4bj0ti',
    cognitoDomain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'agent-auth-vz26twi7.auth.us-east-1.amazoncognito.com',
  }

  // Log para debugging - mostrar valores COMPLETOS si estamos en un entorno específico
  if (typeof window !== 'undefined') {
    console.log('🔧 [useEnv] FULL VALUES FOR DEBUGGING:')
    console.log('cognitoUserPoolId:', env.cognitoUserPoolId)
    console.log('cognitoUserPoolWebClientId:', env.cognitoUserPoolWebClientId)  
    console.log('cognitoDomain:', env.cognitoDomain)
    console.log('Environment vars available:', {
      hasUserPoolId: !!process.env.NEXT_PUBLIC_AUTH_USER_POOL_ID,
      hasClientId: !!process.env.NEXT_PUBLIC_AUTH_WEB_CLIENT_ID,
      hasDomain: !!process.env.NEXT_PUBLIC_COGNITO_DOMAIN
    })
  }

  return { 
    env: Object.freeze(env)
  }
}
