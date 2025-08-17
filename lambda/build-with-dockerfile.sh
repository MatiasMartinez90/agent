#!/bin/bash

# Script alternativo para compilar Lambda usando Dockerfile
echo "🐳 Compilando Lambda usando Dockerfile..."

# Construir imagen Docker
echo "📦 Construyendo imagen Docker..."
docker build --platform linux/amd64 -f Dockerfile.lambda-build -t lambda-builder .

# Ejecutar container y extraer ZIP
echo "🗜️ Creando ZIP con dependencias..."
docker run --rm -v "$PWD":/output lambda-builder sh -c "
    mkdir -p package
    pip install -r requirements.txt -t package/
    cp postConfirmation.py package/
    cd package
    zip -r /output/postConfirmation.zip .
    echo '✅ ZIP creado exitosamente'
"

echo "📊 Información del ZIP:"
ls -la postConfirmation.zip

echo "🔍 Contenido del ZIP (preview):"
unzip -l postConfirmation.zip | head -20

echo "✅ Build completado con Dockerfile!"