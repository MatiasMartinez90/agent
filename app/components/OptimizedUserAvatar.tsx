import { useState, useEffect, useCallback, useMemo } from 'react'
import AvatarImage from './AvatarImage'

interface OptimizedUserAvatarProps {
  user: any
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showBorder?: boolean
  borderColor?: string
  fallbackDelay?: number
}

const OptimizedUserAvatar: React.FC<OptimizedUserAvatarProps> = ({ 
  user, 
  size = 'md', 
  className = '',
  showBorder = false,
  borderColor = 'border-slate-600',
  fallbackDelay = 3000
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error' | 'fallback'>('loading')
  const [showFallback, setShowFallback] = useState(false)

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

  // Get optimized picture URL
  const pictureUrl = useMemo(() => {
    const sources = [
      user?.picture,
      user?.signInUserSession?.idToken?.payload?.picture,
      user?.attributes?.picture
    ]
    
    for (const source of sources) {
      if (source && typeof source === 'string' && source.trim().length > 0) {
        let url = source.trim()
        
        // Optimize Google images
        // Only ensure HTTPS, don't modify Google URL structure
        url = url.replace(/^http:/, 'https:')
        
        return url
      }
    }
    return null
  }, [user])

  // Get user initials
  const initials = useMemo(() => {
    const name = user?.name || 
                 user?.signInUserSession?.idToken?.payload?.name || 
                 user?.attributes?.name ||
                 user?.signInUserSession?.idToken?.payload?.given_name
    
    const email = user?.email || 
                  user?.signInUserSession?.idToken?.payload?.email || 
                  user?.attributes?.email
    
    if (name) {
      return name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return '👤'
  }, [user])

  // Handle image loading with timeout fallback
  useEffect(() => {
    if (!pictureUrl) {
      setImageState('fallback')
      setShowFallback(true)
      return
    }

    setImageState('loading')
    setShowFallback(false)

    // Set up fallback timeout
    const fallbackTimer = setTimeout(() => {
      console.log('Avatar image timeout, showing fallback')
      setShowFallback(true)
    }, fallbackDelay)

    // Preload image
    const img = new Image()
    
    img.onload = () => {
      clearTimeout(fallbackTimer)
      setImageState('loaded')
      setShowFallback(false)
    }
    
    img.onerror = () => {
      clearTimeout(fallbackTimer)
      console.log('Avatar image failed to load:', pictureUrl)
      setImageState('error')
      setShowFallback(true)
    }

    // Configure and start loading
    img.crossOrigin = 'anonymous'
    img.referrerPolicy = 'no-referrer'
    img.src = pictureUrl

    return () => {
      clearTimeout(fallbackTimer)
      img.onload = null
      img.onerror = null
    }
  }, [pictureUrl, fallbackDelay])

  const shouldShowImage = pictureUrl && imageState === 'loaded' && !showFallback

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 relative ${showBorder ? `border-2 ${borderColor}` : ''} ${className}`}>
      {shouldShowImage ? (
        <AvatarImage 
          src={pictureUrl} 
          alt={initials}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <span className={`text-white font-medium ${textSizes[size]} select-none`}>
          {initials}
        </span>
      )}
      
      {/* Loading indicator - only show briefly */}
      {imageState === 'loading' && !showFallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white opacity-70"></div>
        </div>
      )}
    </div>
  )
}

export default OptimizedUserAvatar