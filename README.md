# Agent Platform

Agent Platform basada en Template App

## 🚀 Configuración

Este proyecto fue generado usando **Template App** - un template reutilizable para aplicaciones AWS.

### Variables de entorno

Copia `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

### Configuración inicial

```bash
# Instalar dependencias
npm install

# Configurar proyecto (si no se hizo antes)
./scripts/setup-project.sh

# Construir aplicación
npm run build
```

### Deployment

```bash
# Desplegar infraestructura
cd terraform/backend
terraform init
terraform plan
terraform apply

cd ../frontend  
terraform init
terraform plan
terraform apply
```

## 🏗️ Arquitectura

- **Frontend**: Next.js con TypeScript y Tailwind CSS
- **Backend**: FastAPI con AWS Lambda
- **Database**: PostgreSQL en RDS
- **Auth**: AWS Cognito + Google OAuth
- **Infrastructure**: Terraform
- **Deployment**: GitHub Actions

## 🌐 URLs

- **Producción**: https://agent.cloud-it.com.ar
- **Staging**: https://staging.agent.cloud-it.com.ar (si aplica)

## 📞 Soporte

Para soporte contactar a: noreply@cloud-it.com.ar
