import { useState, useRef, useEffect } from 'react'

interface VoiceMessageProps {
  audioBlob?: Blob
  audioUrl?: string
  duration: number
  isUser: boolean
  timestamp: Date
  className?: string
}

const VoiceMessage: React.FC<VoiceMessageProps> = ({
  audioBlob,
  audioUrl,
  duration,
  isUser,
  timestamp,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioSrc, setAudioSrc] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Create audio URL from blob or use provided URL
  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      setAudioSrc(url)
      return () => URL.revokeObjectURL(url)
    } else if (audioUrl) {
      setAudioSrc(audioUrl)
    }
  }, [audioBlob, audioUrl])

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [audioSrc])

  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-2xl min-w-[200px] ${
      isUser 
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
        : 'bg-slate-700 text-gray-100 border border-slate-600'
    } ${className}`}>
      {/* Audio element */}
      {audioSrc && (
        <audio ref={audioRef} src={audioSrc} preload="metadata" />
      )}

      {/* Play/Pause button */}
      <button
        onClick={togglePlayback}
        disabled={!audioSrc}
        className={`p-2 rounded-full transition-colors ${
          isUser
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-slate-600 hover:bg-slate-500 text-gray-300'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>

      {/* Waveform and progress */}
      <div className="flex-1">
        {/* Progress bar */}
        <div className={`w-full h-1 rounded-full mb-1 ${
          isUser ? 'bg-white/20' : 'bg-slate-600'
        }`}>
          <div
            className={`h-full rounded-full transition-all duration-100 ${
              isUser ? 'bg-white' : 'bg-blue-400'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Waveform visualization (simplified) */}
        <div className="flex items-center space-x-0.5 h-6">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={`w-0.5 rounded-full transition-all duration-100 ${
                i < (progressPercentage / 100) * 30
                  ? isUser ? 'bg-white' : 'bg-blue-400'
                  : isUser ? 'bg-white/30' : 'bg-slate-500'
              }`}
              style={{
                height: `${Math.sin(i * 0.5) * 10 + 15}px`
              }}
            />
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className={`text-xs ${isUser ? 'text-white/70' : 'text-gray-400'}`}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      {/* Timestamp */}
      <div className={`text-xs ${isUser ? 'text-white/50' : 'text-gray-500'}`}>
        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  )
}

export default VoiceMessage