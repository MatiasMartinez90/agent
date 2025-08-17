import { NextApiRequest, NextApiResponse } from 'next'

interface AuthConfig {
  userPoolId: string
  userPoolClientId: string
  cognitoDomain: string
}

// Type guard to ensure config completeness
function isValidAuthConfig(config: any): config is AuthConfig {
  return config && 
         typeof config.userPoolId === 'string' && config.userPoolId.length > 0 &&
         typeof config.userPoolClientId === 'string' && config.userPoolClientId.length > 0 &&
         typeof config.cognitoDomain === 'string' && config.cognitoDomain.length > 0
}

export default function handler(req: NextApiRequest, res: NextApiResponse<AuthConfig | { error: string }>) {
  try {
    // Variables de entorno PRIVADAS (sin NEXT_PUBLIC_)
    const config: AuthConfig = {
      userPoolId: process.env.AUTH_USER_POOL_ID || 'us-east-1_LXi5Bd95p',
      userPoolClientId: process.env.AUTH_WEB_CLIENT_ID || '7ho22jco9j63c3hmsrsp4bj0ti',
      cognitoDomain: process.env.COGNITO_DOMAIN || 'agent-auth-42h6i1bt.auth.us-east-1.amazoncognito.com'
    }

    // Validate configuration before sending
    if (!isValidAuthConfig(config)) {
      console.error('❌ [Auth Config] Invalid configuration detected')
      return res.status(500).json({ error: 'Invalid authentication configuration' })
    }

    // Headers de seguridad
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    
    // CORS restrictivo (solo mismo origen)
    const origin = req.headers.origin
    const allowedOrigins = [
      'https://agent.cloud-it.com.ar',
      'http://localhost:3000',
      'http://localhost:3001'
    ]
    
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    }

    console.log('🔐 [Auth Config] Serving secure config to:', req.headers['user-agent']?.substring(0, 50))
    
    res.status(200).json(config)
  } catch (error) {
    console.error('❌ [Auth Config] Error:', error)
    res.status(500).json({ error: 'Failed to load auth configuration' })
  }
}