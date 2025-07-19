#!/usr/bin/env node

// ============================================
// 🚀 TEMPLATE APP - APLICAR CONFIGURACIÓN
// ============================================

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = require('../config/project.config.js');

console.log('🔄 Aplicando configuración del proyecto...');

// Función para reemplazar variables en archivos
function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Archivo no encontrado: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const [search, replace] of Object.entries(replacements)) {
        if (content.includes(search)) {
            content = content.replace(new RegExp(search, 'g'), replace);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Actualizado: ${filePath}`);
    }
}

// Definir reemplazos para archivos del frontend
const frontendReplacements = {
    'CloudAcademy': config.branding.name,
    'PROYECTS': config.project.subtitle,
    'Template': config.branding.name,
    'APP': config.project.subtitle,
    'template.cloud-it.com.ar': config.domain.base,
    'Aplicación Template': config.project.displayName,
    'Template App': config.project.displayName
};

// Definir reemplazos para Terraform
const terraformReplacements = {
    'https://proyectos.cloudacademy.ar': config.domain.baseUrl,
    'https://template.cloud-it.com.ar': config.domain.baseUrl,
    'proyecto_template': `proyecto_${config.database.nameSuffix}`,
    'noreply@cloud-it.com.ar': config.email.fromEmail,
    'PostConfirmationFn-Template': `PostConfirmationFn-${config.project.name}`,
    'post_confirmation_lambda_role_template': `post_confirmation_lambda_role_${config.database.nameSuffix}`,
    'template-app': config.project.name
};

// Archivos del frontend a actualizar
const frontendFiles = [
    'app/pages/index.tsx',
    'app/pages/admin.tsx',
    'app/pages/signin.tsx',
    'app/components/AuthenticatedHeader.tsx'
];

// Archivos de Terraform a actualizar
const terraformFiles = [
    'terraform/backend/variables.tf',
    'terraform/backend/main.tf',
    'terraform/frontend/variables.tf',
    'terraform/frontend/main.tf'
];

console.log('📝 Actualizando archivos del frontend...');
frontendFiles.forEach(file => {
    replaceInFile(path.join(__dirname, '..', file), frontendReplacements);
});

console.log('🏗️  Actualizando archivos de Terraform...');
terraformFiles.forEach(file => {
    replaceInFile(path.join(__dirname, '..', file), terraformReplacements);
});

// Actualizar terraform.tfvars con valores de variables de entorno
console.log('🔧 Actualizando terraform.tfvars...');

const terraformVars = `# ============================================
# 🚀 ${config.project.displayName.toUpperCase()} - TERRAFORM VARIABLES
# ============================================
# Generado automáticamente: ${new Date().toISOString()}

# URLs de producción
production_callback_url = "${config.domain.baseUrl}"
production_logout_url = "${config.domain.baseUrl}"

# Base de datos
db_name = "proyecto_${config.database.nameSuffix}"
from_email = "${config.email.fromEmail}"

# Google OAuth (configurar en GitHub Secrets)
# google_client_id = "TU_GOOGLE_CLIENT_ID"
# google_client_secret = "TU_GOOGLE_CLIENT_SECRET"

# Database (configurar en GitHub Secrets)
# db_host = "TU_RDS_ENDPOINT"
# db_user = "TU_DB_USER"
# db_password = "TU_DB_PASSWORD"
`;

fs.writeFileSync('terraform/backend/terraform.tfvars', terraformVars);
console.log('✅ Actualizado: terraform/backend/terraform.tfvars');

// Crear archivo de configuración para Next.js
console.log('⚙️  Creando configuración para Next.js...');

const nextConfig = `// ============================================
// 🚀 ${config.project.displayName.toUpperCase()} - CONFIGURACIÓN NEXT.JS
// ============================================

export const appConfig = {
  name: '${config.branding.name}',
  displayName: '${config.project.displayName}',
  subtitle: '${config.project.subtitle}',
  domain: '${config.domain.base}',
  baseUrl: '${config.domain.baseUrl}',
  primaryColor: '${config.branding.primaryColor}',
  description: '${config.project.description}'
};

export default appConfig;
`;

fs.writeFileSync('app/config/app.config.js', nextConfig);
console.log('✅ Creado: app/config/app.config.js');

// Crear README personalizado
console.log('📚 Creando README personalizado...');

const readme = `# ${config.project.displayName}

${config.project.description}

## 🚀 Configuración

Este proyecto fue generado usando **Template App** - un template reutilizable para aplicaciones AWS.

### Variables de entorno

Copia \`.env.example\` a \`.env\` y configura las variables:

\`\`\`bash
cp .env.example .env
\`\`\`

### Configuración inicial

\`\`\`bash
# Instalar dependencias
npm install

# Configurar proyecto (si no se hizo antes)
./scripts/setup-project.sh

# Construir aplicación
npm run build
\`\`\`

### Deployment

\`\`\`bash
# Desplegar infraestructura
cd terraform/backend
terraform init
terraform plan
terraform apply

cd ../frontend  
terraform init
terraform plan
terraform apply
\`\`\`

## 🏗️ Arquitectura

- **Frontend**: Next.js con TypeScript y Tailwind CSS
- **Backend**: FastAPI con AWS Lambda
- **Database**: PostgreSQL en RDS
- **Auth**: AWS Cognito + Google OAuth
- **Infrastructure**: Terraform
- **Deployment**: GitHub Actions

## 🌐 URLs

- **Producción**: ${config.domain.baseUrl}
- **Staging**: https://staging.${config.domain.base} (si aplica)

## 📞 Soporte

Para soporte contactar a: ${config.email.fromEmail}
`;

fs.writeFileSync('README.md', readme);
console.log('✅ Creado: README.md');

console.log('');
console.log('🎉 ¡Configuración aplicada exitosamente!');
console.log('');
console.log(`📋 Resumen del proyecto:`);
console.log(`   Nombre: ${config.project.displayName}`);
console.log(`   Dominio: ${config.domain.base}`);
console.log(`   Marca: ${config.branding.name}`);
console.log(`   Base de datos: proyecto_${config.database.nameSuffix}`);
console.log('');
console.log('🔍 Archivos actualizados:');
console.log('   ✅ Frontend (branding y URLs)');
console.log('   ✅ Terraform (recursos únicos)');
console.log('   ✅ Variables de configuración');
console.log('   ✅ README personalizado');
console.log('');