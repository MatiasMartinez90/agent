# 🔐 Security Configuration Guide

## Overview
This application implements a **secure authentication configuration system** that protects sensitive AWS Cognito credentials from client-side exposure.

## Security Architecture

### 🛡️ **Secure Configuration Flow**
```
1. Client requests `/api/auth-config` (server-side endpoint)
2. Server reads PRIVATE environment variables (no NEXT_PUBLIC_ prefix)
3. Server returns configuration with security headers
4. Client configures Amplify with secure config
5. Fallback to public variables if endpoint fails
```

### 🔒 **Environment Variables Security**

#### **PRIVATE Variables (Server-only)**
```bash
# ✅ SECURE - Only available on server
AUTH_USER_POOL_ID=us-east-1_LXi5Bd95p
AUTH_WEB_CLIENT_ID=7ho22jco9j63c3hmsrsp4bj0ti  
COGNITO_DOMAIN=agent-auth-42h6i1bt.auth.us-east-1.amazoncognito.com
```

#### **PUBLIC Variables (Fallback)**
```bash
# ⚠️ EXPOSED - Visible in client browser
NEXT_PUBLIC_AUTH_USER_POOL_ID=us-east-1_LXi5Bd95p
NEXT_PUBLIC_AUTH_WEB_CLIENT_ID=7ho22jco9j63c3hmsrsp4bj0ti
NEXT_PUBLIC_COGNITO_DOMAIN=agent-auth-42h6i1bt.auth.us-east-1.amazoncognito.com
```

## Security Features

### 🔐 **API Endpoint Protection**
- **Cache Prevention**: `Cache-Control: private, no-cache, no-store`
- **CORS Restriction**: Only allowed origins can access
- **Request Logging**: Monitored access attempts
- **Error Handling**: No sensitive data in error responses

### 🛡️ **Client-Side Protection**
- **Secure Loading**: Configuration fetched via HTTPS
- **Fallback Strategy**: Graceful degradation if endpoint fails
- **Runtime Configuration**: No hardcoded secrets in build
- **Debug Logging**: Partial credentials only (first 10 chars)

## Risk Assessment

### ✅ **SAFE TO EXPOSE**
- **User Pool ID**: Public by AWS design
- **Client ID**: OAuth public client (no secret)
- **Cognito Domain**: Public OAuth endpoint

### ⚠️ **MINIMIZE EXPOSURE**
- **Hardcoded Fallbacks**: Remove from production builds
- **Debug Logs**: Limit in production environment
- **CORS Origins**: Restrict to known domains

## Implementation Guide

### 1. **Environment Setup**
```bash
# In your deployment environment (Vercel, AWS, etc.)
# Set PRIVATE variables (no NEXT_PUBLIC_ prefix)
AUTH_USER_POOL_ID=your_pool_id
AUTH_WEB_CLIENT_ID=your_client_id
COGNITO_DOMAIN=your_domain

# Keep PUBLIC variables as backup
NEXT_PUBLIC_AUTH_USER_POOL_ID=your_pool_id
NEXT_PUBLIC_AUTH_WEB_CLIENT_ID=your_client_id
NEXT_PUBLIC_COGNITO_DOMAIN=your_domain
```

### 2. **Security Headers**
The `/api/auth-config` endpoint includes:
```typescript
res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate')
res.setHeader('Pragma', 'no-cache')
res.setHeader('Expires', '0')
```

### 3. **CORS Configuration**
```typescript
const allowedOrigins = [
  'https://agent.cloud-it.com.ar',
  'http://localhost:3000',
  'http://localhost:3001'
]
```

## Advanced Security Options

### Option 1: **AWS Parameter Store**
```typescript
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm"

const getSecureConfig = async () => {
  const client = new SSMClient({ region: 'us-east-1' })
  const params = await client.send(new GetParameterCommand({
    Name: '/app/cognito-config',
    WithDecryption: true
  }))
  return JSON.parse(params.Parameter.Value)
}
```

### Option 2: **Runtime Environment Variables**
```javascript
// next.config.js
module.exports = {
  env: {
    COGNITO_CONFIG: JSON.stringify({
      userPoolId: process.env.AUTH_USER_POOL_ID,
      userPoolClientId: process.env.AUTH_WEB_CLIENT_ID,
      cognitoDomain: process.env.COGNITO_DOMAIN
    })
  }
}
```

### Option 3: **Request Authentication**
```typescript
// Add API key or JWT validation to /api/auth-config
const apiKey = req.headers['x-api-key']
if (apiKey !== process.env.INTERNAL_API_KEY) {
  return res.status(401).json({ error: 'Unauthorized' })
}
```

## Security Monitoring

### **Client-Side Checks**
```javascript
// Check if credentials are exposed in window object
console.log('Exposed configs:', Object.keys(window).filter(k => k.includes('cognito')))

// Verify source of configuration
if (process.env.NODE_ENV === 'production') {
  console.log('Config source: /api/auth-config endpoint')
}
```

### **Server-Side Logging**
```typescript
// Log access attempts
console.log('🔐 [Auth Config] Request from:', {
  ip: req.connection.remoteAddress,
  userAgent: req.headers['user-agent'],
  origin: req.headers.origin
})
```

## Best Practices

1. **✅ Use Private Variables**: Always prefer server-side config endpoint
2. **✅ Limit CORS Origins**: Only allow known domains  
3. **✅ No Cache Headers**: Prevent credential caching
4. **✅ Monitor Access**: Log configuration requests
5. **✅ Rotate Credentials**: If Client ID changes, update both sets
6. **❌ Avoid Hardcoding**: Remove fallback values in production
7. **❌ No Sensitive Logs**: Never log full credentials
8. **❌ No Public Secrets**: Never commit real credentials to git

## Migration Path

1. **Phase 1** (Current): Secure endpoint with public fallback
2. **Phase 2**: Remove public variables in production
3. **Phase 3**: Add API key authentication
4. **Phase 4**: Migrate to AWS Parameter Store

This architecture provides **defense in depth** while maintaining compatibility and reliability.