interface HRIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const HRIcon: React.FC<HRIconProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center relative`}>
      {/* Main SVG based on original design */}
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        fill="none"
      >
        {/* Person body - light blue shirt */}
        <path 
          d="M30 65 L30 85 L70 85 L70 65 L65 60 L35 60 Z" 
          fill="#A7D8FF" 
          stroke="#1E40AF" 
          strokeWidth="1"
        />
        
        {/* Person collar - darker blue */}
        <path 
          d="M35 60 L40 55 L60 55 L65 60 L60 65 L40 65 Z" 
          fill="#60A5FA" 
          stroke="#1E40AF" 
          strokeWidth="1"
        />
        
        {/* Person head - skin tone */}
        <circle 
          cx="50" 
          cy="40" 
          r="12" 
          fill="#FBBF7A" 
          stroke="#1E40AF" 
          strokeWidth="1"
        />
        
        {/* Hair - black */}
        <path 
          d="M38 32 Q50 25 62 32 Q62 28 50 28 Q38 28 38 32" 
          fill="#1F2937"
        />
        
        {/* HR Speech bubble - large and prominent */}
        <circle 
          cx="75" 
          cy="25" 
          r="18" 
          fill="#F3F4F6" 
          stroke="#6B7280" 
          strokeWidth="1.5"
        />
        
        {/* HR text */}
        <text 
          x="75" 
          y="30" 
          textAnchor="middle" 
          fontSize="12" 
          fontWeight="bold" 
          fill="#1F2937"
          fontFamily="Arial, sans-serif"
        >
          HR
        </text>
        
        {/* Speech bubble tail */}
        <path 
          d="M60 35 L65 30 L60 25" 
          fill="#F3F4F6" 
          stroke="#6B7280" 
          strokeWidth="1.5"
        />
      </svg>
    </div>
  )
}

export default HRIcon