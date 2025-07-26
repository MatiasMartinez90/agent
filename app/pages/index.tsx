import type { NextPage } from 'next'
import Router from 'next/router'

const Home: NextPage = () => {
  const startProcess = () => {
    Router.push('/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900">
      {/* Header moderno */}
      <header className="bg-slate-800/30 backdrop-blur-lg border-b border-slate-700/30">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <button 
                  onClick={() => Router.push('/')}
                  className="flex items-center hover:opacity-80 transition-opacity"
                >
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    RRHH Agent
                  </span>
                </button>
              </div>
            </div>
            
            {/* Navegación derecha */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={startProcess}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Badge de AI */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border border-orange-500/30 backdrop-blur-sm">
              <img src="/anthropic-logo.svg" alt="Anthropic" className="w-4 h-4 mr-2" />
              Powered by Anthropic
            </span>
          </div>

          {/* Título principal */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
            Inicia tu Proceso de
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Selección con IA
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Completa tu entrevista laboral de forma rápida y eficiente.
            <br />
            Nuestro asistente de IA te guiará paso a paso.
          </p>

          {/* CTA Principal */}
          <div className="mb-20">
            <button 
              onClick={startProcess}
              className="group relative inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-bold text-xl rounded-2xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center space-x-3">
                <span>🚀 Comenzar Entrevista</span>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>

          {/* Beneficios del proceso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-700/40 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto">
                💻
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Proceso 100% Digital</h3>
              <p className="text-slate-400 leading-relaxed">
                Sin papeles, sin complicaciones. Todo desde tu computadora o móvil.
              </p>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-700/40 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto">
                ⏰
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Disponible 24/7</h3>
              <p className="text-slate-400 leading-relaxed">
                Realiza tu entrevista cuando te sea más conveniente, sin horarios.
              </p>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-700/40 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Resultados Inmediatos</h3>
              <p className="text-slate-400 leading-relaxed">
                Obtén feedback instantáneo y conoce el siguiente paso al finalizar.
              </p>
            </div>
          </div>

          {/* Cómo funciona */}
          <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 backdrop-blur-sm border border-slate-600/30 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-white mb-8">¿Cómo funciona?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Inicia Sesión</h3>
                <p className="text-slate-400">Accede con tu cuenta de Google de forma segura</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Conversa con IA</h3>
                <p className="text-slate-400">Nuestro asistente te hará preguntas personalizadas</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Recibe Feedback</h3>
                <p className="text-slate-400">Obtén evaluación inmediata y próximos pasos</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
