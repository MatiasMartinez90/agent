# 🐳 Lambda PostConfirmation Setup Guide

## Problema Resuelto

Durante el desarrollo encontramos que `psycopg2` compilado en Mac ARM no funciona en AWS Lambda (Linux x86_64). La solución fue usar Docker con la imagen oficial de AWS Lambda.

## 🚀 Quick Start

### 1. Build Lambda Package
```bash
# Opción 1: Script automático (detecta Docker)
cd lambda
./package.sh

# Opción 2: Comando npm
npm run build-lambda

# Opción 3: Dockerfile alternativo
cd lambda
./build-with-dockerfile.sh
```

### 2. Inicializar Base de Datos
```bash
# Configurar variables de entorno primero
export DB_HOST=your-host
export DB_USER=your-user  
export DB_PASSWORD=your-password

# Inicializar base de datos
npm run init-db template_app
```

## 🛠️ Como Funciona

### Docker Build Process
1. **Detección automática**: El script `package.sh` detecta si Docker está disponible
2. **Imagen oficial**: Usa `public.ecr.aws/lambda/python:3.9` 
3. **Compilación correcta**: psycopg2 se compila para Linux x86_64
4. **Fallback local**: Si no hay Docker, usa pip local con warning

### GitHub Actions Integration
- ✅ **Docker Buildx**: Setup automático en CI/CD
- ✅ **Verificación**: Comprueba contenido del ZIP
- ✅ **Logs detallados**: Para debugging en caso de issues

## 📁 Archivos Importantes

### Build Scripts
- `lambda/package.sh` - Script principal con Docker/fallback
- `lambda/build-with-dockerfile.sh` - Alternativa con Dockerfile
- `lambda/Dockerfile.lambda-build` - Dockerfile para development

### Database
- `lambda/database_schema_complete.sql` - Schema completo
- `scripts/init-database.sh` - Inicialización automática

### Configuration
- `lambda/requirements.txt` - Dependencias Python
- `lambda/postConfirmation.py` - Función Lambda principal

## 🐛 Troubleshooting

### Error: "No module named 'psycopg2._psycopg'"
**Causa**: psycopg2 compilado para arquitectura incorrecta
**Solución**: Asegurar que se use Docker build

### Error: "column does not exist"
**Causa**: Base de datos no inicializada correctamente
**Solución**: Ejecutar `npm run init-db`

### Docker no disponible
**Síntoma**: "Docker no disponible, usando pip local"
**Solución**: Instalar Docker o usar en GitHub Actions

## 🔍 Verificación

### Verificar ZIP Contents
```bash
unzip -l lambda/postConfirmation.zip | grep psycopg2
# Debe mostrar: _psycopg.cpython-39-x86_64-linux-gnu.so
```

### Test Local
```bash
# Build y test
npm run build-lambda
aws lambda update-function-code --function-name your-function --zip-file fileb://lambda/postConfirmation.zip
```

## 📊 Métricas de Éxito

- ✅ ZIP size: ~18-20MB (con todas las dependencias)
- ✅ Arquitectura: x86_64-linux-gnu 
- ✅ Python version: 3.9
- ✅ PostConfirmation trigger: < 500ms execution time
- ✅ Database connection: Exitosa sin errores

## 🚀 Next Steps

1. **Usar este template**: Todo está configurado automáticamente
2. **Customizar**: Modificar `postConfirmation.py` según necesidades
3. **Monitorear**: Revisar logs en CloudWatch
4. **Escalar**: Agregar más triggers o microservicios