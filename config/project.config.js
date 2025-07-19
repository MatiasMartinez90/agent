// ============================================
// 🚀 TEMPLATE APP - CONFIGURACIÓN DINÁMICA
// ============================================

require('dotenv').config();

const config = {
  // 📋 Información del proyecto
  project: {
    name: process.env.PROJECT_NAME || 'template-app',
    displayName: process.env.PROJECT_DISPLAY_NAME || 'Template App',
    subtitle: process.env.PROJECT_SUBTITLE || 'APP',
    description: process.env.PROJECT_DESCRIPTION || 'Aplicación Template basada en AWS'
  },

  // 🌐 URLs y dominio
  domain: {
    base: process.env.DOMAIN || 'template.cloud-it.com.ar',
    subdomain: process.env.SUBDOMAIN || 'template',
    baseUrl: process.env.BASE_URL || 'https://template.cloud-it.com.ar'
  },

  // 🎨 Branding
  branding: {
    name: process.env.BRAND_NAME || 'Template',
    primaryColor: process.env.BRAND_COLOR_PRIMARY || '#10b981',
    secondaryColor: process.env.BRAND_COLOR_SECONDARY || '#6366f1'
  },

  // ☁️ AWS
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accountId: process.env.AWS_ACCOUNT_ID
  },

  // 🔐 OAuth
  oauth: {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET
  },

  // 🗄️ Database
  database: {
    nameSuffix: process.env.DB_NAME_SUFFIX || 'template',
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || '5432'
  },

  // 📧 Email
  email: {
    fromEmail: process.env.FROM_EMAIL || 'noreply@cloud-it.com.ar'
  },

  // 🏗️ Terraform
  terraform: {
    backendBucket: process.env.TF_BACKEND_BUCKET || 'terraform-state-bucket-vz26twi7',
    backendKeyPrefix: process.env.TF_BACKEND_KEY_PREFIX || 'template-app',
    dynamodbTable: process.env.TF_DYNAMODB_TABLE || 'terraform-lock-table'
  },

  // 🚀 Environment
  environment: process.env.ENVIRONMENT || 'dev'
};

module.exports = config;