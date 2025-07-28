/**
 * Avatar cache utility to store working avatar URLs and convert to base64
 */

interface CachedAvatar {
  url: string
  base64: string
  timestamp: number
  userEmail: string
}

const CACHE_KEY = 'avatar_cache'
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export class AvatarCache {
  static getCache(): Record<string, CachedAvatar> {
    if (typeof window === 'undefined') return {}
    
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      return cached ? JSON.parse(cached) : {}
    } catch (error) {
      return {}
    }
  }

  static setCache(cache: Record<string, CachedAvatar>): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    } catch (error) {
      // Silent fail for localStorage errors
    }
  }

  static async cacheAvatar(userEmail: string, imageUrl: string): Promise<string | null> {
    if (!userEmail || !imageUrl) return null

    try {
      // Convert image to base64
      const base64 = await this.imageToBase64(imageUrl)
      if (!base64) return null

      const cache = this.getCache()
      cache[userEmail] = {
        url: imageUrl,
        base64,
        timestamp: Date.now(),
        userEmail
      }

      // Clean old entries
      this.cleanExpiredCache(cache)
      this.setCache(cache)

      return base64
    } catch (error) {
      return null
    }
  }

  static getCachedAvatar(userEmail: string): string | null {
    if (!userEmail) return null

    const cache = this.getCache()
    const cached = cache[userEmail]

    if (!cached) return null

    // Check if expired
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      delete cache[userEmail]
      this.setCache(cache)
      return null
    }

    return cached.base64
  }

  static async imageToBase64(imageUrl: string): Promise<string | null> {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.referrerPolicy = 'no-referrer'

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      img.onload = () => {
        try {
          canvas.width = 96
          canvas.height = 96
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, 96, 96)
            const base64 = canvas.toDataURL('image/jpeg', 0.8)
            resolve(base64)
          } else {
            resolve(null)
          }
        } catch (error) {
          resolve(null)
        }
      }

      img.onerror = () => resolve(null)
      
      // Timeout after 10 seconds
      setTimeout(() => resolve(null), 10000)
      
      img.src = imageUrl
    })
  }

  static cleanExpiredCache(cache: Record<string, CachedAvatar>): void {
    const now = Date.now()
    
    Object.keys(cache).forEach(key => {
      if (now - cache[key].timestamp > CACHE_DURATION) {
        delete cache[key]
      }
    })
  }

  static clearCache(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(CACHE_KEY)
    } catch (error) {
      // Silent fail
    }
  }
}