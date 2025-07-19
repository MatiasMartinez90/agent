# 🚀 AWS Template App

Template reutilizable para crear aplicaciones AWS enterprise-grade con Next.js, Cognito, Terraform y CI/CD automatizado.

## ✨ ¿Qué es esto?

Un **sistema de plantillas completamente parametrizable** que permite crear múltiples aplicaciones AWS idénticas en arquitectura pero únicas en branding, dominio y configuración, usando un único repositorio base.

### 🎯 Caso de Uso Perfecto

- **Agencias digitales** que crean múltiples aplicaciones similares
- **Empresas SaaS** con productos white-label  
- **Consultoras** que necesitan demos rápidos pero profesionales
- **Startups** que quieren infraestructura enterprise desde día 1

## 🏗️ Arquitectura

### Frontend
- **Next.js 13+** con TypeScript y Tailwind CSS v4
- **Autenticación**: AWS Cognito + Google OAuth
- **Diseño responsive** con sidebar desktop/dropdown mobile
- **Branding dinámico** completamente configurable

### Backend  
- **FastAPI** con autenticación JWT
- **Amazon Bedrock** para IA generativa
- **PostgreSQL** en RDS
- **Containerización** Docker + Kubernetes ready

### Infraestructura
- **Terraform modular**: Backend, Frontend, Bedrock
- **AWS Services**: S3, CloudFront, Cognito, Lambda, RDS
- **CI/CD**: GitHub Actions con security scanning y cost analysis
- **Deployment**: Zero-downtime con CloudFront

## 🚀 Quick Start

### 1. Clonar y Configurar

```bash
git clone https://github.com/MatiasMartinez90/aws-template-app.git
cd aws-template-app

# Instalar dependencias
npm install

# Configuración interactiva (genera .env automáticamente)
npm run setup

# Aplicar configuración a todos los archivos
npm run config
```

### 2. Desarrollo Local

```bash
# Instalar dependencias de la app
npm run install-deps

# Iniciar desarrollo (requiere .env.local para auth)
npm run dev
```

Visita **http://localhost:3000** para ver tu aplicación con branding personalizado.

### 3. Deployment AWS (Opcional)

```bash
# Configurar Terraform backend
npm run terraform-init

# Desplegar infraestructura
npm run terraform-plan
npm run terraform-apply

# Build y deploy completo
npm run deploy
```

## 🎨 Sistema de Parametrización

### Variables de Configuración

El script `npm run setup` te solicita:

```bash
# Proyecto
PROJECT_NAME=mi-nueva-app
PROJECT_DISPLAY_NAME=Mi Nueva App  
PROJECT_SUBTITLE=NUEVA
BRAND_NAME=MiMarca

# Dominio
DOMAIN=mi-app.ejemplo.com
BASE_URL=https://mi-app.ejemplo.com

# AWS y OAuth
AWS_REGION=us-east-1
GOOGLE_CLIENT_ID=tu-google-client-id
# ... más configuraciones
```

### Transformación Automática

El sistema reemplaza automáticamente:

- `"Template"` → `config.branding.name` en toda la UI
- `"template.cloud-it.com.ar"` → `config.domain.base` 
- `"PostConfirmationFn-Template"` → `"PostConfirmationFn-${proyecto}"`
- **50+ patrones más** en frontend y Terraform

## 🛠️ Comandos Disponibles

### Configuración
```bash
npm run setup          # Configuración interactiva
npm run config         # Aplicar variables a archivos  
npm run install-deps   # Instalar dependencias de app
```

### Desarrollo
```bash
npm run dev            # Servidor de desarrollo
npm run build          # Build para producción
```

### Infraestructura
```bash
npm run terraform-init # Inicializar Terraform
npm run terraform-plan # Planificar cambios
npm run terraform-apply # Aplicar infraestructura
npm run deploy         # Build + Deploy completo
```

## 🔐 Autenticación

### Desarrollo
- Usa infraestructura AWS existente (`.env.local`)
- Google OAuth client compartido
- Testing inmediato sin setup AWS

### Producción  
- Terraform crea Cognito User Pool único
- Mismo Google OAuth client (multiple callback URLs)
- Infraestructura completamente independiente

### Flujo de Auth
```
Usuario → Google OAuth → Cognito → JWT → App protegida
```

## 🏗️ Estructura del Proyecto

```
aws-template-app/
├── 📱 app/                    # Next.js frontend
│   ├── components/            # Componentes React
│   ├── pages/                 # Páginas Next.js
│   ├── lib/                   # Utilidades y hooks
│   └── config/                # Configuración generada
├── 🏗️ terraform/             # Infraestructura IaC
│   ├── backend/               # Cognito, Lambda, RDS
│   ├── frontend/              # S3, CloudFront, ACM
│   └── bedrock/               # Permisos IA
├── 🐳 fastapi-backend/        # API Python
├── ⚙️ scripts/               # Automatización
├── 🚀 .github/workflows/     # CI/CD
└── 📝 config/                # Sistema de configuración
```

## 🎯 Características Enterprise

### DevOps & CI/CD
- **GitHub Actions** con 6 etapas automatizadas
- **Security scanning**: TFLint, tfsec, Checkov
- **Cost analysis**: Infracost integration
- **Artifact management**: Plan storage y state backup
- **Environment protection**: Approval workflows

### Seguridad
- **JWT validation** con Cognito public keys
- **Route guards** automáticos
- **Environment variables** para secretos
- **Container security** non-root execution

### Escalabilidad
- **CloudFront CDN** global
- **Auto Scaling Groups** en Kubernetes
- **RDS Multi-AZ** para alta disponibilidad
- **Lambda functions** serverless

## 🔄 Crear Nueva Aplicación

```bash
# 1. Clonar template
git clone https://github.com/MatiasMartinez90/aws-template-app.git nueva-app
cd nueva-app

# 2. Configurar proyecto
npm run setup
# Responder preguntas interactivas

# 3. ¡Listo!
npm run dev
# Aplicación completamente configurada funcionando
```

## 📊 Costos Estimados

| Componente | Costo Mensual |
|------------|---------------|
| Cognito | ~$2.00 |
| S3 + CloudFront | ~$15.50 |
| Bedrock IAM | ~$0.05 |
| **Total** | **~$17.55/mes** |

*Costos calculados con Infracost para tráfico moderado*

## 🤝 Contribuir

1. Fork del repositorio
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: nueva funcionalidad'`)
4. Push branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- **Issues**: [GitHub Issues](https://github.com/MatiasMartinez90/aws-template-app/issues)
- **Documentación**: Ver archivos `CLAUDE.md`, `USAGE.md`, `PROJECT_STATUS.md`
- **Email**: matias@cloud-it.com.ar

---

⭐ **Si te gusta este proyecto, dale una estrella en GitHub!**

🎉 Generated with [Claude Code](https://claude.ai/code)