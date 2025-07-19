# Agent Platform - Context for Claude Code

## 🎯 Project Overview

This is the **Agent Platform** - a production AWS application built from a proven template. The template has been successfully tested and deployed. Your task is to deploy this specific instance.

## 📋 Immediate Next Steps

1. **Run setup**: `npm run setup` with Agent Platform configuration
2. **Create Google OAuth client** for agent.cloud-it.com.ar  
3. **Deploy infrastructure** using GitHub Actions
4. **Verify authentication and database integration**

## 🏗️ Architecture

### Frontend
- **Next.js 13+** with TypeScript and Tailwind CSS v4
- **AWS Cognito** + Google OAuth authentication
- **Responsive design** with parameterizable branding

### Backend  
- **PostConfirmation Lambda** for user registration
- **PostgreSQL RDS** (shared with template project)
- **Terraform Infrastructure as Code**

### AWS Services
- S3 + CloudFront (frontend hosting)
- Cognito User Pool (authentication)
- Lambda (PostConfirmation trigger)
- RDS PostgreSQL (data persistence)
- ACM + Route53 (SSL + DNS)

## 🔧 Configuration Values

When running `npm run setup`, use:

```bash
PROJECT_NAME=agent
PROJECT_DISPLAY_NAME=Agent Platform  
PROJECT_SUBTITLE=AGENT
BRAND_NAME=Agent
DOMAIN=agent.cloud-it.com.ar

# AWS (same as template)
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=[same]

# Database (shared RDS, new database)
DB_NAME_SUFFIX=agent  
DB_HOST=[same RDS endpoint]
DB_USER=[same]
DB_PASSWORD=[same]

# Terraform
TF_BACKEND_BUCKET=[same bucket]
TF_BACKEND_KEY_PREFIX=agent
```

## 🔐 Google OAuth Setup (NEW CLIENT)

**CRITICAL**: You need a NEW Google OAuth client (not shared with template)

1. **Create OAuth Client**:
   - Go to Google Cloud Console
   - Create OAuth 2.0 Client ID  
   - Name: "Agent Platform"

2. **Configure URLs**:
   - Origin: `https://agent.cloud-it.com.ar`
   - Redirect: `https://agent.cloud-it.com.ar/api/auth/callback/google`

3. **GitHub Secrets**:
   - `GOOGLE_CLIENT_ID=[new client ID]`
   - `GOOGLE_CLIENT_SECRET=[new client secret]`

## 🚀 Deployment Process

### Phase 1: Setup
```bash
npm install
npm run setup          # Use configuration above
npm run install-deps
npm run dev            # Test locally
```

### Phase 2: Infrastructure
```bash
./scripts/terraform-init.sh
npm run init-db agent
npm run build-lambda
```

### Phase 3: Deploy
```bash
git add .
git commit -m "Initial Agent Platform setup"
git push origin main
```

**GitHub Actions will handle deployment automatically**

## 🛠️ PostConfirmation Lambda System

### What It Does
- Triggers when user completes Google OAuth
- Creates user profile in PostgreSQL  
- Handles UPSERT logic (update if exists)
- Compiled with Docker for Linux compatibility

### Key Files
- `lambda/postConfirmation.py` - Main function
- `lambda/package.sh` - Docker build script
- `lambda/database_schema_complete.sql` - Database schema
- `scripts/init-database.sh` - DB initialization

## ⚠️ Critical Lessons Learned

### 1. psycopg2 Architecture Issue
**Problem**: Mac ARM packages don't work on AWS Lambda
**Solution**: Docker build with AWS Lambda image
```bash
cd lambda && ./package.sh  # Auto-detects Docker
```

### 2. Database Schema
**Problem**: Missing columns caused failures
**Solution**: Complete schema in `database_schema_complete.sql`

### 3. GitHub Actions
**Problem**: CI/CD couldn't build psycopg2
**Solution**: Docker Buildx in workflows (already configured)

## 📁 Key Commands

```bash
# Setup
npm run setup
npm run config
npm run install-deps

# Database  
npm run init-db agent

# Lambda
npm run build-lambda

# Terraform
npm run terraform-plan
npm run terraform-apply

# Development
npm run dev
```

## 🔍 Verification Checklist

### ✅ Setup Complete
- [ ] `npm run setup` executed
- [ ] `.env` file created
- [ ] Google OAuth client created
- [ ] GitHub secrets configured

### ✅ Deployment Success
- [ ] Backend workflow completed
- [ ] Frontend workflow completed  
- [ ] https://agent.cloud-it.com.ar resolves
- [ ] SSL certificate active

### ✅ Functionality Works
- [ ] Google OAuth login works
- [ ] User redirected to dashboard
- [ ] PostConfirmation Lambda saves user
- [ ] Database contains user record

## 🐛 Troubleshooting

### "No module named 'psycopg2._psycopg'"
```bash
cd lambda && ./package.sh
```

### "column does not exist"
```bash
npm run init-db agent
```

### Authentication not working
- Verify Google OAuth callback URLs
- Check GitHub secrets configuration

### CloudFront timeout
- Wait for ACM certificate validation (20+ minutes)

## 📊 Expected Timeline

- **Setup**: 5-10 minutes
- **Backend Deploy**: 8-12 minutes  
- **Frontend Deploy**: 15-25 minutes (ACM validation)
- **Testing**: 5 minutes

**Total: 35-55 minutes**

## ✅ Success Criteria

Agent Platform is successful when:
1. https://agent.cloud-it.com.ar loads with SSL
2. Google OAuth login works  
3. User redirected to dashboard
4. PostConfirmation saves user to database
5. No errors in CloudWatch logs

## 🎯 Start Here

1. Verify you're in the agent repository
2. Run `npm run setup` with Agent Platform config
3. Follow deployment phases exactly
4. This template is proven to work - follow the process!

---

**Additional Context**: See `CLAUDE_AGENT.md` for complete historical context and troubleshooting details.