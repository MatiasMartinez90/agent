// Simple in-memory cache for avatar images
class ImageCache {
  private cache = new Map<string, { blob: Blob; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  async get(url: string): Promise<string | null> {
    const cached = this.cache.get(url)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return URL.createObjectURL(cached.blob)
    }
    
    // Remove expired entry
    if (cached) {
      this.cache.delete(url)
      URL.revokeObjectURL(URL.createObjectURL(cached.blob))
    }
    
    return null
  }

  async set(url: string, blob: Blob): Promise<void> {
    // Clean up old entries first
    this.cleanup()
    
    this.cache.set(url, {
      blob,
      timestamp: Date.now()
    })
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [url, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.CACHE_DURATION) {
        this.cache.delete(url)
        URL.revokeObjectURL(URL.createObjectURL(entry.blob))
      }
    }
  }

  clear(): void {
    for (const [, entry] of this.cache.entries()) {
      URL.revokeObjectURL(URL.createObjectURL(entry.blob))
    }
    this.cache.clear()
  }
}

export const imageCache = new ImageCache()

// Utility function to fetch and cache image
export async function fetchAndCacheImage(url: string): Promise<string> {
  // Check cache first
  const cachedUrl = await imageCache.get(url)
  if (cachedUrl) {
    return cachedUrl
  }

  // Fetch image
  const response = await fetch(url, {
    mode: 'cors',
    credentials: 'omit',
    referrerPolicy: 'no-referrer'
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`)
  }

  const blob = await response.blob()
  await imageCache.set(url, blob)
  
  return URL.createObjectURL(blob)
}