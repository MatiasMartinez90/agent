import { useState, useEffect } from 'react'

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
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

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

  // Reset error state when user changes
  useEffect(() => {
    setImageError(false)
    setImageLoading(true)
  }, [user?.picture])

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log('Error loading user image:', getUserPicture(), e)
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    console.log('User image loaded successfully:', getUserPicture())
    setImageLoading(false)
  }

  // Get user picture from different possible sources
  const getUserPicture = () => {
    // Try different sources for the picture
    if (user?.picture) return user.picture
    if (user?.signInUserSession?.idToken?.payload?.picture) return user.signInUserSession.idToken.payload.picture
    if (user?.attributes?.picture) return user.attributes.picture
    return null
  }

  // Get user name from different possible sources
  const getUserName = () => {
    if (user?.name) return user.name
    if (user?.signInUserSession?.idToken?.payload?.name) return user.signInUserSession.idToken.payload.name
    if (user?.attributes?.name) return user.attributes.name
    if (user?.signInUserSession?.idToken?.payload?.given_name) return user.signInUserSession.idToken.payload.given_name
    return null
  }

  // Get user email from different possible sources
  const getUserEmail = () => {
    if (user?.email) return user.email
    if (user?.signInUserSession?.idToken?.payload?.email) return user.signInUserSession.idToken.payload.email
    if (user?.attributes?.email) return user.attributes.email
    return null
  }

  // Get user initials as fallback
  const getUserInitials = () => {
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
  }

  const picture = getUserPicture()
  const name = getUserName()
  const email = getUserEmail()

  // Debug logging
  useEffect(() => {
    console.log('UserAvatar Debug:', {
      user,
      picture,
      name,
      email,
      userKeys: user ? Object.keys(user) : 'no user',
      tokenPayload: user?.signInUserSession?.idToken?.payload
    })
  }, [user, picture, name, email])

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 relative ${showBorder ? `border-2 ${borderColor}` : ''} ${className}`}>
      {picture && !imageError ? (
        <>
          <img 
            src={picture} 
            alt={name || email || 'Usuario'} 
            className="w-full h-full object-cover rounded-full"
            referrerPolicy="no-referrer"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            </div>
          )}
        </>
      ) : (
        <span className={`text-white font-medium ${textSizes[size]}`}>
          {getUserInitials()}
        </span>
      )}
    </div>
  )
}

export default UserAvatar