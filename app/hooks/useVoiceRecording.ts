import { useState, useRef, useCallback } from 'react'

interface UseVoiceRecordingOptions {
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void
  onError?: (error: string) => void
  maxDuration?: number // in seconds
}

interface VoiceRecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  isSupported: boolean
  error: string | null
}

export const useVoiceRecording = (options: UseVoiceRecordingOptions = {}) => {
  const { onRecordingComplete, onError, maxDuration = 300 } = options // 5 min max
  
  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    isSupported: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
    error: null
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const updateDuration = useCallback(() => {
    if (startTimeRef.current) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      setState(prev => ({ ...prev, duration: elapsed }))
      
      // Auto-stop at max duration
      if (elapsed >= maxDuration) {
        stopRecording()
      }
    }
  }, [maxDuration])

  const startRecording = useCallback(async () => {
    if (!state.isSupported) {
      const error = 'Voice recording is not supported in this browser'
      setState(prev => ({ ...prev, error }))
      onError?.(error)
      return
    }

    try {
      setState(prev => ({ ...prev, error: null }))
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      })
      
      streamRef.current = stream
      chunksRef.current = []

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      })
      
      mediaRecorderRef.current = mediaRecorder

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { 
          type: mediaRecorder.mimeType 
        })
        
        const duration = state.duration
        onRecordingComplete?.(audioBlob, duration)
        
        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      // Start recording
      mediaRecorder.start(100) // Collect data every 100ms
      startTimeRef.current = Date.now()
      
      setState(prev => ({ 
        ...prev, 
        isRecording: true, 
        isPaused: false, 
        duration: 0 
      }))

      // Start duration timer
      durationIntervalRef.current = setInterval(updateDuration, 100)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording'
      setState(prev => ({ ...prev, error: errorMessage }))
      onError?.(errorMessage)
    }
  }, [state.isSupported, onRecordingComplete, onError, updateDuration, state.duration])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop()
      
      setState(prev => ({ 
        ...prev, 
        isRecording: false, 
        isPaused: false 
      }))

      // Clear duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }
    }
  }, [state.isRecording])

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      // Stop recording without calling onRecordingComplete
      mediaRecorderRef.current.stop()
      
      setState(prev => ({ 
        ...prev, 
        isRecording: false, 
        isPaused: false, 
        duration: 0 
      }))

      // Clear duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }

      // Cleanup stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [state.isRecording])

  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    ...state,
    startRecording,
    stopRecording,
    cancelRecording,
    formatDuration
  }
}