import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  variant?: 'default' | 'dots' | 'pulse' | 'bars'
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  variant = 'default',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        )
      
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} bg-blue-400 rounded-full animate-pulse`}></div>
        )
      
      case 'bars':
        return (
          <div className="flex space-x-1 items-end">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-blue-400 rounded-full animate-pulse"
                style={{
                  height: `${12 + (i % 2) * 8}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )
      
      default:
        return (
          <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-slate-600 border-t-blue-400`}></div>
        )
    }
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {renderSpinner()}
      {text && (
        <span className={`text-slate-300 ${textSizeClasses[size]}`}>
          {text}
        </span>
      )}
    </div>
  )
}

export default LoadingSpinner