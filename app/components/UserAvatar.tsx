import { useState, useEffect, useCallback, useMemo } from 'react'
import { AvatarCache } from '../utils/avatarCache'

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
          // Silent fail for localStorage access
        }
        return null
      })()
    ]
    
    // Return first valid URL with improvements
    for (const source of sources) {
      if (source && typeof source === 'string' && source.trim().length > 0) {
        let url = source.trim()
        
        // Ensure HTTPS
        url = url.replace(/^http:/, 'https:')
        
        // For Google images, ensure we use a reliable size parameter
        if (url.includes('googleusercontent.com')) {
          // Remove existing size parameters and add reliable ones
          url = url.replace(/[?&]s=\d+/g, '').replace(/[?&]sz=\d+/g, '')
          // Add consistent size parameter
          const separator = url.includes('?') ? '&' : '?'
          url = `${url}${separator}s=96`
        }
        
        return url
      }
    }
    return null
  }, [user])

  // Enhanced image loading state with retry mechanism
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [cachedAvatar, setCachedAvatar] = useState<string | null>(null)

  // Get user email for cache key
  const userEmail = useMemo(() => {
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

  // Reset error state when user changes and check cache
  useEffect(() => {
    setImageError(false)
    setImageLoading(true)
    setRetryCount(0)
    setCurrentImageUrl(pictureUrl)
    
    // Check if we have a cached avatar
    if (userEmail) {
      const cached = AvatarCache.getCachedAvatar(userEmail)
      setCachedAvatar(cached)
      
      if (cached) {
        setImageLoading(false)
        setImageError(false)
      }
    } else {
      setCachedAvatar(null)
    }
  }, [pictureUrl, userEmail])

  // Listen for global avatar cache events
  useEffect(() => {
    if (!userEmail) return

    const handleAvatarCached = (event: CustomEvent) => {
      const { userEmail: cachedUserEmail, base64 } = event.detail
      if (cachedUserEmail === userEmail && base64 && !cachedAvatar) {
        setCachedAvatar(base64)
        setImageLoading(false)
        setImageError(false)
      }
    }

    window.addEventListener('avatarCached', handleAvatarCached as EventListener)

    return () => {
      window.removeEventListener('avatarCached', handleAvatarCached as EventListener)
    }
  }, [userEmail, cachedAvatar])

  const handleImageError = useCallback(() => {
    if (retryCount < 2 && pictureUrl) {
      // Try different variations of the URL
      setRetryCount(prev => prev + 1)
      setImageLoading(true)
      
      if (retryCount === 0 && pictureUrl.includes('googleusercontent.com')) {
        // First retry: try without size parameter
        const urlWithoutSize = pictureUrl.replace(/[?&]s=\d+/g, '').replace(/[?&]sz=\d+/g, '')
        setCurrentImageUrl(urlWithoutSize)
        return
      } else if (retryCount === 1 && pictureUrl.includes('googleusercontent.com')) {
        // Second retry: try with different size
        const baseUrl = pictureUrl.replace(/[?&]s=\d+/g, '').replace(/[?&]sz=\d+/g, '')
        const separator = baseUrl.includes('?') ? '&' : '?'
        setCurrentImageUrl(`${baseUrl}${separator}s=128`)
        return
      }
    }
    
    setImageError(true)
    setImageLoading(false)
  }, [pictureUrl, retryCount])

  const handleImageLoad = useCallback(() => {
    setImageLoading(false)
    setImageError(false)
    
    // Cache the successfully loaded image
    if (userEmail && currentImageUrl && !cachedAvatar) {
      AvatarCache.cacheAvatar(userEmail, currentImageUrl).then(base64 => {
        if (base64) {
          setCachedAvatar(base64)
        }
      })
    }
  }, [userEmail, currentImageUrl, cachedAvatar])

  // Preload image to test if it's accessible
  useEffect(() => {
    if (!currentImageUrl) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.referrerPolicy = 'no-referrer'
    
    const timeout = setTimeout(() => {
      handleImageError()
    }, 5000) // 5 second timeout

    img.onload = () => {
      clearTimeout(timeout)
      setImageLoading(false)
      setImageError(false)
    }

    img.onerror = () => {
      clearTimeout(timeout)
      handleImageError()
    }

    img.src = currentImageUrl

    return () => {
      clearTimeout(timeout)
    }
  }, [currentImageUrl, handleImageError])

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

  // Get user initials as fallback
  const getUserInitials = useCallback(() => {
    const name = getUserName()
    const email = userEmail
    
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
  }, [getUserName, userEmail])

  const name = getUserName()
  const email = userEmail
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
        imageError,
        imageLoading,
        userKeys: user ? Object.keys(user) : 'no user',
        tokenPayload: user?.signInUserSession?.idToken?.payload
      })
    }
  }, [user, pictureUrl, name, email, initials, imageError, imageLoading])

  // Determine which image source to use (prioritize cached avatar)
  const finalImageSrc = cachedAvatar || currentImageUrl
  const shouldShowImage = finalImageSrc && !imageError

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 relative ${showBorder ? `border-2 ${borderColor}` : ''} ${className}`}>
      {shouldShowImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={finalImageSrc} 
            alt={name || email || 'Usuario'} 
            className={`w-full h-full object-cover rounded-full transition-opacity duration-200 ${imageLoading && !cachedAvatar ? 'opacity-0' : 'opacity-100'}`}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            loading="eager"
            onError={cachedAvatar ? undefined : handleImageError}
            onLoad={cachedAvatar ? undefined : handleImageLoad}
          />
          {imageLoading && !cachedAvatar && (
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
      
      {/* Status indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-opacity-80 rounded-full text-xs flex items-center justify-center text-white font-bold">
          {cachedAvatar ? (
            <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center">📁</div>
          ) : imageError ? (
            <div className="w-full h-full bg-red-500 rounded-full flex items-center justify-center">❌</div>
          ) : retryCount > 0 ? (
            <div className="w-full h-full bg-yellow-500 rounded-full flex items-center justify-center">{retryCount}</div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default UserAvatar