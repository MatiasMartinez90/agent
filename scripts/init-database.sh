#!/bin/bash

# Script para inicializar la base de datos del template
# Uso: ./scripts/init-database.sh [DATABASE_NAME]

set -e

DATABASE_NAME=${1:-$PROJECT_NAME}

if [ -z "$DATABASE_NAME" ]; then
    echo "❌ Error: Debes proporcionar el nombre de la base de datos"
    echo "Uso: ./scripts/init-database.sh <database_name>"
    echo "O configurar PROJECT_NAME en el .env"
    exit 1
fi

# Verificar que las variables de entorno estén configuradas
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ Error: Variables de entorno de base de datos no configuradas"
    echo "Necesitas configurar: DB_HOST, DB_USER, DB_PASSWORD"
    exit 1
fi

DB_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT:-5432}/${DATABASE_NAME}"

echo "🗄️  Inicializando base de datos: $DATABASE_NAME"
echo "🔗 Host: $DB_HOST"

# Crear la base de datos si no existe
echo "📝 Creando base de datos si no existe..."
createdb_url="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT:-5432}/postgres"
psql "$createdb_url" -c "CREATE DATABASE \"$DATABASE_NAME\";" 2>/dev/null || echo "✅ Base de datos ya existe"

# Aplicar el esquema
echo "🏗️  Aplicando esquema de base de datos..."
psql "$DB_URL" -f lambda/database_schema_complete.sql

# Verificar las tablas creadas
echo "📋 Verificando tablas creadas:"
psql "$DB_URL" -c "\dt"

echo "✅ Base de datos inicializada correctamente"
echo "🎯 Puedes conectarte con: psql \"$DB_URL\""