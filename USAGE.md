# 📚 Guía de Uso - Template App

## 🎯 Cómo usar este template para crear una nueva aplicación

### 1️⃣ **Preparar el proyecto**

```bash
# Clonar o descargar el template
git clone https://github.com/tu-usuario/template-app.git mi-nueva-app
cd mi-nueva-app

# Limpiar historial git (opcional)
rm -rf .git
git init
```

### 2️⃣ **Configuración inicial**

```bash
# Instalar dependencias del template
npm install

# Ejecutar configuración interactiva
npm run setup
```

**El script te preguntará:**
- 📝 Nombre del proyecto (ej: `ecommerce-app`)
- 🏷️ Nombre para mostrar (ej: `E-commerce App`)
- 🌐 Dominio (ej: `ecommerce.mi-empresa.com`)
- 🎨 Nombre de marca (ej: `MiTienda`)
- ☁️ Account ID de AWS
- 🔐 Credenciales de Google OAuth
- 🗄️ Configuración de base de datos

### 3️⃣ **Configurar GitHub Secrets**

En tu repositorio de GitHub, ir a **Settings > Secrets and variables > Actions** y agregar:

#### 🔐 **Required Secrets:**
```bash
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
GOOGLE_CLIENT_ID=123456789...
GOOGLE_CLIENT_SECRET=...
DB_HOST=mi-rds-instance.region.rds.amazonaws.com
DB_USER=postgres
DB_PASSWORD=...
```

#### ⚙️ **Optional Variables:**
```bash
PROJECT_NAME=mi-app
DOMAIN=mi-app.com
AWS_REGION=us-east-1
```

### 4️⃣ **Preparar infraestructura**

```bash
# Instalar dependencias del frontend
npm run install-deps

# Inicializar Terraform
./scripts/terraform-init.sh

# Ver qué se va a crear
npm run terraform-plan
```

### 5️⃣ **Deploy inicial**

```bash
# Deploy completo
npm run deploy

# O paso a paso:
npm run build                    # Build del frontend
npm run terraform-apply         # Deploy infraestructura
```

---

## 🔄 **Flujo de desarrollo**

### 🖥️ **Desarrollo local**

```bash
# Servidor de desarrollo
npm run dev

# La app estará en: http://localhost:3000
```

### 🚀 **Deploy a producción**

**Opción A: GitHub Actions (recomendado)**
```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
# GitHub Actions se encarga del deploy automático
```

**Opción B: Deploy manual**
```bash
npm run deploy
```

### 🔧 **Modificar configuración**

1. Editar variables en `.env`
2. Ejecutar: `npm run config`
3. Commitear cambios

---

## 📝 **Ejemplos de configuración**

### 🏪 **E-commerce App**
```bash
PROJECT_NAME=ecommerce-store
PROJECT_DISPLAY_NAME=Mi Tienda Online
BRAND_NAME=MiTienda
DOMAIN=tienda.mi-empresa.com
BRAND_COLOR_PRIMARY=#e11d48
```

### 🏢 **Corporate Dashboard**
```bash
PROJECT_NAME=corporate-dashboard
PROJECT_DISPLAY_NAME=Dashboard Corporativo
BRAND_NAME=CorpDash
DOMAIN=dashboard.empresa.com
BRAND_COLOR_PRIMARY=#1e40af
```

### 🎓 **Educational Platform**
```bash
PROJECT_NAME=learning-platform
PROJECT_DISPLAY_NAME=Mi Academia
BRAND_NAME=Academia
DOMAIN=academia.edu.com
BRAND_COLOR_PRIMARY=#059669
```

---

## 🔧 **Personalización avanzada**

### 🎨 **Cambiar diseño**

**Colores principales:**
```bash
# Editar .env
BRAND_COLOR_PRIMARY=#tu-color-hex
BRAND_COLOR_SECONDARY=#tu-color-hex

# Aplicar cambios
npm run config
```

**Logo personalizado:**
```bash
# Reemplazar archivos en:
app/public/favicon.ico
app/public/logo.png
```

### 🌐 **Múltiples dominios**

**Ambiente staging:**
```bash
# .env.staging
ENVIRONMENT=staging
DOMAIN=staging.mi-app.com
```

**Ambiente producción:**
```bash
# .env.production  
ENVIRONMENT=prod
DOMAIN=mi-app.com
```

### 🗄️ **Base de datos personalizada**

```bash
# En .env
DB_NAME_SUFFIX=mi_app_unica
DB_HOST=mi-rds-instance.region.rds.amazonaws.com
```

---

## 🚨 **Troubleshooting**

### ❌ **Error: "Terraform backend not configured"**
```bash
# Solución:
./scripts/terraform-init.sh
```

### ❌ **Error: "Google OAuth not working"**
1. Verificar que las URLs de callback incluyan tu dominio
2. En Google Console, agregar:
   - `http://localhost:3000` (dev)
   - `https://tu-dominio.com` (prod)

### ❌ **Error: "Build failing in GitHub Actions"**
1. Verificar que todos los secrets estén configurados
2. Revisar logs en Actions tab
3. Verificar que el archivo `.env.example` tenga todas las variables

### ❌ **Error: "Terraform state locked"**
```bash
# Si el deploy se interrumpió
cd terraform/backend
terraform force-unlock LOCK_ID
```

---

## 📊 **Monitoring y mantenimiento**

### 💰 **Costos estimados**
- **Desarrollo**: ~$5-10/mes
- **Staging**: ~$15-25/mes  
- **Producción**: ~$40-80/mes

### 📈 **Métricas importantes**
- **CloudWatch**: Logs y errores
- **GitHub Actions**: Deploy success rate
- **Infracost**: Estimación de costos mensual

### 🔄 **Tareas de mantenimiento**
- Rotar secrets cada 90 días
- Actualizar dependencias mensualmente
- Revisar logs de seguridad semanalmente
- Backup de Terraform state

---

## 🎯 **Próximos pasos**

1. ✅ **Configurar proyecto** con `npm run setup`
2. ✅ **Configurar GitHub Secrets**
3. ✅ **Deploy inicial**
4. 🔧 **Personalizar design y funcionalidad**
5. 👥 **Invitar equipo al repositorio**
6. 📊 **Configurar monitoring**
7. 🚀 **¡Lanzar tu aplicación!**

---

## 🆘 **¿Necesitas ayuda?**

- 📧 **Email**: noreply@cloud-it.com.ar
- 🐛 **Issues**: [GitHub Issues](https://github.com/tu-usuario/template-app/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/tu-usuario/template-app/discussions)

---

**🎉 ¡Felicidades! Ya tienes todo lo necesario para crear aplicaciones AWS modernas y escalables.**