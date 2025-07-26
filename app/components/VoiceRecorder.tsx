import { useState, useEffect } from 'react'
import { useVoiceRecording } from '../hooks/useVoiceRecording'

interface VoiceRecorderProps {
  onSendVoice: (audioBlob: Blob, duration: number) => void
  disabled?: boolean
  className?: string
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSendVoice,
  disabled = false,
  className = ''
}) => {
  const [showRecordingUI, setShowRecordingUI] = useState(false)
  
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
    setShowRecordingUI(true)
    await startRecording()
  }

  const handleStopRecording = () => {
    stopRecording()
  }

  const handleCancelRecording = () => {
    cancelRecording()
    setShowRecordingUI(false)
  }

  // Auto-hide recording UI if recording stops unexpectedly
  useEffect(() => {
    if (!isRecording && showRecordingUI) {
      const timer = setTimeout(() => {
        setShowRecordingUI(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isRecording, showRecordingUI])

  if (!isSupported) {
    return null // Don't show voice recorder if not supported
  }

  if (showRecordingUI) {
    return (
      <div className={`flex items-center space-x-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 ${className}`}>
        {/* Recording indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-400 text-sm font-medium">
            {formatDuration(duration)}
          </span>
        </div>

        {/* Waveform animation */}
        <div className="flex items-center space-x-1 flex-1">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-red-400 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 20 + 10}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
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
            disabled={duration < 1} // Minimum 1 second
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
      title="Mantén presionado para grabar audio"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </button>
  )
}

export default VoiceRecorder