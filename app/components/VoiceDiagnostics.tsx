import { useState, useEffect } from 'react'

interface VoiceDiagnosticsProps {
  show?: boolean
  onClose?: () => void
}

const VoiceDiagnostics: React.FC<VoiceDiagnosticsProps> = ({ 
  show = false, 
  onClose 
}) => {
  const [diagnostics, setDiagnostics] = useState<any>({})

  useEffect(() => {
    if (show) {
      runDiagnostics()
    }
  }, [show])

  const runDiagnostics = async () => {
    const results: any = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      protocol: window.location.protocol,
      host: window.location.host,
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      screenSize: `${window.screen.width}x${window.screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
    }

    // Check API support
    results.mediaDevicesSupport = !!navigator.mediaDevices
    results.getUserMediaSupport = !!navigator.mediaDevices?.getUserMedia
    results.mediaRecorderSupport = !!window.MediaRecorder

    // Check permissions
    try {
      if (navigator.permissions) {
        const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        results.microphonePermission = micPermission.state
      } else {
        results.microphonePermission = 'API not available'
      }
    } catch (error) {
      results.microphonePermission = 'Error checking permission'
    }

    // Check supported formats
    if (window.MediaRecorder) {
      const formats = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav'
      ]
      
      results.supportedFormats = formats.map(format => ({
        format,
        supported: MediaRecorder.isTypeSupported(format)
      }))
    }

    // Test microphone access
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      results.microphoneAccess = 'Success'
      results.audioTracks = stream.getAudioTracks().length
      
      // Get audio track settings
      if (stream.getAudioTracks().length > 0) {
        const track = stream.getAudioTracks()[0]
        results.trackSettings = track.getSettings()
        results.trackCapabilities = track.getCapabilities()
      }
      
      // Clean up
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      results.microphoneAccess = `Error: ${error}`
    }

    setDiagnostics(results)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-white font-semibold">Voice Diagnostics</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {Object.entries(diagnostics).map(([key, value]) => (
            <div key={key} className="border-b border-slate-700 pb-2">
              <div className="text-blue-400 font-medium text-sm uppercase tracking-wide">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-gray-300 text-sm mt-1 font-mono">
                {typeof value === 'object' ? (
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  String(value)
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={runDiagnostics}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Run Again
          </button>
        </div>
      </div>
    </div>
  )
}

export default VoiceDiagnostics