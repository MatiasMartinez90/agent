#!/bin/bash

# Script para empaquetar la Lambda function en Python
echo "📦 Empaquetando Lambda function en Python..."

# Limpiar archivos anteriores
rm -f postConfirmation.zip
rm -rf package/

# Verificar si Docker está disponible
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo "🐳 Usando Docker para compilar dependencias para Linux x86_64..."
    
    # Usar Docker para instalar dependencias en el ambiente correcto de Lambda
    docker run --rm --platform linux/x86_64 \
        -v "$PWD":/var/task \
        -w /var/task \
        --entrypoint="" \
        public.ecr.aws/lambda/python:3.9 \
        /bin/bash -c "
            echo '📦 Installing dependencies for Lambda Linux x86_64...'
            rm -rf package/
            mkdir -p package
            pip install -r requirements.txt -t package/
            echo '✅ Dependencies installed successfully'
        "
    
    # Copiar código fuente
    echo "📄 Copiando código fuente..."
    cp postConfirmation.py package/
    
    # Crear ZIP
    echo "🗜️ Creando archivo ZIP..."
    cd package
    zip -r ../postConfirmation.zip .
    cd ..
    
    # Limpiar
    rm -rf package/
    
    echo "✅ Lambda function empaquetada con Docker para Linux x86_64"
    
else
    echo "⚠️  Docker no disponible, usando pip local (puede no ser compatible con Lambda)"
    
    # Crear directorio temporal
    mkdir -p package
    
    # Instalar dependencias de Python localmente
    echo "🐍 Instalando dependencias de Python..."
    pip3 install -r requirements.txt -t package/
    
    # Copiar código fuente
    echo "📄 Copiando código fuente..."
    cp postConfirmation.py package/
    
    # Crear ZIP
    echo "🗜️ Creando archivo ZIP..."
    cd package
    zip -r ../postConfirmation.zip .
    cd ..
    
    # Limpiar
    rm -rf package/
    
    echo "✅ Lambda function empaquetada (verificar compatibilidad)"
fi

echo "🚀 Listo para deployment!"