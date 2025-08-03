import React from 'react'

interface MessageSkeletonProps {
  isUser?: boolean
  showAvatar?: boolean
  variant?: 'text' | 'voice'
  className?: string
}

const MessageSkeleton: React.FC<MessageSkeletonProps> = ({
  isUser = false,
  showAvatar = true,
  variant = 'text',
  className = ''
}) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${className}`}>
      <div className={`flex items-start space-x-2 sm:space-x-3 max-w-[95%] sm:max-w-2xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar Skeleton */}
        {showAvatar && (
          <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse flex-shrink-0"></div>
        )}

        {/* Message Content Skeleton */}
        {variant === 'voice' ? (
          <div className={`rounded-2xl px-4 py-3 animate-pulse ${
            isUser 
              ? 'bg-blue-600/20' 
              : 'bg-slate-800 border border-slate-700'
          }`}>
            {/* Voice message skeleton */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-600 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-slate-600 rounded w-20"></div>
                <div className="h-2 bg-slate-600 rounded w-16"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`rounded-2xl px-4 py-3 animate-pulse ${
            isUser 
              ? 'bg-blue-600/20' 
              : 'bg-slate-800 border border-slate-700'
          }`}>
            {/* Text message skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-slate-600 rounded w-3/4"></div>
              <div className="h-4 bg-slate-600 rounded w-1/2"></div>
              <div className="h-3 bg-slate-600 rounded w-16 mt-2 opacity-50"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageSkeleton