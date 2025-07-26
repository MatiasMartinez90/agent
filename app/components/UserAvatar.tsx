import { useState, useEffect, useCallback, useMemo } from 'react'

interface UserAvatarProps {
  user: any
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showBorder?: boolean
  borderColor?: string
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md', 
  className = '',
  showBorder = false,
  borderColor = 'border-slate-600'
}) => {

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

  // Get user picture from different possible sources with fallbacks
  const pictureUrl = useMemo(() => {
    const sources = [
      user?.picture,
      user?.signInUserSession?.idToken?.payload?.picture,
      user?.attributes?.picture,
      // Try to get from localStorage as backup
      (() => {
        try {
          if (typeof window === 'undefined') return null
          const clientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_WEB_CLIENT_ID || '7ho22jco9j63c3hmsrsp4bj0ti'
          const lastAuthUser = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`)
          if (lastAuthUser) {
            const idTokenKey = `CognitoIdentityServiceProvider.${clientId}.${lastAuthUser}.idToken`
            const token = localStorage.getItem(idTokenKey)
            if (token) {
              const payload = JSON.parse(atob(token.split('.')[1]))
              return payload.picture
            }
          }
        } catch (e) {
          console.log('Could not get picture from localStorage:', e)
        }
        return null
      })()
    ]
    
    // Return first valid URL
    for (const source of sources) {
      if (source && typeof source === 'string' && source.trim().length > 0) {
        // Ensure HTTPS and add size parameter for Google images
        let url = source.trim()
        if (url.includes('googleusercontent.com')) {
          // Add size parameter for better loading and remove existing size params
          url = url.replace(/=s\d+/, '') + '=s96'
          // Ensure HTTPS
          url = url.replace(/^http:/, 'https:')
        }
        return url
      }
    }
    return null
  }, [user])

  // Simple image loading state
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Reset error state when user changes
  useEffect(() => {
    setImageError(false)
    setImageLoading(true)
  }, [pictureUrl])

  const handleImageError = useCallback(() => {
    console.log('Error loading user image:', pictureUrl)
    setImageError(true)
    setImageLoading(false)
  }, [pictureUrl])

  const handleImageLoad = useCallback(() => {
    console.log('User image loaded successfully:', pictureUrl)
    setImageLoading(false)
    setImageError(false)
  }, [pictureUrl])

  // Get user name from different possible sources
  const getUserName = useCallback(() => {
    const sources = [
      user?.name,
      user?.signInUserSession?.idToken?.payload?.name,
      user?.attributes?.name,
      user?.signInUserSession?.idToken?.payload?.given_name,
      user?.signInUserSession?.idToken?.payload?.nickname,
      // Combine given_name + family_name if available
      user?.signInUserSession?.idToken?.payload?.given_name && user?.signInUserSession?.idToken?.payload?.family_name 
        ? `${user.signInUserSession.idToken.payload.given_name} ${user.signInUserSession.idToken.payload.family_name}`
        : null
    ]
    
    for (const source of sources) {
      if (source && typeof source === 'string' && source.trim().length > 0) {
        return source.trim()
      }
    }
    return null
  }, [user])

  // Get user email from different possible sources
  const getUserEmail = useCallback(() => {
    const sources = [
      user?.email,
      user?.signInUserSession?.idToken?.payload?.email,
      user?.attributes?.email
    ]
    
    for (const source of sources) {
      if (source && typeof source === 'string' && source.trim().length > 0) {
        return source.trim()
      }
    }
    return null
  }, [user])

  // Get user initials as fallback
  const getUserInitials = useCallback(() => {
    const name = getUserName()
    const email = getUserEmail()
    
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
  }, [getUserName, getUserEmail])

  const name = getUserName()
  const email = getUserEmail()
  const initials = getUserInitials()

  // Debug logging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('UserAvatar Debug:', {
        user,
        pictureUrl,
        name,
        email,
        initials,
        imageLoaded,
        imageError,
        imageLoading,
        retryCount,
        userKeys: user ? Object.keys(user) : 'no user',
        tokenPayload: user?.signInUserSession?.idToken?.payload
      })
    }
  }, [user, pictureUrl, name, email, initials, imageLoaded, imageError, imageLoading, retryCount])

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 relative ${showBorder ? `border-2 ${borderColor}` : ''} ${className}`}>
      {pictureUrl && !imageError ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={pictureUrl} 
            alt={name || email || 'Usuario'} 
            className="w-full h-full object-cover rounded-full"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            loading="eager"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white opacity-70"></div>
            </div>
          )}
        </>
      ) : (
        <span className={`text-white font-medium ${textSizes[size]} select-none`}>
          {initials}
        </span>
      )}
      
      {/* Error indicator for debugging */}
      {process.env.NODE_ENV === 'development' && imageError && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
          ❌
        </div>
      )}
    </div>
  )
}

export default UserAvatar