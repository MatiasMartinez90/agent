#!/bin/bash

# ============================================
# 🚀 TEMPLATE APP - SCRIPT DE CONFIGURACIÓN
# ============================================

set -e

echo "🚀 Configurando nuevo proyecto basado en Template App..."

# Función para solicitar input del usuario
ask_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        eval "$var_name=\${input:-$default}"
    else
        read -p "$prompt: " input
        eval "$var_name=\"$input\""
    fi
}

# Función para generar string aleatorio
generate_random() {
    echo $(openssl rand -hex 4)
}

echo "📋 Configuración del proyecto:"
echo "================================"

# Solicitar información del proyecto
ask_input "Nombre del proyecto (sin espacios)" "mi-app" PROJECT_NAME
ask_input "Nombre para mostrar" "Mi App" PROJECT_DISPLAY_NAME
ask_input "Subtítulo del proyecto" "APP" PROJECT_SUBTITLE
ask_input "Dominio base (sin https://)" "mi-app.cloud-it.com.ar" DOMAIN

echo ""
echo "🎨 Configuración de branding:"
echo "================================"

ask_input "Nombre de la marca" "$PROJECT_DISPLAY_NAME" BRAND_NAME
ask_input "Color primario (hex)" "#10b981" BRAND_COLOR_PRIMARY

echo ""
echo "☁️ Configuración AWS:"
echo "================================"

ask_input "Región AWS" "us-east-1" AWS_REGION
ask_input "Account ID de AWS" "" AWS_ACCOUNT_ID

echo ""
echo "🗄️ Configuración de base de datos:"
echo "================================"

DB_NAME_SUFFIX=$(echo "$PROJECT_NAME" | tr '-' '_')
ask_input "Sufijo de la base de datos" "$DB_NAME_SUFFIX" DB_NAME_SUFFIX
ask_input "Host de RDS" "" DB_HOST
ask_input "Usuario de DB" "" DB_USER
ask_input "Password de DB" "" DB_PASSWORD

echo ""
echo "🔐 Configuración OAuth:"
echo "================================"

ask_input "Google Client ID" "" GOOGLE_CLIENT_ID
ask_input "Google Client Secret" "" GOOGLE_CLIENT_SECRET

echo ""
echo "📧 Configuración de email:"
echo "================================"

FROM_EMAIL="noreply@$(echo $DOMAIN | cut -d'.' -f2-)"
ask_input "Email para notificaciones" "$FROM_EMAIL" FROM_EMAIL

# Generar configuraciones únicas
TF_BACKEND_KEY_PREFIX="$PROJECT_NAME"
RANDOM_SUFFIX=$(generate_random)

echo ""
echo "🔧 Generando archivo .env..."

# Crear archivo .env
cat > .env << EOF
# ============================================
# 🚀 $PROJECT_DISPLAY_NAME - CONFIGURACIÓN
# ============================================
# Generado automáticamente: $(date)

# 📋 INFORMACIÓN DEL PROYECTO
PROJECT_NAME=$PROJECT_NAME
PROJECT_DISPLAY_NAME=$PROJECT_DISPLAY_NAME
PROJECT_SUBTITLE=$PROJECT_SUBTITLE
PROJECT_DESCRIPTION=$PROJECT_DISPLAY_NAME basada en Template App

# 🌐 DOMINIO Y URLs
DOMAIN=$DOMAIN
BASE_URL=https://$DOMAIN

# 🎨 BRANDING
BRAND_NAME=$BRAND_NAME
BRAND_COLOR_PRIMARY=$BRAND_COLOR_PRIMARY
BRAND_COLOR_SECONDARY=#6366f1

# ☁️ AWS CONFIGURACIÓN
AWS_REGION=$AWS_REGION
AWS_ACCOUNT_ID=$AWS_ACCOUNT_ID

# 🔐 GOOGLE OAUTH
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET

# 🗄️ DATABASE
DB_NAME_SUFFIX=$DB_NAME_SUFFIX
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_PORT=5432

# 📧 EMAIL
FROM_EMAIL=$FROM_EMAIL

# 🏗️ TERRAFORM BACKEND
TF_BACKEND_BUCKET=terraform-state-bucket-vz26twi7
TF_BACKEND_KEY_PREFIX=$TF_BACKEND_KEY_PREFIX
TF_DYNAMODB_TABLE=terraform-lock-table

# 🚀 DEPLOYMENT
ENVIRONMENT=dev
EOF

echo "✅ Archivo .env creado exitosamente!"
echo ""
echo "🔄 Aplicando configuración a los archivos del proyecto..."

# Ejecutar script de aplicación de configuración
node scripts/apply-config.js

echo ""
echo "🎉 ¡Proyecto configurado exitosamente!"
echo ""
echo "📝 Próximos pasos:"
echo "  1. Revisar el archivo .env generado"
echo "  2. Configurar las variables en GitHub Secrets (para CI/CD)"
echo "  3. Ejecutar: npm install"
echo "  4. Ejecutar: npm run build"
echo "  5. Desplegar infraestructura: cd terraform && terraform plan"
echo ""
echo "🚀 ¡Tu aplicación $PROJECT_DISPLAY_NAME está lista!"