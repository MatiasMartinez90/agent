import { useState, useEffect, useMemo, useCallback } from 'react'
import { AVATAR_CONFIG, isMobileDevice, optimizeGoogleImageUrl, getFallbackDelay } from '../utils/avatarConfig'
import AvatarImage from './AvatarImage'

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
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading')
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
  const getTimeout = useCallback(() => {
    const baseTimeout = isMobile ? AVATAR_CONFIG.LOAD_TIMEOUT * 0.7 : AVATAR_CONFIG.LOAD_TIMEOUT
    switch (priority) {
      case 'high': return baseTimeout * 0.5
      case 'low': return baseTimeout * 1.5
      default: return baseTimeout
    }
  }, [isMobile, priority])

  // Simplified image loading logic
  useEffect(() => {
    if (!pictureUrl) {
      setImageState('error')
      return
    }

    setImageState('loading')

    const img = new Image()
    
    img.onload = () => {
      setImageState('loaded')
    }
    
    img.onerror = () => {
      setImageState('error')
    }

    // Configure image loading
    img.crossOrigin = 'anonymous'
    img.referrerPolicy = 'no-referrer'
    img.src = pictureUrl

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [pictureUrl])

  const shouldShowImage = pictureUrl && imageState === 'loaded'

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 relative ${showBorder ? `border-2 ${borderColor}` : ''} ${className}`}>
      {/* Image with proper conditional rendering */}
      {shouldShowImage && (
        <AvatarImage 
          src={pictureUrl} 
          alt={initials}
          className="w-full h-full object-cover rounded-full"
        />
      )}
      
      {/* Initials - only when no image is showing */}
      {!shouldShowImage && imageState !== 'loading' && (
        <span className={`text-white font-medium ${textSizes[size]} select-none`}>
          {initials}
        </span>
      )}
      
      {/* Loading state - show loading spinner or initials */}
      {imageState === 'loading' && !shouldShowImage && (
        <>
          {isMobile ? (
            <span className={`text-white font-medium ${textSizes[size]} select-none`}>
              {initials}
            </span>
          ) : (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white opacity-70"></div>
          )}
        </>
      )}
      
      {/* Debug indicators (development only) */}
      {process.env.NODE_ENV === 'development' && imageState === 'error' && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
          ❌
        </div>
      )}
    </div>
  )
}

export default SmartUserAvatar