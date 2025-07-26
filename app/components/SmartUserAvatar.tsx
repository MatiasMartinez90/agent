import { useState, useEffect, useMemo } from 'react'
import { AVATAR_CONFIG, isMobileDevice, optimizeGoogleImageUrl, getFallbackDelay } from '../utils/avatarConfig'

interface SmartUserAvatarProps {
  user: any
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showBorder?: boolean
  borderColor?: string
  priority?: 'high' | 'normal' | 'low'
}

const SmartUserAvatar: React.FC<SmartUserAvatarProps> = ({ 
  user, 
  size = 'md', 
  className = '',
  showBorder = false,
  borderColor = 'border-slate-600',
  priority = 'normal'
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error' | 'timeout'>('loading')
  const [showFallback, setShowFallback] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  }

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(isMobileDevice())
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Get optimized picture URL
  const pictureUrl = useMemo(() => {
    const sources = [
      user?.picture,
      user?.signInUserSession?.idToken?.payload?.picture,
      user?.attributes?.picture
    ]
    
    for (const source of sources) {
      if (source && typeof source === 'string' && source.trim().length > 0) {
        return optimizeGoogleImageUrl(source.trim())
      }
    }
    return null
  }, [user])

  // Get user initials with improved logic
  const initials = useMemo(() => {
    // Try name first
    const name = user?.name || 
                 user?.signInUserSession?.idToken?.payload?.name || 
                 user?.attributes?.name ||
                 user?.signInUserSession?.idToken?.payload?.given_name
    
    if (name && typeof name === 'string') {
      const parts = name.trim().split(' ').filter(Boolean)
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      } else if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase()
      }
    }
    
    // Fallback to email
    const email = user?.email || 
                  user?.signInUserSession?.idToken?.payload?.email || 
                  user?.attributes?.email
    
    if (email && typeof email === 'string') {
      const emailPart = email.split('@')[0]
      return emailPart.slice(0, 2).toUpperCase()
    }
    
    return '👤'
  }, [user])

  // Get timeout based on priority and device
  const getTimeout = () => {
    const baseTimeout = isMobile ? AVATAR_CONFIG.LOAD_TIMEOUT * 0.7 : AVATAR_CONFIG.LOAD_TIMEOUT
    switch (priority) {
      case 'high': return baseTimeout * 0.5
      case 'low': return baseTimeout * 1.5
      default: return baseTimeout
    }
  }

  // Handle image loading with smart timeout
  useEffect(() => {
    if (!pictureUrl) {
      setImageState('error')
      setShowFallback(true)
      return
    }

    setImageState('loading')
    setShowFallback(false)

    const timeout = getTimeout()
    const fallbackDelay = getFallbackDelay()

    // Show fallback after delay (but keep trying to load)
    const fallbackTimer = setTimeout(() => {
      if (imageState === 'loading') {
        setShowFallback(true)
      }
    }, fallbackDelay)

    // Absolute timeout
    const absoluteTimer = setTimeout(() => {
      if (imageState === 'loading') {
        setImageState('timeout')
        setShowFallback(true)
      }
    }, timeout)

    // Preload image
    const img = new Image()
    
    img.onload = () => {
      clearTimeout(fallbackTimer)
      clearTimeout(absoluteTimer)
      setImageState('loaded')
      setShowFallback(false)
    }
    
    img.onerror = () => {
      clearTimeout(fallbackTimer)
      clearTimeout(absoluteTimer)
      setImageState('error')
      setShowFallback(true)
    }

    // Configure image loading
    img.crossOrigin = 'anonymous'
    img.referrerPolicy = 'no-referrer'
    img.src = pictureUrl

    return () => {
      clearTimeout(fallbackTimer)
      clearTimeout(absoluteTimer)
      img.onload = null
      img.onerror = null
    }
  }, [pictureUrl, isMobile, priority, imageState])

  const shouldShowImage = pictureUrl && imageState === 'loaded' && !showFallback

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 relative ${showBorder ? `border-2 ${borderColor}` : ''} ${className}`}>
      {shouldShowImage ? (
        <img 
          src={pictureUrl} 
          alt={initials}
          className="w-full h-full object-cover rounded-full transition-opacity duration-300"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          loading={priority === 'high' ? 'eager' : 'lazy'}
          draggable={false}
          style={{ 
            opacity: showFallback ? 0 : 1
          }}
        />
      ) : null}
      
      {/* Always render initials as fallback */}
      <span 
        className={`text-white font-medium ${textSizes[size]} select-none transition-opacity duration-300`}
        style={{ 
          opacity: shouldShowImage && !showFallback ? 0 : 1,
          position: shouldShowImage ? 'absolute' : 'static'
        }}
      >
        {initials}
      </span>
      
      {/* Loading indicator - only show briefly and not on mobile */}
      {!isMobile && imageState === 'loading' && !showFallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white opacity-70"></div>
        </div>
      )}
      
      {/* Debug indicators (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <>
          {imageState === 'timeout' && (
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-orange-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
              ⏱
            </div>
          )}
          {imageState === 'error' && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
              ❌
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SmartUserAvatar