#!/bin/bash

echo "🐳 Building Lambda package with Docker for Linux x86_64 Python 3.9..."

# Limpiar archivos anteriores
rm -f postConfirmation.zip
rm -rf package/

# Crear directorio temporal
mkdir -p package

# Usar Docker para instalar dependencias en el ambiente correcto de Lambda
docker run --rm --platform linux/x86_64 -v "$PWD":/var/task public.ecr.aws/lambda/python:3.9 /bin/bash -c "
cd /var/task
pip install psycopg2-binary boto3 -t package/
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

echo "✅ Lambda function empaquetada en postConfirmation.zip para Linux x86_64"
echo "🚀 Listo para deployment!"

ls -la postConfirmation.zip