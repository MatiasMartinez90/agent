import { useState, useEffect } from 'react'
import { useVoiceRecording } from '../hooks/useVoiceRecording'
import LoadingSpinner from './ui/LoadingSpinner'

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
  const [isProcessing, setIsProcessing] = useState(false)

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
      setIsProcessing(true)
      onSendVoice(audioBlob, duration)
    },
    onError: (error) => {
      console.error('Voice recording error:', error)
      setShowRecordingUI(false)
    },
    maxDuration: 300 // 5 minutes
  })

  // Handle processing state
  useEffect(() => {
    if (disabled && isRecording) {
      setIsProcessing(true)
    } else if (!disabled) {
      setIsProcessing(false)
    }
  }, [disabled, isRecording])

  const handleStartRecording = async () => {
    await startRecording()
  }

  const handleStopRecording = () => {
    stopRecording()
  }

  const handleCancelRecording = () => {
    // Cancel the recording first
    cancelRecording()

    // Immediately hide the recording UI
    setShowRecordingUI(false)

    // Notify parent that recording is cancelled (this will show the text input again)
    onRecordingStateChange?.(false)
  }

  // Sync recording UI with actual recording state
  useEffect(() => {
    if (isRecording && !showRecordingUI) {
      // Recording started, show UI
      setShowRecordingUI(true)
    } else if (!isRecording && showRecordingUI) {
      // Recording stopped/cancelled, hide UI immediately
      setShowRecordingUI(false)
    }
  }, [isRecording, showRecordingUI])

  // Notify parent component of recording state changes
  useEffect(() => {
    onRecordingStateChange?.(showRecordingUI)
  }, [showRecordingUI, onRecordingStateChange])

  if (!isSupported) {
    return null // Don't show voice recorder if not supported
  }

  // Show processing state
  if (isProcessing) {
    return (
      <div className={`flex items-center space-x-2 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 ${className}`}>
        <LoadingSpinner 
          size="sm" 
          text="Enviando audio..."
          variant="pulse"
        />
      </div>
    )
  }

  if (showRecordingUI) {
    return (
      <div className={`flex items-center space-x-3 p-3 rounded-2xl w-full bg-red-500/10 border border-red-500/30 ${className}`}>
        {/* Recording indicator */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-400 text-sm font-medium whitespace-nowrap">
            {formatDuration(duration)}
          </span>
        </div>

        {/* Waveform visualization - CSS Grid that works */}
        <div className="flex-1 px-2">
          <div
            className="grid items-center justify-items-center h-6 w-full"
            style={{ gridTemplateColumns: 'repeat(50, minmax(0, 1fr))', gap: '1px' }}
          >
            {[...Array(50)].map((_, i) => {
              const progressPercentage = Math.min((duration / 60) * 100, 100)
              const isActive = i < (progressPercentage / 100) * 50
              const baseHeight = Math.max(4, 8 + (i % 5) * 4 + (i % 7) * 2)
              return (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-200 ${isActive ? 'bg-red-400' : 'bg-red-400/30'
                    }`}
                  style={{
                    width: '2px',
                    height: `${baseHeight}px`
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Cancel button */}
          <button
            onClick={handleCancelRecording}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            title="Cancelar grabación"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Send button */}
          <button
            onClick={handleStopRecording}
            disabled={duration < 1}
            className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="Enviar audio"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      className={`p-3 text-gray-400 hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title="Grabar audio"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </button>
  )
}

export default VoiceRecorder