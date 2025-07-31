import { useState, useEffect } from 'react'
import { useVoiceRecording } from '../hooks/useVoiceRecording'

interface VoiceRecorderProps {
  onSendVoice: (audioBlob: Blob, duration: number) => void
  disabled?: boolean
  className?: string
  onRecordingStateChange?: (isRecording: boolean) => void
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSendVoice,
  disabled = false,
  className = '',
  onRecordingStateChange
}) => {
  const [showRecordingUI, setShowRecordingUI] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768
      setIsMobile(mobile)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  const {
    isRecording,
    duration,
    isSupported,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    formatDuration
  } = useVoiceRecording({
    onRecordingComplete: (audioBlob, duration) => {
      setShowRecordingUI(false)
      onSendVoice(audioBlob, duration)
    },
    onError: (error) => {
      console.error('Voice recording error:', error)
      setShowRecordingUI(false)
    },
    maxDuration: 300 // 5 minutes
  })

  const handleStartRecording = async () => {
    await startRecording()
  }

  const handleStopRecording = () => {
    stopRecording()
  }

  const handleCancelRecording = () => {
    cancelRecording()
    setShowRecordingUI(false)
  }

  // Sync recording UI with actual recording state
  useEffect(() => {
    if (isRecording && !showRecordingUI) {
      // Recording started, show UI
      setShowRecordingUI(true)
    } else if (!isRecording && showRecordingUI) {
      // Recording stopped, hide UI after a brief delay
      const timer = setTimeout(() => {
        setShowRecordingUI(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isRecording, showRecordingUI])

  // Notify parent component of recording state changes
  useEffect(() => {
    onRecordingStateChange?.(showRecordingUI)
  }, [showRecordingUI, onRecordingStateChange])

  if (!isSupported) {
    return null // Don't show voice recorder if not supported
  }

  if (showRecordingUI) {
    return (
      <div className={`flex items-center ${isMobile ? 'space-x-2 px-3 py-2' : 'space-x-3 px-4 py-3'} bg-red-500/10 border border-red-500/30 rounded-2xl w-full min-w-[400px] ${className}`}>
        {/* Recording indicator */}
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <div className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} bg-red-500 rounded-full animate-pulse`}></div>
          <span className={`text-red-400 ${isMobile ? 'text-xs' : 'text-sm'} font-medium whitespace-nowrap`}>
            {formatDuration(duration)}
          </span>
        </div>

        {/* Progressive waveform */}
        <div className="flex-1">
          <div className="flex items-center space-x-px h-6 flex-1 min-w-0">
            {[...Array(50)].map((_, i) => {
            // Calculate if this bar should be filled based on recording progress
            const progressPercentage = (duration / 60) * 100 // Assuming 60 seconds max for visual
            const filledBars = Math.floor((progressPercentage / 100) * 50)
            const isFilled = i < filledBars
            
            // Use same height logic as VoiceMessage for consistency
            const baseHeight = Math.max(4, 8 + (i % 5) * 4 + (i % 7) * 2)
            
            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isFilled ? 'bg-red-400' : 'bg-red-400/30'
                }`}
                style={{
                  height: `${baseHeight}px`
                }}
              />
            )
          })}
          </div>
        </div>

        {/* Action buttons */}
        <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'} flex-shrink-0`}>
          {/* Cancel button */}
          <button
            onClick={handleCancelRecording}
            className={`${isMobile ? 'p-1.5' : 'p-2'} text-gray-400 hover:text-red-400 transition-colors`}
            title="Cancelar grabación"
          >
            <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Send button */}
          <button
            onClick={handleStopRecording}
            disabled={duration < 1} // Minimum 1 second
            className={`${isMobile ? 'p-1.5' : 'p-2'} bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
            title="Enviar audio"
          >
            <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleStartRecording}
      disabled={disabled}
      className={`${isMobile ? 'p-4' : 'p-3'} text-gray-400 hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={isMobile ? "Toca para grabar audio" : "Mantén presionado para grabar audio"}
    >
      <svg className={`${isMobile ? 'w-7 h-7' : 'w-6 h-6'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </button>
  )
}

export default VoiceRecorder