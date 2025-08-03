# 🚀 Deployment Workflow

## Deployment Pipeline

### 1. Pre-deployment Checks
```bash
# Code quality checks
npm run lint
npm run type-check
npm test

# Build verification
npm run build

# Performance audit
npm run lighthouse

# Security scan
npm audit
```

### 2. Build Process
```bash
# Clean previous builds
rm -rf .next out

# Build configuration
npm run build:config

# Production build
npm run build

# Export static files
npm run export
```

### 3. Deployment Steps

#### Development Environment
- **Trigger**: Push to `develop` branch
- **Target**: Development S3 bucket
- **URL**: `https://dev-agent.cloud-it.com.ar`
- **Checks**: Basic functionality tests

#### Staging Environment
- **Trigger**: Push to `staging` branch
- **Target**: Staging S3 bucket
- **URL**: `https://staging-agent.cloud-it.com.ar`
- **Checks**: Full integration tests

#### Production Environment
- **Trigger**: Push to `main` branch
- **Target**: Production S3 bucket + CloudFront
- **URL**: `https://agent.cloud-it.com.ar`
- **Checks**: All quality gates must pass

### 4. Quality Gates

#### Performance Gates
- Lighthouse Performance Score > 90
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Bundle size < 500kb gzipped

#### Accessibility Gates
- Lighthouse Accessibility Score > 95
- WCAG 2.1 AA compliance
- Keyboard navigation functional
- Screen reader compatibility

#### Security Gates
- No high/critical vulnerabilities
- HTTPS enforced
- Secure headers configured
- Content Security Policy active

### 5. Post-deployment

#### Verification Steps
- [ ] Homepage loads correctly
- [ ] Authentication flow works
- [ ] Chat functionality operational
- [ ] Voice recording functional
- [ ] Mobile experience verified

#### Monitoring Setup
- [ ] Error tracking active (Sentry)
- [ ] Performance monitoring enabled
- [ ] User analytics configured
- [ ] Uptime monitoring active

#### Rollback Plan
```bash
# If issues detected, rollback to previous version
aws s3 sync s3://backup-bucket s3://production-bucket
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
```

### 6. Notification System

#### Success Notifications
- Slack channel: #deployments
- Email: team@company.com
- Dashboard: Update deployment status

#### Failure Notifications
- Immediate Slack alert
- Email to on-call engineer
- Automatic rollback if critical

### 7. Environment Variables

#### Required for all environments
```bash
NEXT_PUBLIC_N8N_WEBHOOK_URL
NEXT_PUBLIC_COGNITO_USER_POOL_ID
NEXT_PUBLIC_COGNITO_CLIENT_ID
NEXT_PUBLIC_COGNITO_DOMAIN
```

#### Production-specific
```bash
NEXT_PUBLIC_SENTRY_DSN
NEXT_PUBLIC_ANALYTICS_ID
NEXT_PUBLIC_ENVIRONMENT=production
```