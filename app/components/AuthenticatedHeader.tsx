import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface AuthenticatedHeaderProps {
  user: any
  signOut: ((options: { redirect?: string }) => Promise<void>) | ((data?: any) => void)
}

export default function AuthenticatedHeader({ user, signOut }: AuthenticatedHeaderProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Extract user attributes from JWT token
  const getTokenPayload = () => {
    try {
      if (user?.signInUserSession?.idToken?.payload) {
        return user.signInUserSession.idToken.payload
      }
      return null
    } catch (error) {
      console.error('Error extracting token payload:', error)
      return null
    }
  }

  const tokenPayload = getTokenPayload()

  const handleSignOut = () => {
    setIsMenuOpen(false)
    if (signOut.length > 0) {
      (signOut as (options: { redirect?: string }) => Promise<void>)({ redirect: '/' })
    } else {
      (signOut as () => void)()
    }
  }

  const menuItems = [
    {
      icon: '📚',
      label: 'Cursos',
      onClick: () => {
        setIsMenuOpen(false)
        router.push('/admin')
      }
    },
    {
      icon: '📊',
      label: 'Mi Progreso',
      onClick: () => {
        setIsMenuOpen(false)
        router.push('/dashboard')
      }
    },
    {
      icon: '🚪',
      label: 'Cerrar Sesión',
      onClick: handleSignOut,
      danger: true
    }
  ]
  
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 relative">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <span className="text-2xl font-bold text-green-400">DemoApp</span>
                <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded uppercase font-bold">DEMO</span>
              </button>
            </div>
          </div>
          
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-xl hover:bg-slate-700/50 transition-all duration-200 group"
            >
              {/* User Avatar */}
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-600 group-hover:border-green-400/70 transition-colors">
                {tokenPayload?.picture ? (
                  <img 
                    src={tokenPayload.picture} 
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                    {tokenPayload?.name?.charAt(0)?.toUpperCase() || tokenPayload?.email?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Dropdown Arrow - Hidden on mobile */}
              <svg 
                className={`hidden md:block w-4 h-4 text-gray-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Mobile Dropdown */}
            {isMenuOpen && isMobile && (
              <div className="absolute right-2 top-12 w-12 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50">
                <div className="py-1">
                  {menuItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={item.onClick}
                      title={item.label}
                      className={`w-full flex items-center justify-center py-3 hover:bg-slate-700 transition-colors ${
                        item.danger 
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20' 
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      {isMenuOpen && !isMobile && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsMenuOpen(false)} />
          
          {/* Sidebar Panel */}
          <div className="absolute right-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-white font-semibold text-lg">Menu</h3>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-400/30">
                  {tokenPayload?.picture ? (
                    <img 
                      src={tokenPayload.picture} 
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-xl">
                      {tokenPayload?.name?.charAt(0)?.toUpperCase() || tokenPayload?.email?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm truncate">
                    {tokenPayload?.name || tokenPayload?.given_name || tokenPayload?.email?.split('@')[0]}
                  </div>
                  <div className="text-gray-400 text-xs truncate">
                    {tokenPayload?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-4">
              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className={`w-full flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors ${
                      item.danger 
                        ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' 
                        : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                      <span className="text-xl">{item.icon}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">
                        {item.label === 'Cursos' && 'Accede a todos los cursos'}
                        {item.label === 'Mi Progreso' && 'Ve tu avance y estadísticas'}
                        {item.label === 'Cerrar Sesión' && 'Salir de la aplicación'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop para cerrar en mobile */}
      {isMenuOpen && isMobile && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setIsMenuOpen(false)} />
      )}
    </header>
  )
}