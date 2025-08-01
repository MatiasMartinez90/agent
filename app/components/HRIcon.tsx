interface HRIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
}

const HRIcon: React.FC<HRIconProps> = ({ size = 'md', className = '', showText = true }) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8', 
    lg: 'h-12',
    xl: 'h-16'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
  }

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center space-x-2`}>
      {/* Chat Bot Icon */}
      <div className="relative">
        <svg 
          viewBox="0 0 100 100" 
          className={`${sizeClasses[size]} w-auto`}
          fill="none"
        >
          {/* Chat bubble body with gradient */}
          <defs>
            <linearGradient id="chatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          
          {/* Main chat bubble */}
          <path 
            d="M20 25 L75 25 Q85 25 85 35 L85 55 Q85 65 75 65 L35 65 L20 75 L20 35 Q20 25 30 25 Z" 
            fill="url(#chatGradient)" 
            stroke="none"
          />
          
          {/* Eyes */}
          <circle cx="40" cy="45" r="4" fill="white" />
          <circle cx="60" cy="45" r="4" fill="white" />
          
          {/* Antenna */}
          <circle cx="52.5" cy="15" r="3" fill="url(#chatGradient)" />
          <line x1="52.5" y1="25" x2="52.5" y2="18" stroke="url(#chatGradient)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      
      {/* Text */}
      {showText && (
        <div className="flex items-baseline space-x-1">
          <span className={`font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent ${textSizes[size]}`}>
            AI
          </span>
          <span className={`font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent ${textSizes[size]}`}>
            Interview
          </span>
        </div>
      )}
    </div>
  )
}

export default HRIcon