import { useState } from 'react'

interface AvatarImageProps {
  src: string
  alt: string
  className?: string
  onLoad?: () => void
  onError?: () => void
}

// Component specifically for avatar images that need special handling
// Uses regular img tag with proper CORS settings for Google OAuth avatars
const AvatarImage: React.FC<AvatarImageProps> = ({
  src,
  alt,
  className = '',
  onLoad,
  onError
}) => {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      loading="eager"
      draggable={false}
      onLoad={onLoad}
      onError={onError}
    />
  )
}

export default AvatarImage