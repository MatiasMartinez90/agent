import { useState, useRef } from 'react'

interface AudioTestProps {
  audioBlob?: Blob
}

const AudioTest: React.FC<AudioTestProps> = ({ audioBlob }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const createAudioUrl = () => {
    if (audioBlob) {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)
      console.log('Test audio URL created:', url)
    }
  }

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true)
          console.log('Audio playback started')
        })
        .catch(error => {
          console.error('Audio playback failed:', error)
        })
    }
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  return (
    <div className="p-4 bg-slate-700 rounded-lg">
      <h3 className="text-white font-semibold mb-2">Audio Test</h3>
      
      {audioBlob && (
        <div className="space-y-2">
          <div className="text-sm text-gray-300">
            Blob size: {audioBlob.size} bytes<br/>
            Blob type: {audioBlob.type}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={createAudioUrl}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
            >
              Create URL
            </button>
            
            <button
              onClick={playAudio}
              disabled={!audioUrl}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-50"
            >
              Play
            </button>
            
            <button
              onClick={stopAudio}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
              Stop
            </button>
          </div>
          
          {audioUrl && (
            <audio
              ref={audioRef}
              controls
              className="w-full"
              onEnded={() => setIsPlaying(false)}
              onError={(e) => console.error('Audio element error:', e)}
            >
              <source src={audioUrl} type={audioBlob.type} />
            </audio>
          )}
        </div>
      )}
    </div>
  )
}

export default AudioTest