interface Env {
  cognitoUserPoolId: string
  cognitoUserPoolWebClientId: string
  cognitoDomain: string
}

export default function useEnv() {
  // SIEMPRE usar variables de entorno - no depender de /env.json
  // Las variables deben estar configuradas en GitHub Secrets
  const env: Env = {
    cognitoUserPoolId: process.env.NEXT_PUBLIC_AUTH_USER_POOL_ID || '',
    cognitoUserPoolWebClientId: process.env.NEXT_PUBLIC_AUTH_WEB_CLIENT_ID || '',
    cognitoDomain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || '',
  }

  // Validar que todas las variables estén presentes
  const isValid = env.cognitoUserPoolId && 
                  env.cognitoUserPoolWebClientId && 
                  env.cognitoDomain

  console.log('🔧 [useEnv] Environment variables:', {
    cognitoUserPoolId: env.cognitoUserPoolId ? `${env.cognitoUserPoolId.substring(0, 15)}...` : 'MISSING',
    cognitoUserPoolWebClientId: env.cognitoUserPoolWebClientId ? `${env.cognitoUserPoolWebClientId.substring(0, 10)}...` : 'MISSING',
    cognitoDomain: env.cognitoDomain ? `${env.cognitoDomain.split('.')[0]}...` : 'MISSING',
    isValid
  })

  return { 
    env: isValid ? Object.freeze(env) : null 
  }
}
