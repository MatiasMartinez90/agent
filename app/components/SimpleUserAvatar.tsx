import { useState, useEffect, useMemo } from 'react'

interface SimpleUserAvatarProps {
  user: any
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showBorder?: boolean
  borderColor?: string
}

const SimpleUserAvatar: React.FC<SimpleUserAvatarProps> = ({ 
  user, 
  size = 'md', 
  className = '',
  showBorder = false,
  borderColor = 'border-slate-600'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

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

  // Get picture URL
  const pictureUrl = useMemo(() => {
    const sources = [
      user?.picture,
      user?.signInUserSession?.idToken?.payload?.picture,
      user?.attributes?.picture
    ]
    
    for (const source of sources) {
      if (source && typeof source === 'string' && source.trim().length > 0) {
        return source.trim()
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
    
    if (name && typeof name === 'string') {
      const parts = name.trim().split(' ').filter(Boolean)
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      } else if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase()
      }
    }
    
    const email = user?.email || 
                  user?.signInUserSession?.idToken?.payload?.email || 
                  user?.attributes?.email
    
    if (email && typeof email === 'string') {
      const emailPart = email.split('@')[0]
      return emailPart.slice(0, 2).toUpperCase()
    }
    
    return '👤'
  }, [user])

  // Reset states when picture URL changes
  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
  }, [pictureUrl])

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageLoaded(false)
    setImageError(true)
  }

  const showImage = pictureUrl && imageLoaded && !imageError

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 relative ${showBorder ? `border-2 ${borderColor}` : ''} ${className}`}>
      {/* Image */}
      {pictureUrl && !imageError && (
        <img
          src={pictureUrl}
          alt={initials}
          className={`w-full h-full object-cover rounded-full ${showImage ? 'opacity-100' : 'opacity-0'}`}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          loading="eager"
          draggable={false}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
      
      {/* Initials - only show when image is not visible */}
      {!showImage && (
        <span className={`text-white font-medium ${textSizes[size]} select-none`}>
          {initials}
        </span>
      )}
    </div>
  )
}

export default SimpleUserAvatar