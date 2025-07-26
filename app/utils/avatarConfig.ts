// Configuration for avatar handling
export const AVATAR_CONFIG = {
  // Timeouts
  LOAD_TIMEOUT: 8000,
  FALLBACK_DELAY: 2000,
  MOBILE_FALLBACK_DELAY: 1500,
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Cache settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // Image optimization
  GOOGLE_IMAGE_SIZE: 96,
  
  // Mobile detection
  MOBILE_BREAKPOINT: 768,
}

// Utility to detect mobile
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < AVATAR_CONFIG.MOBILE_BREAKPOINT
}

// Utility to ensure HTTPS for Google image URLs (don't modify structure)
export const optimizeGoogleImageUrl = (url: string): string => {
  // Only ensure HTTPS, don't modify the URL structure to avoid 400 errors
  return url.replace(/^http:/, 'https:')
}

// Utility to get fallback delay based on device
export const getFallbackDelay = (): number => {
  return isMobileDevice() ? AVATAR_CONFIG.MOBILE_FALLBACK_DELAY : AVATAR_CONFIG.FALLBACK_DELAY
}