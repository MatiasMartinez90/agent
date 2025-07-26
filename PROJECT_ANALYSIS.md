# 🚀 Agent Platform - Análisis Completo del Proyecto

## 📋 Tabla de Contenidos
- [Arquitectura General](#-arquitectura-general-del-proyecto)
- [Propósito de la Aplicación](#-propósito-de-la-aplicación)
- [Arquitectura Técnica](#-arquitectura-técnica-completa)
- [Frontend - Next.js](#frontend---nextjs)
- [Autenticación - AWS Cognito](#autenticación---aws-cognito)
- [Backend - Arquitectura Híbrida](#backend---arquitectura-híbrida)
- [Base de Datos - PostgreSQL](#base-de-datos---postgresql)
- [Infraestructura AWS](#️-infraestructura-aws-terraform)
- [Deployment y CI/CD](#-deployment-y-cicd)
- [Integración con IA](#-integración-con-ia-amazon-bedrock)
- [Integraciones Externas](#-integraciones-externas)
- [Flujo de Usuario](#-flujo-de-usuario-completo)
- [Stack Tecnológico](#️-tecnologías-y-servicios)
- [Características Destacadas](#-características-destacadas)

---

## 🏗️ **ARQUITECTURA GENERAL DEL PROYECTO**

La **Agent Platform** es una plataforma de agentes basada en un template reutilizable para aplicaciones AWS. Es esencialmente una **plataforma de entrevistas laborales con IA** que utiliza tecnologías modernas de cloud computing.

### Componentes Principales:
- **Frontend**: Next.js con TypeScript y Tailwind CSS
- **Backend**: FastAPI con AWS Lambda
- **Database**: PostgreSQL en RDS
- **Auth**: AWS Cognito + Google OAuth
- **Infrastructure**: Terraform
- **Deployment**: GitHub Actions
- **AI**: Amazon Bedrock (Claude 3 Sonnet)

---

## 🎯 **PROPÓSITO DE LA APLICACIÓN**

La aplicación es una **plataforma de selección de personal automatizada** que:

✅ **Funcionalidades Principales:**
- Permite a candidatos completar entrevistas laborales de forma digital
- Utiliza IA (Amazon Bedrock) para generar preguntas y evaluar respuestas
- Ofrece cursos interactivos sobre tecnologías cloud (RAG, VPC, seguridad, etc.)
- Proporciona un dashboard de progreso para usuarios
- Integra con sistemas externos como N8N para workflows

✅ **Beneficios:**
- Proceso 100% digital
- Disponible 24/7
- Resultados inmediatos
- Escalable y automatizado

---

## 🏛️ **ARQUITECTURA TÉCNICA COMPLETA**

### **Frontend - Next.js**

```
app/
├── pages/                    # Páginas de la aplicación
│   ├── index.tsx            # Landing page con CTA
│   ├── signin.tsx           # Página de login
│   ├── admin.tsx            # Dashboard administrativo
│   ├── bedrock.tsx          # Curso de RAG con Bedrock
│   ├── chat.tsx             # Interfaz de chat con IA
│   ├── dashboard.tsx        # Dashboard de usuario
│   ├── build-vpc.tsx        # Curso de VPC
│   ├── seguridad.tsx        # Curso de seguridad
│   ├── networks.tsx         # Curso de redes
│   ├── databases.tsx        # Curso de bases de datos
│   └── devops.tsx           # Curso de DevOps
├── components/              # Componentes React
│   ├── BedrockChatInterface.tsx  # Chat con IA
│   ├── AuthenticatedHeader.tsx   # Header autenticado
│   └── UserProgressDashboard.tsx # Dashboard de progreso
├── hooks/                   # Custom hooks
│   └── useBedrockChat.ts    # Hook para chat con Bedrock
├── lib/                     # Utilidades
│   ├── useEnv.ts           # Configuración de entorno
│   └── useUser.ts          # Gestión de usuarios
├── styles/                  # Estilos CSS/Tailwind
│   ├── globals.css         # Estilos globales
│   └── page.module.css     # Estilos modulares
└── config/                  # Configuración
    └── app.config.js       # Configuración de la app
```

**Tecnologías Frontend:**
- **Next.js 13** con TypeScript
- **Tailwind CSS 4.1.10** para estilos
- **AWS Amplify 4.3.14** para autenticación
- **SWR 1.2.2** para data fetching
- **React 18.2.0** con Hooks

**Características del Frontend:**
- **Static Site Generation (SSG)** con `next export`
- **Responsive Design** con Tailwind CSS
- **Autenticación integrada** con Amplify
- **Chat en tiempo real** con Bedrock
- **Dashboard interactivo** de progreso

---

### **Autenticación - AWS Cognito**

**Configuración completa:**
```javascript
// Cognito User Pool: us-east-1_MeClCiUAC
// Client ID: 2sfsss72kin03gbilraa1pvlb5
// Domain: agent-auth-2sc4m5q6.auth.us-east-1.amazoncognito.com

Amplify.configure({
  Auth: {
    region: 'us-east-1',
    userPoolId: env.cognitoUserPoolId,
    userPoolWebClientId: env.cognitoUserPoolWebClientId,
    oauth: {
      domain: env.cognitoDomain,
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: window.location.origin + '/admin',
      redirectSignOut: window.location.origin,
      responseType: 'code',
      options: {
        AdvancedSecurityDataCollectionFlag: false,
      }
    }
  }
})
```

**Flujo de autenticación:**
1. **Google OAuth** como proveedor principal
2. **Post-confirmation Lambda** crea perfil en PostgreSQL
3. **JWT tokens** para autorización en APIs
4. **Email de bienvenida** automático via SES
5. **Atributos personalizados**: name, picture, email

**Configuración de Cognito:**
- **Username attributes**: email
- **Auto-verified attributes**: email
- **Password policy**: mínimo 8 caracteres
- **Lambda triggers**: PostConfirmation
- **Identity providers**: Google
- **OAuth flows**: Authorization code

---

### **Backend - Arquitectura Híbrida**

#### **1. AWS Lambda Functions**

**postConfirmation.py - Trigger de Cognito:**
```python
def lambda_handler(event, context):
    """
    Handler para el post-confirmation trigger de Cognito
    Crea un perfil de usuario en PostgreSQL cuando se confirma el registro
    """
    # Funcionalidades:
    # - Extrae datos del usuario del evento de Cognito
    # - Crea perfil en PostgreSQL con datos de Google OAuth
    # - Envía email de bienvenida personalizado via SES
    # - Maneja errores sin fallar el proceso de registro
```

**getUserProgress.py - API de progreso:**
```python
def lambda_handler(event, context):
    """
    Lambda function para obtener el progreso de cursos de un usuario
    GET /api/users/me/progress
    """
    # Funcionalidades:
    # - Consulta progreso de cursos por usuario
    # - Estadísticas agregadas y detalladas
    # - Integración con PostgreSQL
    # - CORS habilitado para frontend
```

**Dependencias Lambda:**
```
psycopg2-binary  # PostgreSQL driver
boto3            # AWS SDK
```

#### **2. FastAPI Backend (Kubernetes)**

**Estructura del backend FastAPI:**
```python
fastapi-backend/
├── app/
│   ├── main.py              # Aplicación principal FastAPI
│   ├── api/
│   │   └── chat.py          # Endpoints de chat con IA
│   ├── auth/
│   │   └── cognito_auth.py  # Autenticación JWT con Cognito
│   ├── agents/              # Agentes de IA especializados
│   │   ├── base_agent.py    # Clase base para agentes
│   │   └── bedrock_agent.py # Agente especializado en Bedrock
│   ├── models/              # Modelos Pydantic
│   │   └── chat_models.py   # Modelos para chat y respuestas
│   └── config/
│       └── settings.py      # Configuración con Pydantic Settings
├── k8s/                     # Manifiestos Kubernetes
│   ├── deployment.yaml      # Deployment de la aplicación
│   ├── service.yaml         # Service para exposición
│   ├── ingress.yaml         # Ingress para routing
│   ├── configmap.yaml       # ConfigMap para configuración
│   ├── secret.yaml          # Secrets para credenciales
│   ├── hpa.yaml             # Horizontal Pod Autoscaler
│   └── networkpolicy.yaml   # Políticas de red
├── Dockerfile               # Imagen Docker optimizada
└── requirements.txt         # Dependencias Python
```

**Funcionalidades del backend:**
- **Chat con IA** usando Amazon Bedrock (Claude 3 Sonnet)
- **Autenticación JWT** con verificación de tokens Cognito
- **Agentes especializados** por curso con system prompts
- **CORS configurado** para frontend
- **Health checks** para Kubernetes probes
- **Logging estructurado** para monitoreo

**Dependencias FastAPI:**
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pyjwt[crypto]==2.8.0
requests==2.31.0
boto3==1.29.0
pydantic==2.5.0
pydantic-settings==2.1.0
python-multipart==0.0.6
python-dotenv==1.0.0
```

---

### **Base de Datos - PostgreSQL**

**Esquema principal:**
```sql
-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de progreso de cursos de usuarios
CREATE TABLE IF NOT EXISTS user_course_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(255) NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE NULL,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_id ON user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_course_id ON user_course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_last_accessed ON user_course_progress(last_accessed DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_course_progress_updated_at
    BEFORE UPDATE ON user_course_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Características de la BD:**
- **RDS PostgreSQL** en AWS
- **Triggers automáticos** para updated_at
- **Índices optimizados** para consultas frecuentes
- **Relaciones FK** con cascada
- **UUIDs** como primary keys
- **Constraints** para integridad de datos

---

## ☁️ **INFRAESTRUCTURA AWS (Terraform)**

### **Backend Infrastructure**
```hcl
# terraform/backend/main.tf
terraform {
  backend "s3" {
    bucket         = "terraform-state-bucket-vz26twi7"
    key            = "agent/backend/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-lock-table"
  }
}

# Recursos principales:
- AWS Cognito User Pool + Client
- Google Identity Provider configuration
- Lambda Functions (PostConfirmation)
- IAM Roles y Policies para Lambda
- S3 para almacenamiento de código Lambda
- SES configuration para emails
```

**Variables del backend:**
```hcl
variable "project_name" {
  description = "Project name for unique resource naming"
  type        = string
  default     = "agent"
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  sensitive   = true
}

# Variables para PostgreSQL RDS
variable "db_host" { ... }
variable "db_name" { ... }
variable "db_user" { ... }
variable "db_password" { ... }
```

### **Frontend Infrastructure**
```hcl
# terraform/frontend/main.tf
terraform {
  backend "s3" {
    bucket         = "terraform-state-bucket-vz26twi7"
    key            = "agent/frontend/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-lock-table"
  }
}

# Recursos principales:
- S3 Bucket para hosting estático
- CloudFront Distribution con CDN global
- ACM Certificate para SSL/TLS
- CloudFront Function para URL rewrites
- Origin Access Identity para seguridad S3
```

**Características de la infraestructura:**
- **S3 Static Hosting** con encriptación
- **CloudFront CDN** con certificado SSL
- **Security headers** y políticas restrictivas
- **Cost optimization** con PriceClass_All
- **IPv6 enabled** para mejor alcance global

### **Estado de Terraform**
```
Backend S3: terraform-state-bucket-vz26twi7
DynamoDB Lock: terraform-lock-table
Keys:
- agent/backend/terraform.tfstate
- agent/frontend/terraform.tfstate
```

---

## 🚀 **DEPLOYMENT Y CI/CD**

### **GitHub Actions Workflows**

#### **1. Frontend Deployment**
```yaml
# .github/workflows/deploy-nextjs.yml
name: Build and Deploy Next.js to S3

# Triggers:
- push a main/develop/feature branches
- cambios en app/** o workflow
- workflow_dispatch manual

# Pasos:
1. Checkout code
2. Setup Node.js 20
3. Install dependencies (root + app)
4. Apply template configuration
5. Set environment variables
6. Build static site (next export)
7. Create env.json con valores deployados
8. Configure AWS credentials
9. Deploy to S3 con sync
10. CloudFront invalidation (comentado para ahorrar costos)
```

#### **2. Terraform Backend**
```yaml
# .github/workflows/terraform-backend.yml
name: 🏗️ Terraform Backend Infrastructure

# Stages:
1. 🧹 Code Quality & Validation
   - Terraform format check
   - Terraform validate
   - TFLint analysis
   - Lambda ZIP building con Docker

2. 🔐 Security & Compliance
   - tfsec security scan
   - Checkov compliance analysis
   - SARIF output para GitHub Security

3. 💰 Cost Analysis
   - Infracost cost estimation
   - Cost breakdown por recurso

4. 📋 Terraform Plan
   - Plan generation con variables
   - Plan artifact upload

5. 🚀 Terraform Apply
   - Auto-apply en main branch
   - Production environment protection
```

#### **3. Terraform Frontend**
```yaml
# .github/workflows/terraform-frontend.yml
name: Terraform Frontend CI/CD Pipeline

# Similar structure con:
- Code validation
- Security scanning
- Cost analysis
- Infrastructure deployment
- Manual approval (disabled)
```

**Características del CI/CD:**
- **Multi-stage pipelines** con gates de calidad
- **Security scanning** integrado
- **Cost analysis** antes del deployment
- **Artifact management** para plans y states
- **Environment protection** para producción
- **Parallel execution** para eficiencia

---

## 🤖 **INTEGRACIÓN CON IA (Amazon Bedrock)**

### **Agente Bedrock Especializado**
```python
class BedrockRAGAgent(BaseAgent):
    """
    Specialized agent for RAG Bedrock course
    """
    
    def __init__(self):
        super().__init__(course_id="bedrock-rag", model_id="anthropic.claude-3-sonnet-20240229-v1:0")
        self.bedrock_client = self._init_bedrock_client()
    
    def _get_system_prompt(self) -> str:
        """System prompt for RAG Bedrock course assistant"""
        return """
        Eres un asistente especializado en el curso "RAG con Amazon Bedrock".
        
        CONOCIMIENTOS PRINCIPALES:
        - Amazon Bedrock y sus modelos de IA (Claude, Titan, etc.)
        - RAG (Retrieval Augmented Generation) técnicas y arquitecturas
        - Knowledge Bases en Bedrock
        - Amazon S3 para almacenamiento de documentos
        - Amazon OpenSearch para búsqueda vectorial
        - Embeddings y búsqueda semántica
        
        PASOS DEL CURSO:
        Step #0: Introducción al RAG y conceptos básicos
        Step #1: Configuración de Knowledge Base en Bedrock
        Step #2: Configuración de S3 y subida de documentos
        Step #3: Conexión entre S3 y Knowledge Base
        Step #4: Selección y configuración de modelos de IA
        Step #5: Sincronización y indexación de datos
        Step #6: Testing y optimización del chatbot
        """
```

### **Cursos Soportados**
```python
supported_courses = [
    "bedrock-rag",    # RAG con Amazon Bedrock
    "seguridad",      # Seguridad en la nube
    "networks",       # Redes y VPC
    "databases",      # Bases de datos
    "devops"          # DevOps y CI/CD
]
```

**Características del Chat con IA:**
- **Context-aware responses** basadas en el step del curso
- **Conversation history** para continuidad
- **Specialized prompts** por curso
- **Error handling** robusto
- **Token optimization** para costos
- **Real-time streaming** de respuestas

---

## 🔗 **INTEGRACIONES EXTERNAS**

### **N8N Webhook**
```
URL: https://n8n.cloud-it.com.ar/webhook/cc4a018d-d373-4e35-88fe-547271539ae9
Propósito: Workflows automatizados y notificaciones
```

### **Dominios y URLs**
- **Producción**: https://agent.cloud-it.com.ar
- **Staging**: https://staging.agent.cloud-it.com.ar (si aplica)
- **API Backend**: https://api.cloudacademy.ar
- **N8N Workflows**: https://n8n.cloud-it.com.ar

### **Servicios Externos**
- **Google OAuth**: Autenticación social
- **AWS SES**: Email delivery
- **CloudFlare**: DNS management (manual)
- **GitHub**: Source control y CI/CD

---

## 📊 **FLUJO DE USUARIO COMPLETO**

### **1. Onboarding Flow**
```
Landing Page → CTA "Comenzar Entrevista" → Google OAuth → 
Post-confirmation Lambda → Email bienvenida → Dashboard
```

### **2. Learning Flow**
```
Dashboard → Selección de curso → Chat con IA → 
Progreso tracking → Completación → Certificado
```

### **3. Technical Flow**
```
Frontend (Next.js) → Cognito Auth → JWT Token → 
FastAPI Backend → Bedrock Agent → PostgreSQL → 
Progress Update → Real-time UI
```

**Pasos detallados:**

1. **Landing Page** → Usuario ve CTA "Comenzar Entrevista"
2. **Google OAuth** → Login via Cognito + Google
3. **Post-confirmation** → Lambda crea perfil + email bienvenida
4. **Dashboard** → Usuario ve cursos disponibles y progreso
5. **Chat con IA** → Interacción con agente Bedrock especializado
6. **Progreso** → Tracking en PostgreSQL
7. **Completación** → Certificados y siguiente nivel

---

## 🛠️ **TECNOLOGÍAS Y SERVICIOS**

### **Frontend Stack**
- **Next.js 13** + TypeScript
- **Tailwind CSS 4.1.10**
- **AWS Amplify 4.3.14** (Auth)
- **SWR 1.2.2** (Data fetching)
- **React 18.2.0** (UI Framework)

### **Backend Stack**
- **FastAPI 0.104.1** + Python 3.11
- **AWS Lambda** (Serverless functions)
- **PostgreSQL** (RDS Database)
- **Amazon Bedrock** (AI/ML)
- **Pydantic 2.5.0** (Data validation)

### **Infrastructure Stack**
- **Terraform 1.5.0** (Infrastructure as Code)
- **AWS** (Cloud provider)
- **Kubernetes** (Container orchestration)
- **GitHub Actions** (CI/CD)
- **Docker** (Containerization)

### **AWS Services Utilizados**
- **Cognito** - Authentication & Authorization
- **Lambda** - Serverless compute
- **RDS PostgreSQL** - Managed database
- **S3** - Object storage & static hosting
- **CloudFront** - Content Delivery Network
- **SES** - Email service
- **Bedrock** - AI/ML models
- **ACM** - SSL certificate management
- **IAM** - Identity & Access Management

### **Development Tools**
- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TFLint** - Terraform linting
- **tfsec** - Security scanning
- **Checkov** - Compliance scanning
- **Infracost** - Cost analysis

---

## 🎯 **CARACTERÍSTICAS DESTACADAS**

### **1. Template Reutilizable**
- Configuración via variables de entorno
- Branding personalizable
- Multi-proyecto support
- Easy deployment process

### **2. Arquitectura Escalable**
- **Serverless** para cost optimization
- **Kubernetes** para container workloads
- **CDN** para global performance
- **Auto-scaling** configurado

### **3. Security First**
- **JWT authentication** con Cognito
- **HTTPS everywhere** con ACM certificates
- **IAM roles** con least privilege
- **Security scanning** en CI/CD
- **CORS** properly configured

### **4. Developer Experience**
- **TypeScript** para type safety
- **Hot reloading** en desarrollo
- **Comprehensive logging**
- **Health checks** integrados
- **Error handling** robusto

### **5. Cost Optimization**
- **Static hosting** en S3
- **Serverless functions** para backend
- **CDN caching** para performance
- **Cost analysis** en CI/CD
- **Resource tagging** para tracking

### **6. Monitoring & Observability**
- **Health endpoints** para K8s
- **Structured logging**
- **Error tracking**
- **Performance monitoring**
- **Cost monitoring**

---

## 📈 **MÉTRICAS Y RENDIMIENTO**

### **Estimated Monthly Costs**
- **S3 Hosting**: ~$5.00/month
- **CloudFront CDN**: ~$10.00/month
- **Route53 DNS**: ~$0.50/month
- **Lambda Functions**: ~$2.00/month
- **RDS PostgreSQL**: ~$15.00/month
- **Bedrock API calls**: Variable según uso
- **Total estimado**: $30-50/month

### **Performance Targets**
- **Page Load Time**: < 2 segundos
- **API Response Time**: < 500ms
- **Chat Response Time**: < 3 segundos
- **Uptime**: 99.9%
- **CDN Cache Hit Rate**: > 90%

---

## 🔮 **ROADMAP Y MEJORAS FUTURAS**

### **Próximas Funcionalidades**
- [ ] Más cursos especializados
- [ ] Sistema de certificaciones
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Multi-language support

### **Optimizaciones Técnicas**
- [ ] Database connection pooling
- [ ] Redis caching layer
- [ ] WebSocket para real-time chat
- [ ] Advanced monitoring con Datadog
- [ ] A/B testing framework

---

## 📞 **SOPORTE Y CONTACTO**

- **Email**: noreply@cloud-it.com.ar
- **Documentación**: Este archivo
- **Repository**: GitHub (privado)
- **Team**: CloudAcademy Team

---

*Documento generado automáticamente el $(date) por Kiro AI Assistant*