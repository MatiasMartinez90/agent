# 🚀 Agent Platform - Complete Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Repository Status
- [x] Repository created: https://github.com/MatiasMartinez90/agent
- [x] Code uploaded (without workflows initially)
- [x] Documentation complete

### ⚠️ Next Steps Required

1. **Upload GitHub Workflows** (needs workflow scope)
2. **Configure GitHub Secrets**
3. **Create Google OAuth Client**
4. **Run project setup**
5. **Deploy infrastructure**

---

## 🔐 GitHub Secrets Configuration

After creating Google OAuth client, configure these secrets in GitHub repository settings:

### Required Secrets
```bash
# AWS Credentials (same as template)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# Google OAuth (NEW CLIENT for agent.cloud-it.com.ar)
GOOGLE_CLIENT_ID=... (new client)
GOOGLE_CLIENT_SECRET=... (new client)
```

### Required Variables  
```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=... (same as template)

# Terraform Backend
TF_BACKEND_BUCKET=terraform-state-bucket-vz26twi7
PROJECT_NAME=agent
```

---

## 🌐 Google OAuth Client Setup

### Step 1: Create New OAuth Client
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"  
3. Click "Create Credentials" > "OAuth 2.0 Client ID"
4. Application type: "Web application"
5. Name: "Agent Platform"

### Step 2: Configure URLs
```bash
# Authorized JavaScript origins
https://agent.cloud-it.com.ar

# Authorized redirect URIs
https://agent.cloud-it.com.ar/api/auth/callback/google
```

### Step 3: Save Credentials
- Copy Client ID and Client Secret
- Add to GitHub repository secrets (see above)

---

## 🛠️ Project Configuration

### Configuration Values for `npm run setup`

```bash
# Project Information
PROJECT_NAME=agent
PROJECT_DISPLAY_NAME=Agent Platform
PROJECT_SUBTITLE=AGENT
BRAND_NAME=Agent
DOMAIN=agent.cloud-it.com.ar

# AWS Configuration (same as template)
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=[your-account-id]

# Google OAuth (NEW CLIENT)
GOOGLE_CLIENT_ID=[new-client-id] 
GOOGLE_CLIENT_SECRET=[new-client-secret]

# Database (shared RDS, new database)
DB_NAME_SUFFIX=agent
DB_HOST=[same-rds-endpoint]
DB_USER=[same-db-user]
DB_PASSWORD=[same-db-password]

# Email
FROM_EMAIL=noreply@cloud-it.com.ar

# Terraform Backend
TF_BACKEND_BUCKET=terraform-state-bucket-vz26twi7
TF_BACKEND_KEY_PREFIX=agent
```

---

## 🚀 Deployment Sequence

### Phase 1: Initial Setup (Local)
```bash
# 1. Clone repository
git clone https://github.com/MatiasMartinez90/agent.git
cd agent

# 2. Install dependencies
npm install

# 3. Run interactive setup
npm run setup
# Use configuration values above

# 4. Apply configuration
npm run config

# 5. Install app dependencies
npm run install-deps

# 6. Test local development
npm run dev
```

### Phase 2: Infrastructure Preparation
```bash
# 1. Initialize Terraform backend
./scripts/terraform-init.sh

# 2. Initialize database (creates 'agent' database)
npm run init-db agent

# 3. Build Lambda package
npm run build-lambda
```

### Phase 3: Workflows & Deployment
```bash
# 1. Add workflows back to repository
git add .github/
git commit -m "Add GitHub Actions workflows

🔄 Workflows included:
- terraform-backend.yml: Deploy Cognito + Lambda + RDS integration
- terraform-frontend.yml: Deploy S3 + CloudFront + ACM + Route53
- deploy-nextjs.yml: Build and deploy Next.js application
- Additional utility workflows

🔧 Configured for Agent Platform deployment
- Domain: agent.cloud-it.com.ar  
- Database: agent (new database in shared RDS)
- Google OAuth: New client for agent domain

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 2. Push to trigger deployments
git push origin main
```

### Phase 4: Monitor Deployment

1. **Backend Deployment** (~8-12 minutes):
   - Watch GitHub Actions: terraform-backend workflow
   - Creates Cognito User Pool
   - Deploys PostConfirmation Lambda
   - Configures RDS integration

2. **Frontend Deployment** (~15-25 minutes):
   - Watch GitHub Actions: terraform-frontend workflow  
   - Creates ACM certificate (longest step)
   - Sets up CloudFront distribution
   - Configures Route53 DNS

3. **Application Deployment** (~3-5 minutes):
   - Watch GitHub Actions: deploy-nextjs workflow
   - Builds Next.js application
   - Uploads to S3 bucket
   - Invalidates CloudFront cache

---

## 🔍 Verification Steps

### 1. DNS Resolution
```bash
# Should resolve to CloudFront distribution
nslookup agent.cloud-it.com.ar
```

### 2. SSL Certificate
```bash
# Should show valid certificate
curl -I https://agent.cloud-it.com.ar
```

### 3. Application Access
- Visit: https://agent.cloud-it.com.ar
- Should load with "Agent Platform" branding
- Click "Iniciar Sesión" → Google OAuth should work

### 4. Authentication Flow
- Login with Google account
- Should redirect to dashboard after login
- Check PostgreSQL: User should be saved to 'agent' database

### 5. Database Verification
```bash
# Connect to database and check
psql "postgresql://[user]:[password]@[host]:5432/agent"
\dt  # Should show: users, courses, categories, user_course_progress
SELECT * FROM users;  # Should show your user after login
```

---

## 🐛 Troubleshooting

### Workflow Permission Issues
**Error**: "refusing to allow an OAuth App to create or update workflow"
**Solution**: 
1. Use `gh auth refresh -s workflow -h github.com` 
2. Or add workflows manually through GitHub web interface

### Google OAuth Issues
**Error**: "redirect_uri_mismatch"
**Solution**: Verify URLs in Google Console exactly match:
- `https://agent.cloud-it.com.ar/api/auth/callback/google`

### Lambda Build Issues  
**Error**: "No module named 'psycopg2._psycopg'"
**Solution**: 
```bash
cd lambda && ./package.sh  # Uses Docker automatically
```

### Database Connection Issues
**Error**: "relation does not exist"
**Solution**:
```bash
npm run init-db agent  # Recreate database schema
```

### CloudFront Deployment Timeout
**Issue**: Frontend deployment takes 20+ minutes
**Solution**: Normal behavior - ACM certificate validation is slow

---

## 📊 Expected Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Local Setup | 5-10 min | Configuration and dependencies |
| Backend Deploy | 8-12 min | Cognito + Lambda + RDS |
| Frontend Deploy | 15-25 min | ACM + CloudFront + DNS |
| App Deploy | 3-5 min | Next.js build and upload |
| **Total** | **35-55 min** | Complete deployment |

---

## ✅ Success Criteria

Agent Platform deployment is complete when:

1. ✅ https://agent.cloud-it.com.ar loads with SSL
2. ✅ Shows "Agent Platform" branding throughout  
3. ✅ Google OAuth login works correctly
4. ✅ User redirected to dashboard after login
5. ✅ PostConfirmation Lambda saves user to database
6. ✅ No errors in CloudWatch logs
7. ✅ All GitHub Actions workflows completed successfully

---

## 🎯 Quick Start Commands

```bash
# Complete deployment sequence
git clone https://github.com/MatiasMartinez90/agent.git
cd agent
npm install
npm run setup  # Use Agent Platform configuration
npm run config
npm run install-deps
./scripts/terraform-init.sh
npm run init-db agent
npm run build-lambda
git add .
git commit -m "Agent Platform configured and ready for deployment"
git push origin main
```

After push, monitor GitHub Actions for deployment progress!

---

**🚀 The template system is proven to work. Follow this guide exactly and you will succeed!**