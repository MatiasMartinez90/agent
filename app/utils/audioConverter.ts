/**
 * Audio conversion utilities for better browser compatibility
 */

export interface AudioConversionResult {
  blob: Blob
  url: string
  originalType: string
  convertedType: string
  success: boolean
  error?: string
}

/**
 * Convert WebM/Opus audio to a more compatible format using Web Audio API
 */
export async function convertAudioForPlayback(audioBlob: Blob): Promise<AudioConversionResult> {
  const originalType = audioBlob.type
  
  try {
    // If it's already a compatible format, return as-is
    if (!originalType.includes('webm') || !originalType.includes('opus')) {
      const url = URL.createObjectURL(audioBlob)
      return {
        blob: audioBlob,
        url,
        originalType,
        convertedType: originalType,
        success: true
      }
    }

    console.log('Converting WebM/Opus audio for better compatibility...')

    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Convert blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer()
    
    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    // Create a new audio buffer with the decoded data
    const numberOfChannels = audioBuffer.numberOfChannels
    const sampleRate = audioBuffer.sampleRate
    const length = audioBuffer.length
    
    // Create offline context for rendering
    const offlineContext = new OfflineAudioContext(numberOfChannels, length, sampleRate)
    
    // Create buffer source
    const source = offlineContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(offlineContext.destination)
    source.start(0)
    
    // Render the audio
    const renderedBuffer = await offlineContext.startRendering()
    
    // Convert back to blob using a more compatible format
    const convertedBlob = await audioBufferToBlob(renderedBuffer)
    const url = URL.createObjectURL(convertedBlob)
    
    console.log('Audio conversion successful:', {
      originalSize: audioBlob.size,
      convertedSize: convertedBlob.size,
      originalType,
      convertedType: convertedBlob.type
    })
    
    return {
      blob: convertedBlob,
      url,
      originalType,
      convertedType: convertedBlob.type,
      success: true
    }
    
  } catch (error) {
    console.error('Audio conversion failed:', error)
    
    // Fallback: try to create URL with modified MIME type
    try {
      const fallbackBlob = new Blob([audioBlob], { type: 'audio/webm' })
      const url = URL.createObjectURL(fallbackBlob)
      
      return {
        blob: fallbackBlob,
        url,
        originalType,
        convertedType: 'audio/webm',
        success: true,
        error: `Conversion failed, using fallback: ${error}`
      }
    } catch (fallbackError) {
      return {
        blob: audioBlob,
        url: '',
        originalType,
        convertedType: originalType,
        success: false,
        error: `Both conversion and fallback failed: ${error}`
      }
    }
  }
}

/**
 * Convert AudioBuffer to Blob using WAV format for maximum compatibility
 */
async function audioBufferToBlob(audioBuffer: AudioBuffer): Promise<Blob> {
  const numberOfChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const length = audioBuffer.length
  
  // Create WAV file
  const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2)
  const view = new DataView(arrayBuffer)
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
  
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + length * numberOfChannels * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numberOfChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numberOfChannels * 2, true)
  view.setUint16(32, numberOfChannels * 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, length * numberOfChannels * 2, true)
  
  // Convert float samples to 16-bit PCM
  let offset = 44
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]))
      view.setInt16(offset, sample * 0x7FFF, true)
      offset += 2
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

/**
 * Test if audio can be played in the current browser
 */
export function testAudioPlayback(audioBlob: Blob): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio()
    const url = URL.createObjectURL(audioBlob)
    
    const cleanup = () => {
      URL.revokeObjectURL(url)
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('error', onError)
    }
    
    const onCanPlay = () => {
      cleanup()
      resolve(true)
    }
    
    const onError = () => {
      cleanup()
      resolve(false)
    }
    
    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('error', onError)
    audio.src = url
    
    // Timeout after 3 seconds
    setTimeout(() => {
      cleanup()
      resolve(false)
    }, 3000)
  })
}