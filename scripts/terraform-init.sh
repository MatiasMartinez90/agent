#!/bin/bash

# ============================================
# 🚀 TEMPLATE APP - INICIALIZAR TERRAFORM
# ============================================

set -e

# Cargar variables de entorno
if [ -f .env ]; then
    source .env
fi

echo "🏗️ Inicializando Terraform Backend..."

# Valores por defecto si no están definidos
PROJECT_NAME=${PROJECT_NAME:-"template-app"}
TF_BACKEND_BUCKET=${TF_BACKEND_BUCKET:-"terraform-state-bucket-vz26twi7"}
TF_BACKEND_KEY_PREFIX=${TF_BACKEND_KEY_PREFIX:-"template-app"}
TF_DYNAMODB_TABLE=${TF_DYNAMODB_TABLE:-"terraform-lock-table"}
AWS_REGION=${AWS_REGION:-"us-east-1"}

echo "📋 Configuración:"
echo "   Proyecto: $PROJECT_NAME"
echo "   Bucket: $TF_BACKEND_BUCKET"
echo "   Key: $TF_BACKEND_KEY_PREFIX/backend/terraform.tfstate"
echo "   Región: $AWS_REGION"
echo ""

# Navegar a directorio de terraform
cd terraform/backend

echo "🔧 Inicializando Terraform con backend remoto..."

terraform init \
  -backend-config="bucket=$TF_BACKEND_BUCKET" \
  -backend-config="key=$TF_BACKEND_KEY_PREFIX/backend/terraform.tfstate" \
  -backend-config="region=$AWS_REGION" \
  -backend-config="dynamodb_table=$TF_DYNAMODB_TABLE"

echo "✅ Terraform inicializado exitosamente!"
echo ""
echo "🔍 Próximos pasos:"
echo "   1. terraform plan -var-file=terraform.tfvars"
echo "   2. terraform apply -var-file=terraform.tfvars"
echo ""