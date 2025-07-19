import type { NextPage } from 'next'
import Router from 'next/router'

const Home: NextPage = () => {
  const moveToRequireAuthenticationPage = () => {
    Router.push('/admin')
  }

  const moveToExamplePage = () => {
    Router.push('/example')
  }

  const moveToCategory = (categoryId: number) => {
    // Unificar flujo de autenticación para todas las categorías
    switch(categoryId) {
      case 1: // RAG Bedrock - mantiene flujo directo
        Router.push('/rag-bedrock')
        break
      case 3: // Seguridad
        Router.push('/admin')
        break
      case 4: // Networks
        Router.push('/admin')
        break
      case 5: // Computo
        Router.push('/admin')
        break
      case 7: // Challenge para principiantes
        Router.push('/admin')
        break
      case 8: // DevOps
        Router.push('/admin')
        break
      case 9: // Bases de Datos
        Router.push('/admin')
        break
      default:
        // Para otras categorías, mostrar mensaje de "próximamente"
        alert('Esta categoría estará disponible próximamente')
    }
  }

  const categories = [
    {
      id: 1,
      title: "RAG Bedrock",
      description: "Construye chatbots inteligentes con Amazon Bedrock y RAG. Integra IA generativa con AWS para crear asistentes que entienden tus datos empresariales.",
      icon: "🧠",
      color: "bg-purple-500",
      courseCount: 8,
      level: "Intermedio-Avanzado",
      category: "IA & AWS"
    },
    {
      id: 3,
      title: "Seguridad",
      description: "AWS Security, IAM, WAF, CloudTrail y mejores prácticas de ciberseguridad en la nube. Protege tus workloads con herramientas nativas de AWS.",
      icon: "🔒",
      color: "bg-red-500",
      courseCount: 18,
      level: "Intermedio-Avanzado",
      category: "AWS Security"
    },
    {
      id: 4,
      title: "Networks",
      description: "AWS VPC, Route 53, CloudFront, Load Balancers y arquitectura de redes en la nube. Diseña infraestructuras resilientes y escalables.",
      icon: "🌐",
      color: "bg-blue-500",
      courseCount: 16,
      level: "Intermedio",
      category: "AWS Networking"
    },
    {
      id: 5,
      title: "Computo",
      description: "EC2, Lambda, ECS, Fargate y servicios de compute de AWS. Optimiza cargas de trabajo y implementa arquitecturas serverless eficientes.",
      icon: "💻",
      color: "bg-gray-500",
      courseCount: 20,
      level: "Básico-Avanzado",
      category: "AWS Compute"
    },
    {
      id: 6,
      title: "7 dias de devops challenges",
      description: "Bootcamp intensivo de DevOps con AWS. CodePipeline, CodeBuild, CodeDeploy, Infrastructure as Code y automatización durante 7 días completos.",
      icon: "🚀",
      color: "bg-green-500",
      courseCount: 7,
      level: "Intermedio-Avanzado",
      category: "DevOps Intensivo"
    },
    {
      id: 7,
      title: "AWS Cloud Practitioner",
      description: "Fundamentos de AWS Cloud Computing. Prepárate para la certificación oficial y domina servicios core de Amazon Web Services desde cero.",
      icon: "☁️",
      color: "bg-orange-500",
      courseCount: 24,
      level: "Principiante",
      category: "AWS Certificación"
    },
    {
      id: 8,
      title: "Devops",
      description: "CI/CD con AWS DevOps, Terraform, Docker, Kubernetes en EKS, monitoring con CloudWatch y cultura DevOps en equipos ágiles.",
      icon: "⚙️",
      color: "bg-indigo-500",
      courseCount: 28,
      level: "Intermedio-Avanzado",
      category: "DevOps Profesional"
    },
    {
      id: 9,
      title: "Databases",
      description: "RDS, DynamoDB, Aurora, ElastiCache y estrategias de datos en AWS. Diseña arquitecturas de bases de datos escalables y de alta disponibilidad.",
      icon: "🗄️",
      color: "bg-teal-500",
      courseCount: 15,
      level: "Básico-Avanzado",
      category: "AWS Databases"
    }
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header estilo Platzi */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <button 
                  onClick={() => Router.push('/')}
                  className="flex items-center hover:opacity-80 transition-opacity"
                >
                  <span className="text-2xl font-bold text-green-400">DemoApp</span>
                  <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded uppercase font-bold">DEMO</span>
                </button>
              </div>
              
            </div>
            
            {/* Navegación derecha */}
            <div className="flex items-center space-x-6">
              <button 
                onClick={moveToRequireAuthenticationPage}
                className="bg-white text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Acceder
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section estilo Platzi */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Aplicación DemoApp
            <br />
            <span className="text-green-400">Powered by AWS</span>
          </h1>
          <p className="text-xl text-gray-300 mb-16 max-w-4xl mx-auto">
            Creemos que en la práctica es donde realmente se aprende. Por eso creamos esta serie de proyectos, para que los hagas guiado por una asistente virtual con IA.
          </p>
        </div>

        {/* Sección de categorías */}
        <div className="mb-8">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="flex items-center space-x-3 mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h2 className="text-2xl font-bold text-white">Chequea las categorías</h2>
            </div>
            <p className="text-gray-400 max-w-2xl">
              Vas a encontrar proyectos desde lo básico, a lo avanzado hasta lo último que que está sonando.
            </p>
          </div>

          {/* Hero Course - RAG Bedrock */}
          <div className="mb-16 relative">
            {/* Glow effect background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-green-600/20 rounded-3xl blur-xl"></div>
            
            <div className="relative bg-gradient-to-br from-slate-800/90 via-slate-800/95 to-slate-900/90 backdrop-blur-sm border-2 border-purple-500/30 rounded-3xl p-10 overflow-hidden">
              {/* Background pattern */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row items-start justify-between mb-8">
                  <div className="flex-1 lg:pr-8">
                    {/* Badge con animación */}
                    <div className="flex items-center space-x-3 mb-6">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg animate-pulse">
                        🔥 CURSO ESTRELLA
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                        ✨ MÁS POPULAR
                      </span>
                    </div>

                    {/* Título impactante */}
                    <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                      DemoApp <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">App</span>
                    </h2>
                    
                    {/* Subtítulo con gancho */}
                    <p className="text-xl text-purple-200 font-semibold mb-4">
                      🚀 Construye el Chatbot del Futuro con IA Avanzada
                    </p>
                    
                    {/* Descripción persuasiva */}
                    <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                      Domina RAG (Retrieval Augmented Generation) con Amazon Bedrock. Aprende a crear chatbots que entienden 
                      <span className="text-purple-300 font-semibold"> TUS datos</span> y responden como expertos. 
                      <span className="text-green-400 font-semibold">Proyecto práctico incluido.</span>
                    </p>

                    {/* Beneficios clave */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                          ⚡
                        </div>
                        <span className="text-gray-300 font-medium">60 min proyecto práctico</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          🧠
                        </div>
                        <span className="text-gray-300 font-medium">IA + Amazon Bedrock</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                          💰
                        </div>
                        <span className="text-gray-300 font-medium">Costo: ~$0.01</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                          🎯
                        </div>
                        <span className="text-gray-300 font-medium">Nivel intermedio</span>
                      </div>
                    </div>

                    {/* CTA principal */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => Router.push('/bedrock')}
                        className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 text-white font-bold text-lg rounded-2xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative z-10 flex items-center justify-center space-x-2">
                          <span>🚀 Comenzar Proyecto Ahora</span>
                        </span>
                      </button>
                      
                      <button className="px-6 py-4 border-2 border-purple-400/50 text-purple-300 rounded-2xl font-semibold hover:bg-purple-500/20 hover:border-purple-400 transition-all duration-300">
                        📋 Ver Demo Completo
                      </button>
                    </div>
                  </div>

                  {/* Sidebar con social proof */}
                  <div className="lg:w-80 mt-8 lg:mt-0">
                    {/* Estudiantes activos */}
                    <div className="bg-slate-700/50 rounded-2xl p-6 mb-6 border border-slate-600/30">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400 text-sm font-medium">ESTUDIANTES ACTIVOS</span>
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-purple-500 border-2 border-slate-800"></div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 border-2 border-slate-800"></div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-green-500 border-2 border-slate-800"></div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 border-2 border-slate-800"></div>
                          <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-slate-800 flex items-center justify-center">
                            <span className="text-xs text-gray-300 font-bold">+50</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">127 estudiantes</div>
                      <div className="text-green-400 text-sm font-medium">+23 esta semana</div>
                    </div>

                    {/* Rating */}
                    <div className="bg-slate-700/50 rounded-2xl p-6 border border-slate-600/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-yellow-400 text-lg">⭐</span>
                          ))}
                        </div>
                        <span className="text-white font-bold text-lg">4.9</span>
                      </div>
                      <p className="text-gray-400 text-sm">&quot;Increíble curso de IA práctica&quot;</p>
                      <p className="text-gray-500 text-xs mt-1">- María González, Data Scientist</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de categorías */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div 
                key={category.id} 
                onClick={() => moveToCategory(category.id)}
                className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-700/50 hover:border-purple-500/30 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer relative overflow-hidden"
              >
                {/* Indicador de categoría */}
                <div className="absolute top-4 right-4">
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Header de la categoría */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`w-14 h-14 ${category.color} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {category.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-lg leading-tight group-hover:text-purple-300 transition-colors mb-1">
                      {category.title}
                    </h3>
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="px-2 py-1 bg-slate-700/50 rounded-full text-green-400 font-medium">
                        {category.courseCount} cursos
                      </span>
                      <span className="text-gray-500">
                        {category.level}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-3">
                  {category.description}
                </p>

                {/* Footer con CTA */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>Categoría</span>
                  </div>
                  <div className="flex items-center space-x-1 text-purple-400 group-hover:text-purple-300 transition-colors text-sm font-medium">
                    <span>Explorar</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-20 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">1000+</div>
              <div className="text-gray-300">Cursos disponibles</div>
            </div>
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">50k+</div>
              <div className="text-gray-300">Estudiantes activos</div>
            </div>
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">95%</div>
              <div className="text-gray-300">Tasa de satisfacción</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
