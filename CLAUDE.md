# Template App - Context for Claude Code

## 🎯 Project Overview

This is a **reusable template** for creating AWS applications with Next.js, Cognito authentication, and Terraform infrastructure. The template is fully parameterizable through environment variables and configuration scripts.

## 📋 Current Status

**✅ COMPLETED:**
- Full project structure cloned from `cloudacademy_next`
- Parameterizable configuration system implemented
- Setup scripts created
- Documentation written
- GitHub Actions workflows configured
- Terraform modules made configurable

**🔄 NEXT STEPS:**
1. Test the setup script: `npm run setup`
2. Install app dependencies: `npm run install-deps`
3. Test configuration system: `npm run config`
4. Test local development: `npm run dev`
5. Remove debug console.logs from dropdown component

## 🏗️ Architecture

### Frontend (app/)
- **Next.js** with TypeScript and Tailwind CSS v4
- **Authentication**: AWS Cognito + Google OAuth
- **Responsive design** with desktop sidebar/mobile dropdown
- **Dynamic branding** through configuration

### Infrastructure (terraform/)
- **Backend module**: Cognito, Lambda, RDS integration
- **Frontend module**: S3, CloudFront, ACM certificates
- **Bedrock module**: AI/ML capabilities
- **Parameterized** resource names and configurations

### Configuration System
- **Environment variables** for all customizable values
- **Interactive setup script** for new projects
- **Automatic file updates** through apply-config script
- **Multi-environment support** (dev/staging/prod)

## 🔧 Key Files and Their Purpose

### Configuration Files
- ``.env.example`` - Template for environment variables
- ``config/project.config.js`` - Dynamic configuration loader
- ``scripts/setup-project.sh`` - Interactive project setup
- ``scripts/apply-config.js`` - Apply configuration to files
- ``scripts/terraform-init.sh`` - Initialize Terraform with variables

### Frontend Files (Key Changes Made)
- ``app/pages/index.tsx`` - Changed "CloudAcademy" → parameterizable branding
- ``app/pages/admin.tsx`` - Dashboard with configurable titles
- ``app/pages/signin.tsx`` - Login page with dynamic branding
- ``app/components/AuthenticatedHeader.tsx`` - Header with responsive dropdown

### Infrastructure Files
- ``terraform/backend/variables.tf`` - Parameterized variables
- ``terraform/backend/main.tf`` - Resources with unique naming
- ``.github/workflows/`` - CI/CD with variable support

## 📝 Environment Variables

### Required Variables
```bash
# Project Information
PROJECT_NAME=template-app
PROJECT_DISPLAY_NAME=Template App
PROJECT_SUBTITLE=APP
BRAND_NAME=Template
DOMAIN=template.cloud-it.com.ar

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=your-account-id

# Google OAuth (same client for multiple apps)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DB_NAME_SUFFIX=template
DB_HOST=your-rds-endpoint
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# Email
FROM_EMAIL=noreply@cloud-it.com.ar

# Terraform Backend
TF_BACKEND_BUCKET=terraform-state-bucket-vz26twi7
TF_BACKEND_KEY_PREFIX=template-app
```

## 🚀 Available Commands

```bash
# Setup and Configuration
npm run setup          # Interactive project configuration
npm run config         # Apply .env variables to files
npm run install-deps   # Install app dependencies

# Development
npm run dev            # Start development server
npm run build          # Build for production

# Infrastructure
npm run terraform-init # Initialize Terraform backend
npm run terraform-plan # Plan infrastructure changes
npm run terraform-apply # Apply infrastructure changes

# Deployment
npm run deploy         # Full deployment (build + terraform)
```

## 🔄 How the Template System Works

### 1. Setup Process
1. User runs `npm run setup`
2. Script asks for project details interactively
3. Generates `.env` file with user inputs
4. Runs `apply-config.js` to update all files
5. Project is ready for development/deployment

### 2. Configuration Application
- `apply-config.js` reads `.env` file
- Replaces placeholders in frontend files
- Updates Terraform variables
- Generates project-specific README
- Creates Next.js configuration

### 3. File Replacement Patterns
```javascript
// Frontend replacements
'CloudAcademy' → config.branding.name
'PROYECTS' → config.project.subtitle
'template.cloud-it.com.ar' → config.domain.base

// Terraform replacements
'template-app' → config.project.name
'proyecto_template' → `proyecto_${config.database.nameSuffix}`
'PostConfirmationFn-Template' → `PostConfirmationFn-${config.project.name}`
```

## 🔐 Authentication System

### Current Implementation
- **AWS Cognito User Pool** with Google OAuth
- **Same Google OAuth client** for multiple apps
- **Callback URLs** parameterized by domain
- **JWT validation** in FastAPI backend
- **Responsive dropdown menu** (desktop sidebar, mobile compact)

### Dropdown Component Status
- ✅ Desktop: Elegant sidebar with user info and menu items
- ✅ Mobile: Compact dropdown with icons only
- ⚠️ **TO FIX**: Remove debug console.logs from AuthenticatedHeader.tsx:
  - Lines 18, 29-32: Debug logs for mobile detection
  - These were added for troubleshooting and should be removed

## 🏗️ Terraform Structure

### Backend Module (`terraform/backend/`)
- **Cognito User Pool** with parameterized names
- **Lambda functions** for post-confirmation
- **RDS integration** for user data
- **SES configuration** for emails

### Resource Naming Pattern
```hcl
# Original pattern:
resource "aws_lambda_function" "post_confirmation" {
  function_name = "PostConfirmationFn-Template"
}

# Becomes:
function_name = "PostConfirmationFn-${var.project_name}"
```

## 📊 Testing Plan

### Phase 1: Local Setup
1. Run `npm install` (root dependencies)
2. Run `npm run setup` (interactive configuration)
3. Verify `.env` file generation
4. Run `npm run config` (apply configuration)
5. Run `npm run install-deps` (app dependencies)

### Phase 2: Development Testing
1. Run `npm run dev` (local development)
2. Test authentication flow
3. Verify branding updates
4. Test responsive dropdown menu
5. Clean up debug logs

### Phase 3: Infrastructure Testing
1. Configure AWS credentials
2. Run `./scripts/terraform-init.sh`
3. Run `npm run terraform-plan`
4. Verify unique resource names
5. Test deployment (staging first)

## 🚀 New Features Added (PostConfirmation Lambda)

### ✅ Lambda PostConfirmation Working
**Status**: ✅ COMPLETAMENTE FUNCIONAL
**Descripción**: Lambda que guarda usuarios de Cognito en PostgreSQL
**Ubicación**: `lambda/postConfirmation.py`

**Características:**
- ✅ Trigger automático en Google OAuth signup
- ✅ Conexión a PostgreSQL con psycopg2 
- ✅ Esquema completo de base de datos
- ✅ Envío de emails de bienvenida con SES
- ✅ Manejo de errores robusto

### 🐳 Docker Build System
**Problema resuelto**: psycopg2 compilado para Mac ARM no funciona en AWS Lambda
**Solución**: Docker con imagen oficial de Lambda Python 3.9

**Scripts disponibles:**
- `lambda/package.sh` - Build automático con Docker/fallback
- `lambda/build-with-dockerfile.sh` - Build alternativo con Dockerfile
- `npm run build-lambda` - Comando npm para build

**GitHub Actions**: Configurado para usar Docker en CI/CD

### 🗄️ Database Schema Management
**Esquema completo**: Replicado de CloudAcademy original
**Tablas incluidas:**
- `users` - Perfiles de usuario completos
- `user_course_progress` - Progreso de cursos
- `courses` - Catálogo de cursos  
- `categories` - Categorías de cursos

**Scripts de inicialización:**
- `scripts/init-database.sh` - Inicializar BD para nuevos proyectos
- `npm run init-db` - Comando npm para inicializar BD
- `lambda/database_schema_complete.sql` - Schema SQL completo

## 🐛 Issues Resueltos

### ✅ 1. PostConfirmation Lambda psycopg2 ImportError
**Problema**: `No module named 'psycopg2._psycopg'`
**Causa**: psycopg2 compilado para Mac ARM vs Linux x86_64
**Solución**: Docker build con imagen oficial AWS Lambda Python 3.9
**Estado**: ✅ RESUELTO

### ✅ 2. Database Schema Mismatch
**Problema**: `column "cognito_user_id" does not exist`
**Causa**: Esquema incompleto en template_app vs original
**Solución**: Replicar esquema completo de CloudAcademy
**Estado**: ✅ RESUELTO

### ✅ 3. GitHub Actions Docker Support
**Problema**: CI/CD no compilaba psycopg2 correctamente
**Solución**: Agregar Docker Buildx action y verificaciones
**Estado**: ✅ RESUELTO

## 📚 Documentation Files Created

- `README.md` - Main project documentation
- `USAGE.md` - Detailed usage instructions
- `CLAUDE.md` - This context file
- `.env.example` - Environment variables template

## 💡 Design Decisions Made

### 1. Variable-Based Configuration
**Choice**: Environment variables + scripts vs Cookiecutter
**Reason**: Simpler to implement, maintain, and use
**Result**: Interactive setup with automatic file updates

### 2. Same Google OAuth Client
**Choice**: Share OAuth client vs separate per project
**Reason**: User requirement for unified authentication
**Result**: Multiple callback URLs in single OAuth app

### 3. Terraform Resource Naming
**Choice**: Parameterized resource names vs fixed names
**Reason**: Avoid conflicts when multiple deployments
**Result**: Project-specific resource naming pattern

### 4. Responsive Dropdown Design
**Choice**: Desktop sidebar + mobile compact vs uniform design
**Reason**: Optimal UX for each platform
**Result**: Context-aware UI components

## 🔄 Migration from CloudAcademy

### What Was Changed
- **Branding**: "CloudAcademy" → configurable brand name
- **URLs**: Fixed URLs → parameterized domains
- **Resource names**: Fixed → project-specific naming
- **Configuration**: Hardcoded → environment-driven

### What Was Preserved
- **Authentication flow** and security patterns
- **UI/UX design** and component structure
- **Infrastructure architecture** and AWS services
- **CI/CD pipeline** structure and security practices

## 🎯 Success Criteria

### Template is successful when:
1. ✅ User can run `npm run setup` and configure a new project
2. ✅ All branding updates automatically throughout the application
3. ✅ Terraform resources have unique names per project
4. ✅ Local development works with `npm run dev`
5. ✅ Infrastructure deploys without conflicts
6. ✅ Multiple projects can coexist in same AWS account
7. ✅ GitHub Actions work with configurable variables

## 🚨 Important Notes for Next Session

1. **Working Directory**: Start Claude Code from `/template_app` directory
2. **First Task**: Test the setup script: `npm run setup`
3. **Second Task**: Remove debug logs from dropdown component
4. **Third Task**: Test local development server
5. **Priority**: Verify the parameterizable system works end-to-end

## 📞 Original Requirements Recap

- ✅ Same AWS account and region (us-east-1)
- ✅ Same Google OAuth app with multiple callback URLs
- ✅ Domain: template.cloud-it.com.ar
- ✅ Branding: "CloudAcademy" → "Template"
- ✅ New repository ready for GitHub Actions
- ✅ Completely parameterizable for future projects
- ✅ Environment variable driven configuration

The template is ready for testing and implementation! 🚀