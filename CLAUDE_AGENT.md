# 🚀 Agent Platform - Complete Context for Claude Code

## 🎯 IMMEDIATE MISSION

You are starting with a **COMPLETE, TESTED, PRODUCTION-READY** template that has been successfully deployed. Your task is to deploy the **Agent Platform** using this proven template system.

### 📋 What You Need to Do

1. **Configure the project**: Run `npm run setup` and configure for "Agent Platform"
2. **Set up Google OAuth**: Create new OAuth client for agent.cloud-it.com.ar
3. **Deploy infrastructure**: Follow the exact same process that worked for the template
4. **Verify everything works**: Test authentication and database integration

---

## 🏗️ PROJECT ARCHITECTURE OVERVIEW

This is a **sophisticated AWS application template** with:

### Frontend Stack
- **Next.js 13+** with TypeScript and Tailwind CSS v4
- **AWS Cognito** authentication with Google OAuth integration
- **Responsive design** with desktop sidebar/mobile dropdown
- **Parameterizable branding** system

### Backend Stack  
- **AWS Lambda** PostConfirmation trigger
- **PostgreSQL RDS** shared database
- **Terraform Infrastructure as Code**
- **GitHub Actions CI/CD**

### Key AWS Services
- **S3 + CloudFront** for frontend hosting
- **Cognito User Pool** for authentication
- **Lambda** for PostConfirmation user registration
- **RDS PostgreSQL** for data persistence
- **ACM** for SSL certificates
- **Route53** for DNS management

---

## 🎯 CONFIGURATION FOR AGENT PLATFORM

When you run `npm run setup`, use these exact values:

```bash
# Project Information  
PROJECT_NAME=agent
PROJECT_DISPLAY_NAME=Agent Platform
PROJECT_SUBTITLE=AGENT
BRAND_NAME=Agent
DOMAIN=agent.cloud-it.com.ar

# AWS Configuration (SAME AS TEMPLATE)
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=[same as template]

# Database (SHARED RDS - CREATE NEW DB)
DB_NAME_SUFFIX=agent
DB_HOST=[same RDS endpoint as template]
DB_USER=[same as template]
DB_PASSWORD=[same as template]

# Email
FROM_EMAIL=noreply@cloud-it.com.ar

# Terraform Backend (DIFFERENT PREFIX)
TF_BACKEND_BUCKET=[same bucket as template]
TF_BACKEND_KEY_PREFIX=agent
```

**CRITICAL**: You will need to create a NEW Google OAuth client for agent.cloud-it.com.ar

---

## 🔐 GOOGLE OAUTH SETUP (NEW CLIENT NEEDED)

### Step 1: Create New OAuth Client
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Create OAuth 2.0 Client ID
4. Application type: Web application
5. Name: "Agent Platform"

### Step 2: Configure URLs
```bash
# Authorized JavaScript origins
https://agent.cloud-it.com.ar

# Authorized redirect URIs  
https://agent.cloud-it.com.ar/api/auth/callback/google
```

### Step 3: GitHub Secrets
Set these in GitHub repository settings:
```bash
GOOGLE_CLIENT_ID=[new client ID]
GOOGLE_CLIENT_SECRET=[new client secret]
```

---

## 📊 DEPLOYMENT PROCESS (PROVEN TO WORK)

### Phase 1: Project Setup
```bash
# 1. Install dependencies
npm install

# 2. Configure project interactively
npm run setup
# Follow prompts with values above

# 3. Install app dependencies  
npm run install-deps

# 4. Test local development
npm run dev
```

### Phase 2: Infrastructure Setup
```bash
# 1. Initialize Terraform backend
./scripts/terraform-init.sh

# 2. Initialize database
npm run init-db agent

# 3. Build Lambda package
npm run build-lambda
```

### Phase 3: GitHub Configuration
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial Agent Platform setup"
   git push origin main
   ```

2. **Configure GitHub Secrets**:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY  
   - GOOGLE_CLIENT_ID (NEW)
   - GOOGLE_CLIENT_SECRET (NEW)

3. **Configure GitHub Variables**:
   - AWS_REGION=us-east-1
   - AWS_ACCOUNT_ID
   - TF_BACKEND_BUCKET
   - PROJECT_NAME=agent

### Phase 4: Deploy Infrastructure
1. **Backend deployment** (GitHub Actions):
   - Triggers automatically on push
   - Deploys: Cognito, Lambda, RDS integration
   - Creates domain certificates

2. **Frontend deployment** (GitHub Actions):
   - Builds Next.js app
   - Deploys to S3 + CloudFront
   - Configures DNS

### Phase 5: Verification
1. **Test authentication flow**
2. **Verify database integration**  
3. **Check PostConfirmation Lambda**

---

## 🛠️ POSTCONFIRMATION LAMBDA SYSTEM

### What It Does
- **Triggered** when user completes Google OAuth
- **Creates user profile** in PostgreSQL database
- **Handles** UPSERT logic (update if exists, insert if new)
- **Compiled** with Docker for Linux x86_64 compatibility

### Key Files
- `lambda/postConfirmation.py` - Main Lambda function
- `lambda/package.sh` - Docker-based build script
- `lambda/database_schema_complete.sql` - Complete database schema
- `scripts/init-database.sh` - Database initialization

### Build Process
```bash
# Automatic Docker detection and compilation
cd lambda
./package.sh

# Creates postConfirmation.zip with:
# - Python code
# - psycopg2-binary (compiled for Linux)
# - All dependencies
```

---

## 🐛 CRITICAL LESSONS LEARNED

### 1. psycopg2 Architecture Issue
**Problem**: Mac ARM compiled packages don't work on AWS Lambda (Linux x86_64)
**Solution**: Docker build using AWS Lambda official image
**Command**: `docker run --platform linux/x86_64 public.ecr.aws/lambda/python:3.9`

### 2. Database Schema Completeness
**Problem**: Missing columns caused Lambda failures
**Solution**: Complete schema replication from working project
**File**: `lambda/database_schema_complete.sql`

### 3. GitHub Actions Configuration
**Problem**: CI/CD couldn't build psycopg2 correctly
**Solution**: Docker Buildx setup in workflows
**File**: `.github/workflows/terraform-backend.yml`

---

## 📁 KEY FILES AND THEIR PURPOSE

### Configuration System
- `.env.example` - Template for environment variables
- `config/project.config.js` - Dynamic configuration loader
- `scripts/setup-project.sh` - Interactive project setup
- `scripts/apply-config.js` - Apply configuration to files

### Lambda System
- `lambda/postConfirmation.py` - User registration handler
- `lambda/package.sh` - Cross-platform build script
- `lambda/Dockerfile.lambda-build` - Alternative build method
- `lambda/requirements.txt` - Python dependencies

### Database System
- `lambda/database_schema_complete.sql` - Complete schema
- `scripts/init-database.sh` - Database initialization
- Database tables: users, courses, categories, user_course_progress

### Infrastructure
- `terraform/backend/` - Cognito, Lambda, RDS integration
- `terraform/frontend/` - S3, CloudFront, ACM certificates
- `.github/workflows/` - CI/CD pipelines

### Frontend
- `app/components/AuthenticatedHeader.tsx` - Responsive header
- `app/pages/signin.tsx` - Login page with dynamic branding
- `app/pages/index.tsx` - Main dashboard

---

## 🚨 TROUBLESHOOTING GUIDE

### Common Issues & Solutions

#### 1. "No module named 'psycopg2._psycopg'"
**Cause**: Incorrect architecture compilation
**Solution**: 
```bash
cd lambda
./package.sh  # Uses Docker automatically
```

#### 2. "column does not exist" in Lambda
**Cause**: Database not properly initialized
**Solution**:
```bash
npm run init-db agent
```

#### 3. GitHub Actions failing on Lambda build
**Cause**: Missing Docker setup
**Solution**: Workflow includes Docker Buildx automatically

#### 4. Authentication not working
**Cause**: Google OAuth URLs misconfigured
**Solution**: Verify callback URLs match domain exactly

#### 5. CloudFront deployment timeout
**Cause**: SSL certificate validation pending
**Solution**: Wait for ACM certificate validation (can take 20+ minutes)

---

## 🔍 VERIFICATION CHECKLIST

### ✅ Project Setup Complete
- [ ] `npm run setup` executed successfully
- [ ] `.env` file created with correct values
- [ ] `npm run config` applied configuration
- [ ] `npm run install-deps` completed

### ✅ Infrastructure Ready
- [ ] `./scripts/terraform-init.sh` completed
- [ ] `npm run init-db agent` created database
- [ ] `npm run build-lambda` created ZIP file
- [ ] GitHub secrets configured

### ✅ Deployment Success
- [ ] Backend workflow completed (Cognito + Lambda)
- [ ] Frontend workflow completed (S3 + CloudFront)
- [ ] DNS resolves to CloudFront
- [ ] SSL certificate active

### ✅ Functionality Verified
- [ ] Google OAuth login works
- [ ] User redirected to dashboard after login
- [ ] PostConfirmation Lambda executes
- [ ] User saved to PostgreSQL database
- [ ] "Mi Progreso" section loads (or shows appropriate message)

---

## 📊 EXPECTED DEPLOYMENT TIMELINE

### Phase 1: Setup (5-10 minutes)
- Project configuration
- Database initialization
- Lambda package build

### Phase 2: GitHub Push (2-3 minutes)
- Code push to repository
- Secrets configuration

### Phase 3: Backend Deploy (8-12 minutes)
- Cognito User Pool creation
- Lambda function deployment
- RDS integration setup

### Phase 4: Frontend Deploy (15-25 minutes)
- ACM certificate creation & validation (longest step)
- CloudFront distribution setup
- DNS configuration

### Phase 5: Testing (5 minutes)
- Authentication flow
- Database integration
- User experience

**Total Expected Time: 35-55 minutes**

---

## 🎯 SUCCESS CRITERIA

The Agent Platform deployment is successful when:

1. ✅ User can visit https://agent.cloud-it.com.ar
2. ✅ SSL certificate is valid and secure
3. ✅ Google OAuth login redirects correctly
4. ✅ User is redirected to dashboard after login
5. ✅ PostConfirmation Lambda saves user to database
6. ✅ No errors in CloudWatch logs
7. ✅ Database contains user record after first login

---

## 🔄 COMPARISON WITH TEMPLATE PROJECT

### What's Different
- **Domain**: agent.cloud-it.com.ar vs template.cloud-it.com.ar
- **Branding**: "Agent Platform" vs "Template"
- **Database**: agent vs template_app
- **Google OAuth**: New client vs shared client
- **Terraform prefix**: agent vs template-app

### What's Identical
- **AWS account and region**
- **RDS database server** (shared)
- **Infrastructure architecture**
- **Authentication flow**
- **Lambda PostConfirmation logic**
- **Frontend components and styling**

---

## 📞 CONTACT REQUIREMENTS SUMMARY

### Original Requirements Fulfilled
- ✅ Same AWS account and region (us-east-1)
- ✅ Shared RDS database server
- ✅ Domain: agent.cloud-it.com.ar
- ✅ Branding: "Agent Platform"
- ✅ NEW Google OAuth client (as requested)
- ✅ Completely parameterizable system
- ✅ Environment variable driven configuration
- ✅ Production-ready template

### Next Steps After Deployment
- Monitor CloudWatch logs for any issues
- Test user registration flow thoroughly
- Prepare for additional features as needed
- Consider FastAPI microservices integration (future)

---

## 🚀 EXECUTION STRATEGY

### Start Here
1. **Verify working directory**: Should be in `/path/to/agent` repository
2. **Check git status**: Should be clean repository
3. **Run setup**: `npm run setup` with Agent Platform configuration
4. **Follow deployment phases** exactly as documented above

### If Issues Arise
1. **Check this documentation** first
2. **Review CloudWatch logs** for Lambda errors
3. **Verify GitHub Actions** status and logs
4. **Check DNS propagation** if domain issues
5. **Validate Google OAuth** configuration

### Remember
- This template system has been **tested and proven to work**
- The PostConfirmation Lambda system is **fully functional**
- All architecture issues have been **resolved**
- Follow the process exactly and you **will succeed**

---

**🎯 GO TIME: Start with `npm run setup` and follow the phases. This template is production-ready and will work!**