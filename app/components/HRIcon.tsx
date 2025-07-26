interface HRIconProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const HRIcon: React.FC<HRIconProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-10 h-10'
  }

  const bubbleSizes = {
    sm: 'px-1 py-0.5 text-xs',
    md: 'px-1.5 py-0.5 text-xs',
    lg: 'px-2 py-1 text-sm'
  }

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center relative`}>
      {/* Person silhouette with gradient */}
      <svg 
        viewBox="0 0 24 24" 
        className="w-full h-full"
        fill="none"
      >
        <defs>
          <linearGradient id="personGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        
        {/* Head */}
        <circle cx="12" cy="7" r="3" fill="url(#personGradient)" />
        {/* Body */}
        <path d="M12 14c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z" fill="url(#personGradient)" />
      </svg>
      
      {/* HR Speech bubble with better styling */}
      <div className={`absolute -top-1 -right-1 bg-white rounded-full ${bubbleSizes[size]} border border-gray-200 shadow-lg`}>
        <span className="font-bold text-gray-800">HR</span>
      </div>
      
      {/* Small speech bubble tail */}
      <div className="absolute top-1 right-2 w-0 h-0 border-l-2 border-l-transparent border-r-2 border-r-transparent border-t-2 border-t-white"></div>
    </div>
  )
}

export default HRIcon