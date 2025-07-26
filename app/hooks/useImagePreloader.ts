import { useState, useEffect, useCallback } from 'react'
import { fetchAndCacheImage } from '../utils/imageCache'

interface UseImagePreloaderOptions {
  maxRetries?: number
  retryDelay?: number
  timeout?: number
  useCache?: boolean
}

interface ImageState {
  loaded: boolean
  error: boolean
  loading: boolean
  retryCount: number
  cachedUrl?: string
}

export const useImagePreloader = (
  src: string | null, 
  options: UseImagePreloaderOptions = {}
) => {
  const { maxRetries = 2, retryDelay = 1000, timeout = 10000, useCache = true } = options
  
  const [state, setState] = useState<ImageState>({
    loaded: false,
    error: false,
    loading: false,
    retryCount: 0
  })

  const preloadImage = useCallback((url: string, retryCount = 0): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        img.onload = null
        img.onerror = null
        reject(new Error('Image load timeout'))
      }, timeout)
      
      img.onload = () => {
        clearTimeout(timeoutId)
        resolve(img.src)
      }
      
      img.onerror = () => {
        clearTimeout(timeoutId)
        reject(new Error('Image load error'))
      }
      
      // Configure image loading
      img.crossOrigin = 'anonymous'
      img.referrerPolicy = 'no-referrer'
      
      // Add cache busting for retries
      const finalUrl = retryCount > 0 ? `${url}&retry=${retryCount}&t=${Date.now()}` : url
      img.src = finalUrl
    })
  }, [timeout])

  const preloadWithCache = useCallback(async (url: string, retryCount = 0): Promise<string> => {
    if (useCache) {
      try {
        return await fetchAndCacheImage(url)
      } catch (error) {
        console.log('Cache fetch failed, falling back to direct load:', error)
        // Fallback to direct image loading
        return await preloadImage(url, retryCount)
      }
    } else {
      return await preloadImage(url, retryCount)
    }
  }, [useCache, preloadImage])

  const loadImage = useCallback(async (url: string) => {
    setState(prev => ({ ...prev, loading: true, error: false, cachedUrl: undefined }))
    
    let currentRetry = 0
    
    while (currentRetry <= maxRetries) {
      try {
        const loadedUrl = await preloadWithCache(url, currentRetry)
        setState({
          loaded: true,
          error: false,
          loading: false,
          retryCount: currentRetry,
          cachedUrl: loadedUrl
        })
        return
      } catch (error) {
        console.log(`Image load attempt ${currentRetry + 1} failed:`, error)
        
        if (currentRetry < maxRetries) {
          setState(prev => ({ ...prev, retryCount: currentRetry + 1 }))
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          currentRetry++
        } else {
          setState({
            loaded: false,
            error: true,
            loading: false,
            retryCount: currentRetry
          })
          return
        }
      }
    }
  }, [maxRetries, retryDelay, preloadWithCache])

  useEffect(() => {
    if (!src) {
      setState({
        loaded: false,
        error: false,
        loading: false,
        retryCount: 0
      })
      return
    }

    loadImage(src)
  }, [src, loadImage])

  const retry = useCallback(() => {
    if (src) {
      loadImage(src)
    }
  }, [src, loadImage])

  return {
    ...state,
    retry
  }
}